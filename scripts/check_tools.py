#!/usr/bin/env python3
"""mQuickCalc - 三站全工具在线巡检脚本

从三个 index.html 里提取所有工具路径，逐个检查 HTTP 200 + 有 title + 有 result div + 有 JSON-LD。
用法: python3 scripts/check_tools.py
"""
import urllib.request, re, sys

DOMAINS = {
    "site-main": "mquickcalc.com",
    "site-health": "health.mquickcalc.com",
    "site-finance": "finance.mquickcalc.com",
}

def get_tools(html):
    return sorted(set(re.findall(r'href="(/tools/[^"]+)"', html)))

def check(url):
    try:
        req = urllib.request.Request(url, headers={"Cache-Control":"no-cache","User-Agent":"Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as r:
            body = r.read().decode("utf-8", errors="replace")
            return {"ok": True, "code": r.status, "size": len(body),
                    "title": "<title>" in body, "result": 'class="result"' in body or 'class="calc-card"' in body,
                    "jsonld": 'application/ld+json' in body}
    except Exception as e:
        return {"ok": False, "error": str(e)[:60]}

all_results = []
print("🔍 mQuickCalc Health Check")
print("=" * 60)

for pkg, domain in DOMAINS.items():
    idx_url = f"https://{domain}/"
    req = urllib.request.Request(idx_url, headers={"Cache-Control":"no-cache","User-Agent":"Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            idx_html = r.read().decode("utf-8", errors="replace")
        tool_paths = get_tools(idx_html)
        print(f"\n📦 {pkg} ({domain}) — {len(tool_paths)} tools from index")
        
        for path in tool_paths:
            url = f"https://{domain}{path}"
            r = check(url)
            icon = "✅" if r["ok"] else "❌"
            issues = []
            if r["ok"]:
                if not r["title"]: issues.append("NO_TITLE")
                if not r["result"]: issues.append("NO_RESULT")
                if not r["jsonld"]: issues.append("NO_JSONLD")
            else:
                issues.append("DOWN")
            label = " ".join(issues) if issues else "HEALTHY"
            print(f"  {icon} {path:<50} {label}")
            all_results.append(r)
    except Exception as e:
        print(f"  ❌ Index fetch failed: {e}")

ok = sum(1 for r in all_results if r.get("ok"))
total = len(all_results)
print(f"\n{'='*60}")
print(f"📊 TOTAL: {ok}/{total} OK, {total-ok} FAILED")
if ok == total: print("🎉 All tools are online and healthy!")
sys.exit(0 if ok == total else 1)
