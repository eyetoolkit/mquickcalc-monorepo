// sync-brand-kit.mjs — 把 brand-kit/{css,js,fonts,matrix.json} 同步到 4 个子站
// 用法：node scripts/sync-brand-kit.mjs [--dry]

import { cpSync, existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const BRAND = join(ROOT, "packages", "brand-kit");
const SITES = ["site-main", "site-finance", "site-health", "site-insurance"];
const CATEGORIES = ["css", "js", "fonts"];

const dry = process.argv.includes("--dry");
let copied = 0, skipped = 0, rendered = 0;

// 1) 同步 css/js/fonts
for (const site of SITES) {
  const siteDir = join(ROOT, "packages", site);
  for (const cat of CATEGORIES) {
    const srcDir = join(BRAND, cat);
    const dstDir = join(siteDir, cat);
    if (!existsSync(srcDir)) continue;
    for (const file of readdirSync(srcDir)) {
      const src = join(srcDir, file);
      const dst = join(dstDir, file);
      if (!existsSync(dstDir)) { skipped++; continue; }
      cpSync(src, dst);
      copied++;
    }
  }
}

// 2) 生成 footer-chips.html（从 matrix.json）
const matrixFile = join(BRAND, "matrix.json");
if (existsSync(matrixFile)) {
  const matrix = JSON.parse(readFileSync(matrixFile, "utf8"));
  const chips = matrix.items.map(i => {
    const extAttr = i.external ? " target=\"_blank\" rel=\"noopener\"" : "";
    const curAttr = i.current ? " aria-current=\"page\"" : "";
    return "<a href=\"" + i.href + "\"" + extAttr + curAttr + " class=\"footer-brand-chip\"><strong>" + i.label + "</strong><span>" + i.desc + "</span></a>";
  }).join("\n");
  const outDir = join(BRAND, "_generated");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "footer-chips.html"), chips + "\n");
  rendered++;
}

// 3) 同步到子站（仅对 index.html 含 footer-brand-chips 占位的子站生成，避免死文件）
const genChips = join(BRAND, "_generated", "footer-chips.html");
if (existsSync(genChips)) {
  for (const site of SITES) {
    const siteDir = join(ROOT, "packages", site);
    const indexHtml = join(siteDir, "index.html");
    const hasPlaceholder = existsSync(indexHtml) && readFileSync(indexHtml, "utf8").includes("footer-brand-chips");
    if (!hasPlaceholder) { skipped++; continue; }
    const dst = join(siteDir, "_footer-chips.html");
    if (!existsSync(dst)) { writeFileSync(dst, readFileSync(genChips)); rendered++; }
    else { skipped++; }
  }
}

console.log("sync-brand-kit: " + copied + " files synced, " + skipped + " skipped, " + rendered + " snippets rendered.");
if (dry) console.log("(dry run — no files written)");
