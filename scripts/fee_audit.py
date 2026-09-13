#!/usr/bin/env python3
"""mQuickCalc - 费率巡检脚本

从各 fee calculator HTML 里提取硬编码费率，与已知最新标准对比。
用法: python3 scripts/fee_audit.py [--update]
"""
import re, sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BASE = os.path.join(os.path.dirname(__file__), "..", "packages")

# 期望最新费率 (2026-09)
EXPECTED = {
    # (pkg, filename) -> (regex_pattern, expected_label, source_url)
    ("site-finance", "ebay-fee-calculator.html"): [
        ("MARKETS.*?\"us\".*?rate.*?\"([0-9.]+)\".*?fixed.*?\"([0-9.]+)\"", 
         "MARKETS.us", "13.6% + 0.40", "https://www.ebay.com/help/selling/fees-credits-refunds/final-value-fees?id=4382"),
    ],
    ("site-finance", "paypal-fee-calculator.html"): [
        ("US.*?2\\.99.*?0\\.49", "US Domestic", "2.99% + $0.49", "https://www.paypal.com/us/webapps/mpp/merchant-fees"),
    ],
    ("site-finance", "stripe-fee-calculator.html"): [
        ("2\\.9%.*?\\$0\\.30", "Standard card", "2.9% + $0.30", "https://stripe.com/pricing"),
    ],
    ("site-finance", "shopify-fees-calculator.html"): [
        ("2\\.9%.*?\\$0\\.30", "Shopify Payments", "2.9% + $0.30", "https://www.shopify.com/pricing"),
    ],
}

def extract_fees(pkg, fname):
    fpath = os.path.join(BASE, pkg, "tools", fname)
    if not os.path.exists(fpath):
        return {}
    html = open(fpath).read()
    results = {}
    for pattern, label, expected, source in EXPECTED.get((pkg, fname), []):
        m = re.search(pattern, html, re.DOTALL)
        results[label] = {"pattern": pattern, "expected": expected, "found": bool(m), "match": m.group(0)[:60] if m else "(not found)", "source": source, "fname": fname}
    return results

print("💰 mQuickCalc Fee Rate Audit")
print("=" * 70)
issues = []
for (pkg, fname), _ in EXPECTED.items():
    fees = extract_fees(pkg, fname)
    if fees:
        print(f"\n📄 {pkg}/tools/{fname}")
        for label, info in fees.items():
            status = "✅" if info["found"] else "⚠️  POTENTIAL STALE"
            print(f"  {status} {label}: {info['expected']}")
            if not info["found"]:
                issues.append(info)
                print(f"      找到: {info['match']}")
                print(f"      参考: {info['source']}")

print(f"\n{'='*70}")
if issues:
    print(f"⚠️  发现 {len(issues)} 个费率可能过期 — 需要人工核对")
    for i in issues:
        print(f"  - {i['fname']}: {i['label']} 应为 {i['expected']}")
else:
    print("✅ 所有费率与最新官方标准一致!")
