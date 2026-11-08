#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
health 站医学页「保留文件、暂不上线」处置（刘哥 2026-11-08 拍板）。

真相源：tools/held-pages.json —— gen-sitemap.mjs 与 gen-llms.mjs 也读它，
因此 CI 重新生成 sitemap / llms.txt 时不会把暂不上线的页面重新写回去。

本脚本只负责两个产物层动作，全部可逆、幂等：
  1. 目标页加 <meta name="robots" content="noindex, nofollow">
  2. 站内所有指向这些页的 <a> 入口改为 HTML 注释（页面文件本身保留）
sitemap.xml / llms.txt 由 node tools/build.mjs 重新生成，不在本脚本处理。

用法:
    python tools/hold-medical-pages.py            # 暂不上线
    python tools/hold-medical-pages.py --restore  # 恢复上线（并清空 held 清单）
    python tools/hold-medical-pages.py --check    # 只检查，不改动
恢复上线后须重新运行 node tools/build.mjs 使 sitemap / llms.txt 重新收录。
"""

import argparse
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
HEALTH = ROOT / "packages" / "site-health"
HELD_JSON = ROOT / "tools" / "held-pages.json"
PKG = "site-health"
ROBOTS_META = '  <meta name="robots" content="noindex, nofollow">'
MARK_LS, MARK_LE = "<!-- HELD link\n", "\n-->"
COMMENT_RE = re.compile(r"<!-- HELD link\n[\s\S]*?\n-->")


def slugs():
    d = json.loads(HELD_JSON.read_text(encoding="utf-8"))
    return list(d.get(PKG, []))


def link_re(slug_list):
    if not slug_list:
        return None
    return re.compile(
        r'(<a\b[^>]*href=[\'"][^\'"]*/tools/(?:'
        + "|".join(map(re.escape, slug_list))
        + r')[\'"][^>]*>[\s\S]*?</a>)'
    )


def read(p):
    return p.read_text(encoding="utf-8")


def write(p, s):
    p.write_text(s, encoding="utf-8")


def hold(slug_list):
    if not slug_list:
        print("  [SKIP] held-pages.json 中无条目，无需处置")
        return
    n_meta = n_links = 0

    for g in slug_list:
        p = HEALTH / "tools" / (g + ".html")
        if not p.exists():
            print("  [WARN] 缺文件", p.name)
            continue
        s = read(p)
        if 'name="robots"' not in s:
            s2 = re.sub(r"(<head[^>]*>)", r"\1\n" + ROBOTS_META, s, count=1)
            if s2 != s:
                write(p, s2)
                n_meta += 1

    rx = link_re(slug_list)
    for p in sorted(HEALTH.rglob("*.html")):
        s = read(p)
        if MARK_LS in s:
            continue
        s2 = rx.sub(lambda m: MARK_LS + m.group(1) + MARK_LE, s)
        if s2 != s:
            write(p, s2)
            n_links += len(rx.findall(s))

    print("  已处置: noindex %d 页 / 站内入口 %d 处（文件全部保留）" % (n_meta, n_links))


def restore():
    d = json.loads(HELD_JSON.read_text(encoding="utf-8"))
    old = list(d.get(PKG, []))
    for g in old:
        p = HEALTH / "tools" / (g + ".html")
        if p.exists():
            s = read(p)
            write(p, s.replace(ROBOTS_META + "\n", "").replace("\n" + ROBOTS_META, ""))
    for p in sorted(HEALTH.rglob("*.html")):
        s = read(p)
        s2 = COMMENT_RE.sub(lambda m: m.group(0)[len(MARK_LS):-len(MARK_LE)], s)
        if s2 != s:
            write(p, s2)
    d[PKG] = []
    HELD_JSON.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("  已恢复 %d 页：移除 noindex、还原站内入口、清空 held 清单" % len(old))
    print("  下一步：node tools/build.mjs 重新生成 sitemap / llms.txt")


def check():
    slug_list = slugs()
    problems = []
    rx = link_re(slug_list)
    for g in slug_list:
        p = HEALTH / "tools" / (g + ".html")
        if not p.exists():
            problems.append("缺文件 " + p.name)
        elif "noindex" not in read(p):
            problems.append("缺 noindex: " + p.name)
    sm = HEALTH / "sitemap.xml"
    if sm.exists():
        s = read(sm)
        for g in slug_list:
            if re.search(r"<loc>[^<]*/tools/" + re.escape(g) + r"</loc>", s):
                problems.append("sitemap 仍收录 " + g)
    llm = HEALTH / "llms.txt"
    if llm.exists():
        s = read(llm)
        for g in slug_list:
            if ("/tools/" + g) in s and not s.count("# HELD:"):
                problems.append("llms.txt 仍列出 " + g)
    if rx:
        for p in sorted(HEALTH.rglob("*.html")):
            s = COMMENT_RE.sub("", read(p))
            for g in slug_list:
                if re.search(r"<a\b[^>]*href=[\'\"][^\'\"]*/tools/" + re.escape(g) + r"[\'\"]", s):
                    problems.append("仍有入口链接: %s -> %s" % (p.name, g))
    if not slug_list:
        print("  [OK] held 清单为空，四页处于上线状态")
        return 0
    print("  [OK] %d 页均 noindex、sitemap/llms 已撤下、站内入口已撤下" % len(slug_list)
          if not problems else "  [FAIL]\n    " + "\n    ".join(problems))
    return 1 if problems else 0


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--restore", action="store_true")
    ap.add_argument("--check", action="store_true")
    a = ap.parse_args()
    if a.check:
        sys.exit(check())
    if a.restore:
        restore()
    else:
        hold(slugs())
    check()
