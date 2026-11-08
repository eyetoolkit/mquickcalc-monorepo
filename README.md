# mQuickCalc — Monorepo
---

## ⚠️ 现状对照（2026-11-08 实测，`D1D2-STATUS-20261108`）

> 本文件写于 2026-09-12 前后，正文按「三个站点」口径。**实际是 4 个站点**：
> `packages/site-insurance` → `mquickcalc-cover` / `cover.mquickcalc.com`，`deploy.yml` 也推 4 站。
> 下文的「three」「Preview URLs」「One-time production cutover」「Required GitHub secret」均为历史快照，
> 当前部署协议以同仓 **`AGENT.md`（2026-11-08 现行版）** 为准。

| 本文件原口径 | 2026-11-08 实测 |
|---|---|
| 3 个站点 / 3 个 Pages 项目 | **4 个**（新增 `mquickcalc-cover`，源码 `packages/site-insurance`） |
| `CLOUDFLARE_API_TOKEN` 一个 secret | `deploy.yml` 实际用 `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_API_KEY` / `CLOUDFLARE_EMAIL` |
| 「Concurrency: in-flight deploys cancel」 | `deploy.yml` 未配置 `concurrency`，此说法不成立 |
| 「CI 会部署 preview URL」 | `pr-check.yml` 只做 build + 校验，不部署预览；`wrangler pages deploy` 只在 `deploy.yml` |
| 「One-time production cutover」待办 | 已完成：`mquickcalc` / `-finance` / `-health` 的 Git 集成已断开，走 Actions `ad_hoc` 直传 |
| 构建输出 71/51/48 files | 历史值；当前源码 234 个 HTML，线上 sitemap 可索引 204（72/60/41/31） |

| 维度 | 2026-11-08 实测 |
|---|---|
| 生产站点 | mQuickCalc **4 个**：`mquickcalc` / `mquickcalc-finance` / `mquickcalc-health` / `mquickcalc-cover`（源码目录分别是 `packages/site-main` / `site-finance` / `site-health` / **`site-insurance`**） |
| 页面数 | mQC 源码 234 个 HTML、工具页 143 个，线上 sitemap 可索引 **204**（主 72 / finance 60 / health 41 / cover 31）；Jsonversal 源码 95 个 Astro 页 + 12 个静态 HTML，线上 sitemap **105** |
| 部署唯一入口 | `git push origin main` → GitHub Actions `deploy.yml`（mQC，wrangler 直传 4 站）；Jsonversal 由 CF Pages GitHub App `github:push` 自动构建 `jsonversal-main-v2` |
| 流量基线 | 近 7 天两站搜索会话 **0 / 0**、空 referer 100%；第一方严格 UV 目前只有 2026-11-08 一天（净 5：mQC 4 / JV 1），**0 不等于零访客** |
| 变现层 | mQC 234/234 页有 3 个广告容器但零 `ca-pub-` / `adsbygoogle`；Jsonversal 当前无广告容器；五域 `ads.txt` 全 404；GSC 五域站点侧未见验证痕迹 |
| 现行规划 | `C:\TOOL\tools-roadmap-20261108.html`（离线自包含，26 项待办；Stage 0 = 能测 / 能申请，明确不新增页面） |

> 现行排期与待办见 `C:\TOOL\tools-roadmap-20261108.html`；本文仅保留作结构与历史参考。

---

Single source of truth for the **four** mQuickCalc sites (historical text below says "three"):

| Site | Domain | Package | Cloudflare Pages project |
|---|---|---|---|
| Main | mquickcalc.com | `packages/site-main` | `mquickcalc` |
| Finance | finance.mquickcalc.com | `packages/site-finance` | `mquickcalc-finance` |
| Health | health.mquickcalc.com | `packages/site-health` | `mquickcalc-health` |
| Cover (insurance) | cover.mquickcalc.com | `packages/site-insurance` | `mquickcalc-cover` |

## Why a monorepo?

The three sites share the same CSS, JS, fonts, security headers and service worker (verified: identical SHA-1 across all three). Before this monorepo, changes were copy-pasted across repos with `Sync from main` commits. Now: edit once → rebuild all three.

## Layout

```
mquickcalc-monorepo/
├── packages/
│   ├── brand-kit/              # shared: site.css, site.js, _headers, sw.js, fonts/
│   ├── site-main/              # mquickcalc.com content (index, tools/, embed/, ...)
│   ├── site-finance/           # finance.mquickcalc.com content (index, tools/, ...)
│   ├── site-health/            # health.mquickcalc.com content (index, tools/, ...)
│   └── site-insurance/         # cover.mquickcalc.com content (index, tools/, ...)
├── tools/
│   └── build.mjs               # injects brand-kit into each site package
├── .github/workflows/          # PR check + per-site deploy
└── README.md
```

