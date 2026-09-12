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

Cloudflare Pages is already integrated with GitHub for the three `mquickcalc*` projects. Once each project is re-pointed to `eyetoolkit/mquickcalc-monorepo` in the Cloudflare dashboard with the right `destination_dir`, every push to `main` triggers an automatic deploy — no wrangler, no GitHub Actions needed for deploys.

What needs to happen (one-time, ~10 min in CF dashboard):

| Pages project | Repo | Destination dir |
|---|---|---|
| `mquickcalc` | `eyetoolkit/mquickcalc-monorepo` | `packages/site-main` |
| `mquickcalc-finance` | `eyetoolkit/mquickcalc-monorepo` | `packages/site-finance` |
| `mquickcalc-health` | `eyetoolkit/mquickcalc-monorepo` | `packages/site-health` |

Steps in CF dashboard per project:
1. Workers & Pages → `<project>` → Settings → Builds → Disconnect GitHub
2. Re-connect GitHub app, choose `eyetoolkit/mquickcalc-monorepo`
3. Set Build output directory to the per-site `packages/site-*` path
4. Save. Next push to monorepo `main` will auto-deploy.

Preview deploys on every PR come for free once the GH integration is re-pointed.

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
