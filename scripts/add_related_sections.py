#!/usr/bin/env python3
"""扫描所有工具页面, 检查并补全 related calculators 区块"""
import os, re, sys

BASE = os.path.join(os.path.dirname(__file__), "..", "packages")

# 三站互链: 每个站的主工具
SITE_MAP = {
    "site-main": {
        "primary": ["/tools/percentage-calculator", "/tools/age-calculator", "/tools/date-difference-calculator", "/tools/tip-calculator", "/tools/unit-converter"],
    },
    "site-health": {
        "primary": ["/tools/bmi-calculator", "/tools/ideal-weight-calculator", "/tools/protein-calculator", "/tools/bac-calculator", "/tools/body-type-calculator"],
    },
    "site-finance": {
        "primary": ["/tools/ebay-fee-calculator", "/tools/paypal-fee-calculator", "/tools/stripe-fee-calculator", "/tools/multi-platform-fee-comparison", "/tools/invoice-generator"],
    },
}

total = 0; added = 0
for pkg in SITE_MAP:
    tools_dir = os.path.join(BASE, pkg, "tools")
    for fname in sorted(os.listdir(tools_dir)):
        if not fname.endswith(".html"): continue
        fpath = os.path.join(tools_dir, fname)
        html = open(fpath).read()
        total += 1
        
        if 'related-section' in html or 'Related calculators' in html:
            continue  # 已有
        added += 1
        
        slug = fname.replace(".html","")
        title_match = re.search(r'<title>([^<]+)', html)
        h1_match = re.search(r'<h1[^>]*>([^<]+)', html)
        title = h1_match.group(1) if h1_match else (title_match.group(1) if title_match else slug)
        
        # 从同站 primary list 里选 3 个最不相关的（排除自己）
        siblings = [p for p in SITE_MAP[pkg]["primary"] if slug not in p][:3]
        if not siblings: continue
        
        # 构建 related 区块
        cards_html = "".join(
            f'<a href="{p}" class="tool-card"><div class="icon-row"><span class="emoji">🔗</span><div class="tc-title">{p.split("/")[-1].replace("-"," ").title()}</div></div><div class="tc-desc">Try this tool next.</div></a>'
            for p in siblings
        )
        related = f'<div class="related-section"><h2>Related calculators</h2><div class="tool-grid">{cards_html}</div></div>'
        
        # 在 </main> 前插入, 或在 note "Back to all tools" 之后
        if 'Back to all tools' in html:
            html = html.replace(
                '<p class="note"><a href="/">&larr; Back to all tools</a></p>',
                related + '\n    <p class="note"><a href="/">&larr; Back to all tools</a></p>'
            )
        elif '</main>' in html:
            html = html.replace('</main>', related + '\n</main>')
        
        open(fpath, 'w').write(html)
        print(f"  ✅ +related: {pkg}/tools/{fname}")

print(f"\n📊 扫描 {total} 个工具, 为 {added} 个补了 Related calculators 区块")
