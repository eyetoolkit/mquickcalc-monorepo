# AGENT.md — mQuickCalc 部署协议（现行版）

> **任何 agent (TRAE / WorkBuddy / 新会话 / 人类) 接手 mQuickCalc 时必须先读本文件**
> 上次核实：2026-11-08（待办 D1+D2：文档纠偏 + 部署链单通道核实）
> 性质：项目宪法，低频修改。运行时状态看 `C:\TOOL\.workbuddy\memory\`
> 现行规划与待办：`C:\TOOL\tools-roadmap-20261108.html`
> 本版标记：`D1D2-STATUS-20261108`

---

## 0. 一句话结论

**唯一生效的上线入口：`git push origin main` → GitHub Actions `.github/workflows/deploy.yml` → `wrangler pages deploy` × 4。**

2026-09-18 旧版「GitHub Actions 额度耗尽，只走 ECS `/opt/mquickcalc/scripts/deploy.sh`」**已废止并证伪**：
Actions 近 6 次 push 全部 `success`，4 个生产 Pages 项目的 commit 与 GitHub `main` 逐一对应；
ECS 脚本、工作副本与凭据仍在服务器上，但自 2026-09-18 起再未运行、无 cron / systemd timer，**禁止执行**。

---

## 1. 核心事实（2026-11-08 实测）

| 项目 | 值 |
|---|---|
| Canonical 源码 | GitHub `eyetoolkit/mquickcalc-monorepo`，分支 `main` |
| 核实时的 main HEAD | `903f3b9d6`（2026-11-08）；本文件提交后会前进，以 `git ls-remote` 为准 |
| 生产 Pages 项目 | `mquickcalc` / `mquickcalc-finance` / `mquickcalc-health` / `mquickcalc-cover` |
| 源码目录 | `packages/site-main` / `site-finance` / `site-health` / **`site-insurance`（→ cover，名字不对称，别改错）** |
| Cloudflare Account | `00cb5cd6be4881053e57a338ce62de2f` |
| 唯一入口 | GitHub Actions `deploy.yml`（`push: branches: [main]` + `workflow_dispatch`） |
| CF 部署触发类型 | `ad_hoc`（wrangler 直传，带 `--commit-hash=${{ github.sha }}`） |
| CI 校验 | `pr-check.yml`：build + 文件数 + JSON-LD + H1 关键字检查 |
| 线上页面 | 源码 234 个 HTML；线上 sitemap 可索引 204（72/60/41/31） |
| ECS 状态 | `/opt/mquickcalc/scripts/deploy.sh` 保留但**已停用**；最后日志 2026-09-18 20:39；无 cron / timer；工作副本 HEAD `a579e2c`（落后 51 天） |

---

## 2. 现行部署模型（唯一入口）

```
本地开发 → git push origin main
              ├─ pr-check.yml   → build + 文件数 / JSON-LD / H1 校验
              └─ deploy.yml     → node tools/build.mjs
                                  → wrangler pages deploy × 4
                                     (mquickcalc / -finance / -health / -cover)
                                  → CF Pages production，commit-hash = github.sha
