# mQuickCalc — Monorepo

Single source of truth for the three mQuickCalc sites:

| Site | Domain | Package | Cloudflare Pages project |
|---|---|---|---|
| Main | mquickcalc.com | `packages/site-main` | `mquickcalc` |
| Finance | finance.mquickcalc.com | `packages/site-finance` | `mquickcalc-finance` |
| Health | health.mquickcalc.com | `packages/site-health` | `mquickcalc-health` |

## Why a monorepo?

The three sites share the same CSS, JS, fonts, security headers and service worker (verified: identical SHA-1 across all three). Before this monorepo, changes were copy-pasted across repos with `Sync from main` commits. Now: edit once → rebuild all three.

## Layout

```
mquickcalc-monorepo/
├── packages/
│   ├── brand-kit/              # shared: site.css, site.js, _headers, sw.js, fonts/
│   ├── site-main/              # mquickcalc.com content (index, tools/, embed/, ...)
│   ├── site-finance/           # finance.mquickcalc.com content (index, tools/, ...)
│   └── site-health/            # health.mquickcalc.com content (index, tools/, ...)
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

- `.github/workflows/deploy.yml` — builds all three sites, then deploys each via `wrangler pages deploy`
- Each site deploys to its own Cloudflare Pages project (`mquickcalc`, `mquickcalc-finance`, `mquickcalc-health`)
- Concurrency: in-flight deploys cancel when a new commit lands

**Required GitHub secret** (one-time setup):
- `CLOUDFLARE_API_TOKEN` — account-scoped token with `Pages:Edit` permission. Get one from https://dash.cloudflare.com/profile/api-tokens.

### Preview URLs

Verified working (2026-09-12):
- `https://preview-test-monorepo.mquickcalc.pages.dev`
- `https://preview-test-monorepo.mquickcalc-finance.pages.dev`
- `https://preview-test-monorepo.mquickcalc-health.pages.dev`

These previews were created by a manual `wrangler pages deploy --branch=preview-test-monorepo` during phase-2 smoke test. They'll persist until manually deleted.

### One-time production cutover

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