`packages/brand-kit/` holds what every site needs. Each `packages/site-*` holds what makes that site unique (index, tool pages, sitemap, manifest, redirects). `tools/build.mjs` copies brand-kit content into each site package — the resulting `packages/site-*` directory is a complete static site ready to deploy.

## Local build

```bash
# Build all three
node tools/build.mjs

# Build one site
node tools/build.mjs site-main

# Output:
#   ✅ site-main       71 files, 1064.5 KB
#   ✅ site-finance    51 files, 833.5 KB
#   ✅ site-health     48 files, 757.1 KB
```

Each output is byte-for-byte equivalent to what the old single-site repos used to produce (verified: 42-file hash comparison).

## Deploy

GitHub Actions deploys to Cloudflare Pages on every push to `main`:

- `.github/workflows/deploy.yml` — builds all **four** sites, then deploys each via `wrangler pages deploy`
- Each site deploys to its own Cloudflare Pages project (`mquickcalc`, `-finance`, `-health`, `-cover`)
- 部署触发类型为 CF Pages `ad_hoc`；**当前唯一入口**，见 `AGENT.md`（2026-11-08 现行版）
- 旧文所称 `concurrency` 未在 `deploy.yml` 中配置，已删除该说法

**Required GitHub secret** (one-time setup):
- 实际使用 3 个 secrets：`CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_API_KEY` / `CLOUDFLARE_EMAIL`（Global API Key + Email）。
  旧文所写 `CLOUDFLARE_API_TOKEN` 与 `deploy.yml` 不符。

### Preview URLs（2026-09-12 历史快照，非当前状态）

Verified working (2026-09-12):
- `https://preview-test-monorepo.mquickcalc.pages.dev`
- `https://preview-test-monorepo.mquickcalc-finance.pages.dev`
- `https://preview-test-monorepo.mquickcalc-health.pages.dev`

These previews were created by a manual `wrangler pages deploy --branch=preview-test-monorepo` during phase-2 smoke test. They'll persist until manually deleted.

### One-time production cutover（已完成，仅存档）

> 2026-11-08 核实：`mquickcalc` / `-finance` / `-health` 的 Git 集成已断开（`source=null`），生产走 Actions 直传；`mquickcalc-cover` 与闲置项目 `mquickcalc-health-v2` 仍连着 GitHub，每次 push 会产生 `idle` 的空转部署，是否清理需拍板，见 `AGENT.md` 第 5 节。

Before production deploys work, the CF Pages projects need to be re-pointed away from the legacy repos. Either:

**Option A** — Disconnect and reconnect in CF dashboard:
1. Workers & Pages → `<project>` → Settings → Builds → Disconnect GitHub
2. Re-connect GitHub app, choose `eyetoolkit/mquickcalc-monorepo`
3. Production branch: `main`. Build command: empty. Build output dir: `packages/site-main` (or `site-finance`, `site-health`).
4. Save. Next push to monorepo `main` triggers a build.

**Option B** — Just let GitHub Actions deploy (after secret is set):
- The Actions workflow calls `wrangler pages deploy` directly; it doesn't require any CF-GH integration.
- This is the current default in `deploy.yml`.

## CI

`.github/workflows/pr-check.yml` runs on every PR and push to `main`:
- builds all three site packages with `tools/build.mjs`
- verifies file counts are in expected ranges
- parses every JSON-LD block
- checks each H1 contains the primary keyword
- sanity-checks build artifacts (size > 0, hash consistent)

Runs entirely on GitHub-hosted runners — no secrets needed, no CF token required.

## Adding a new tool page

1. Edit `packages/site-<relevant>/tools/<name>.html`
2. Add the URL to the `ItemList` JSON-LD in that site's `index.html` (script `tools/build.mjs` doesn't auto-update this — search the index for `ItemList`)
3. Add an entry to that site's `sitemap.xml`
4. Open a PR. CI will deploy a preview URL.
5. After merge, the production deploy runs.

## Theme colors

| Site | Brand color | Where it lives |
|---|---|---|
| Main | `#4f46e5` (indigo) | `packages/site-main/index.html` `theme-color` meta |
| Finance | `#059669` (emerald) | `packages/site-finance/index.html` |
| Health | `#dc2626` (red) | `packages/site-health/index.html` |

Each site's CSS is identical (from brand-kit) — the only color differentiation is the `theme-color` meta tag in each `index.html` and `manifest.webmanifest`.

## Legacy repos

The original three repos (`mquickcalc-pages`, `mquickcalc-finance`, `mquickcalc-health`) are now archived (read-only). New development happens here.

## License

Internal — © mQuickCalc

<!-- Last cutover smoke test: 2026-09-12T06:19:17Z -->