```

### 连续两次 push 的线上一致性（D2 验收证据）

| push (UTC) | GitHub HEAD | Actions deploy run | 4 个 Pages 生产部署 (UTC) | 结果 |
|---|---|---|---|---|
| 2026-11-08 10:04:20 | `165e8582` | `42469840121` success | 10:04:37 / 10:04:42 / 10:04:48 / 10:04:53，均 `165e8582` | ✅ 一致 |
| 2026-11-08 12:58:17 | `903f3b9d6` | `42482696483` success | 12:58:33 / 12:58:38 / 12:58:43 / 12:58:47，均 `903f3b9d6` | ✅ 一致 |

`mquickcalc` / `-finance` / `-health` 三个项目的 `source` 已为 `null`（Git 集成已断开），
只有 `ad_hoc` 部署；`deploy.yml` 用仓库 secrets `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_API_KEY` / `CLOUDFLARE_EMAIL`（Global API Key + Email），
**不是** `CLOUDFLARE_API_TOKEN`（旧 README 写错了）。

---

## 3. ⛔ 禁止事项

- **禁止执行 ECS 部署**：`ssh volc "bash /opt/mquickcalc/scripts/deploy.sh"` 及其等价命令。脚本会先 `git pull` 再 `wrangler pages deploy` × 4，
  一旦运行就产生第二次 `ad_hoc` 部署，与 Actions 抢生产版本；且其工作副本带 4 个未提交改动（`sitemap.xml` × 3、`_redirects`）。
  该脚本的防回滚保护只防「本地落后于线上」，**不防「手动重复部署」**。
- **禁止从本地 Windows 直接 `wrangler pages deploy`**，也禁止改 CF Pages 生产分支 / 构建配置来绕过 Actions。
- **禁止把 CF Pages Git 自动构建重新接成生产通道**（见第 5 节残留项；要不要清理需用户拍板）。
- **禁止 `git checkout -f` / `reset --hard` 本地 clone**：`C:\TOOL\mquickcalc` 常落后远端且带未提交改动。
  要改远端文件，走 GitHub Git Data API 在 `main` 上精确提交（等价于一次可追溯的 push，仍由 Actions 部署）。
- 禁止在未同步 `tools/held-pages.json` 的情况下重新生成 sitemap / llms：health 四个医学页按 2026-11-08 拍板「保留文件、暂不上线」。

## ✅ 允许事项

- `git push origin main`（或 Git Data API 精确提交）→ 自动部署；`workflow_dispatch` 手动重跑 `deploy.yml`。
- 只读核查：GitHub Actions runs、CF Pages deployments / `source` / `deployment_trigger.metadata.commit_hash`、线上 HTTP 验收。
- 本地 `node tools/build.mjs` 自检（不上传）。

---

## 4. 静态资源改动的三层配套（沿用既有纪律）

改 `brand-kit` / 共享 JS / SW 后必须同时做，否则页面会拿到旧缓存：

1. Service Worker `CACHE_VERSION` bump，并在 fetch handler 保留 `/__uv` bypass（匿名计数绝不缓存、绝不离线回落）；
2. CF 定向 purge：apex / www × 带 query / 不带 query 都发（缓存键可能忽略 query）；
3. 线上复验：**用前端实际发出的完整 URL（含 query）测**，不要只测裸路径。

另：`/compare/` 页与 3 个 `404.html` 由 `tools/gen-compare.mjs` 生成、直接提交进仓库，
既不引用 `site-core.js` 也不走共享布局；任何全站注入必须「产物 + 生成器模板」同步改，否则下次重新生成会丢。

---

## 5. ⚠️ 已知残留风险（本轮只记录，未改配置）

CF Pages 的 GitHub 集成没有全部断开：

| 项目 | 现状 | 影响 |
|---|---|---|
| `mquickcalc-cover` | `source.type=github`，`deployments_enabled=true`，路径限定 `packages/site-insurance/**` 等 | 每次 push 额外产生一个 `github:push` 部署，状态 `idle`，随后被 Actions 的 `ad_hoc` 部署覆盖为生产 |
| `mquickcalc-health-v2` | 同样连着 GitHub，但只绑 `*.pages.dev`，是闲置项目 | 每次 push 产生一个空转 `github:push` 部署（`idle`） |
| `mquickcalc` / `-finance` / `-health` | `source=null`，仅 `ad_hoc` | 无残留 |

即：**当前生产只有一条生效通道，但仍有两条空转的触发链**。清理（断开 Git 集成 / 删除闲置项目）属于改部署链，
按「重大项等拍板」原则本轮未动，已登记为后续待办。误跑 ECS 脚本是另一个潜在第二通道，见第 3 节。

ECS 侧的 `deploy-watchdog.timer`（每 5 分钟）只服务 `eyetoolkit.com` 集群，`deploy-map.json` 与脚本中均无 mQuickCalc / Jsonversal，
与本仓库无关，不要误判为双通道。

---

## 6. 凭据与环境（不落明文）

- GitHub Actions secrets：`CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_API_KEY` / `CLOUDFLARE_EMAIL`。
- 本地脚本：`GH_TOKEN`（或项目内 `C:\TOOL\PUSH_VERSAL.bat` 的 `TOK`）、用户级环境变量 `CLOUDFLARE_EMAIL` / `CLOUDFLARE_API_KEY`。
- 服务器 `/opt/env/tri-sites.env` 里的账号级 token 仅供历史 ECS 脚本使用；**文档与记忆不得写入任何密钥明文**。
- ECS `ssh volc` 别名在本沙箱不解析，需 `ssh -i ~/.ssh/game_ed25519 root@101.96.194.237`；仅用于只读核查。

---

## 7. 变更历史

| 日期 | 变更 | 原因 |
|---|---|---|
| 2026-09-18 | 初版：固化 ECS 手动 `deploy.sh` 为唯一入口 | 当时 GitHub Actions 额度耗尽 / self-hosted runner 丢失 |
| 2026-11-08 | **现行版**：改判 GitHub Actions `deploy.yml` 为唯一入口；ECS 脚本标记停用并禁止执行；补连续两次 push 一致性证据、残留 Git 集成清单、静态资源三层配套 | D1+D2 实测：Actions 已恢复且连续 6 次成功，ECS 51 天未运行且无定时任务；旧宪法会把后续开发带偏 |

> 2026-09-18 旧版全文已废止，不再作为操作依据；其历史内容可从本仓库 git 历史查阅。
