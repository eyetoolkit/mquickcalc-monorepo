# AGENT.md — mquickcalc 部署协议（固化版）

> **任何 agent (TRAE / WorkBuddy / 新会话 / 人类) 接手 mquickcalc 时必须先读这个文件**
> 上次更新: 2026-09-18
> 性质: 长期不变的项目宪法，低频修改。运行时状态看 `.workbuddy/MEMORY.md`

---

## 0. 核心事实（先知道这些）

| 项目 | 值 |
|---|---|
| **Canonical 源码** | GitHub `eyetoolkit/mquickcalc-monorepo`（单一真相源） |
| **ECS 工作副本** | `/root/mquickcalc/monorepo` |
| **Cloudflare Account** | `00cb5cd6be4881053e57a338ce62de2f` |
| **4 个 Pages 项目** | `mquickcalc` / `mquickcalc-finance` / `mquickcalc-health` / `mquickcalc-cover` |
| **当前唯一部署入口** | ⛔ GitHub Actions 额度耗尽 — **只走 ECS 手动脚本** |
| **ECS SSH 别名** | `ssh volc` |
| **ECS 部署脚本** | `bash /opt/mquickcalc/scripts/deploy.sh` |
| **ECS 体检脚本** | `bash /opt/mquickcalc/scripts/check-integration.sh` |
| **CF 凭证** | `/opt/env/tri-sites.env` 里的 `CLOUDFLARE_API_TOKEN`（与 tri-sites 共用账户 token A） |
| **冻结开关** | 存在 `/opt/mquickcalc/scripts/DEPLOY_FREEZE` 即拒绝部署 |

---

## 1. 部署模型（唯一入口）

```
本地开发 → git push origin main → SSH 到 ECS → deploy.sh 一键部署 → 4 站点自动上线
                                     ↑
                                     | 唯一入口，只有这个脚本跑 wrangler
```

**⛔ 禁止事项:**

- 禁止在 GitHub Settings 恢复 self-hosted runner（已经丢了，不要再装回来）
- 禁止打开 Cloudflare Pages 的 Git 自动构建（会与 ECS 直传双通道冲突，参考 tri-sites 09:41 事故）
- 禁止直接手动 `wrangler pages deploy` 单站（必须走 deploy.sh，有冻结 + 防回滚 + 冒烟）
- 禁止从本地 Windows 直接 wrangler deploy（本地 token/代理不稳定，ECS 才是枢纽）

**✅ 允许事项:**

- `git push origin main` 推 GitHub（但不要指望 GitHub Actions 自动部署）
- `ssh volc "bash /opt/mquickcalc/scripts/deploy.sh"` 手动部署（**唯一上线路径**）
- `ssh volc "bash /opt/mquickcalc/scripts/check-integration.sh"` 冒烟测试
- `ssh volc "bash /opt/mquickcalc/scripts/deploy.sh --only site-main"` 单站（如果以后加参数）

---

## 2. 防回滚保护（deploy.sh 内置）

deploy.sh 启动时会：

1. 从 Cloudflare API 拉每个项目的当前生产部署 commit
2. 与 ECS 本地 `git rev-parse main` 比祖先关系
3. 若本地 main 落后于线上 → **拒绝部署**（exit 1），提示同步
4. 若本地 main 包含线上 → 正常继续

这和 tri-sites `deploy-frontend.sh` 完全一致，参考 2026-09-18 09:41 事故教训。

---

## 3. 冻结开关

紧急情况（如线上回滚期间、用户要求暂停）：

```bash
# 冻结 — 立即阻断所有部署
touch /opt/mquickcalc/scripts/DEPLOY_FREEZE

# 解冻
rm /opt/mquickcalc/scripts/DEPLOY_FREEZE
```

deploy.sh 开头 3 秒内就会检测到并 exit 1。

---

## 4. 工作目录结构

```
/root/mquickcalc/          # ECS 工作区根
├── monorepo/              # git clone，canonical 副本
│   ├── packages/{main,finance,health,insurance}/
│   └── tools/build.mjs    # 构建脚本
├── scripts/
│   ├── deploy.sh          # ⭐ 唯一部署入口
│   └── check-integration.sh # 冒烟测试
├── logs/                  # deploy.sh 每次运行写日志
├── .workbuddy/MEMORY.md   # 运行时状态（可高频更新）
└── AGENT.md               # 本文件（低频更新）
```

---

## 5. 与同机其他 agent 的边界

这台 ECS 同时承载多个项目：

| 项目 | 工作目录 | 部署方式 | 负责人 |
|---|---|---|---|
| **mquickcalc (4 站)** | `/root/mquickcalc/monorepo` | ECS 手动 deploy.sh | **当前会话** |
| tri-sites (boardduel/memoryduel) | `/opt/deploy/tri-sites` | GitHub webhook + ECS deploy-frontend.sh | WorkBuddy |
| eyetoolkit/blog (科普 6 站) | `/opt/blog` | CF webhook 自动构建 | WorkBuddy |
| eyetoolkit-site (工具站) | `/opt/eyetoolkit-site` | CF webhook 自动构建 | WorkBuddy |
| jsonversal (4 站) | `/opt/jsonversal` | JSON 沙盒 | JSON Agent |

**冲突防护:**

- mquickcalc 与 tri-sites **共用 Cloudflare account**（`00cb5cd6...`）但**项目名完全不同**，wrangler deploy 互不干扰
- `/opt/env/tri-sites.env` 是 **账号级 token**，所有项目共享这一把。deploy.sh 直接 source 它，不要创建 mquickcalc 专属 env 文件
- WorkBuddy 的记忆里还记着旧 SSH key (`volcano_key`)，**已过期**。当前有效 SSH 密钥是 `~/.ssh/game_ed25519`

---

## 6. 快速操作手册

```bash
# 部署（唯一路径）
ssh volc "bash /opt/mquickcalc/scripts/deploy.sh"

# 只 pull + build 不部署（先验证产物对）
ssh volc "cd /root/mquickcalc/monorepo && git pull && node tools/build.mjs"

# 冒烟测试
ssh volc "bash /opt/mquickcalc/scripts/check-integration.sh"

# 查看最近部署日志
ssh volc "ls -lt /root/mquickcalc/logs/ | head -5"

# 紧急冻结
ssh volc "touch /opt/mquickcalc/scripts/DEPLOY_FREEZE"

# 检查线上版本 vs ECS main
ssh volc "cd /root/mquickcalc/monorepo && git log -1 --oneline"
```

---

## 7. 故障处理矩阵

| 故障 | 先看什么 | 处置 |
|---|---|---|
| deploy.sh 报"冻结" | 冻结文件 | `rm /opt/mquickcalc/scripts/DEPLOY_FREEZE`（确认后） |
| deploy.sh 报"落后于线上" | GitHub main vs ECS main | `ssh volc "cd /root/mquickcalc/monorepo && git pull"` |
| deploy.sh 报"token 无效" | token 有效期 | `cat /opt/env/tri-sites.env` 检查 `CLOUDFLARE_API_TOKEN` |
| 4 站 500 或白屏 | check-integration.sh | 最后一次成功的 CF deployment 里 rollback |
| 想恢复 GitHub Actions | 用户决策 | 去 Settings 放开 runner 限制 → 但要同时关 CF Git 自动构建 |

---

## 8. 变更历史

| 日期 | 变更 | 原因 |
|---|---|---|
| 2026-09-18 | 初始创建，固化 ECS 手动 deploy.sh 为唯一入口 | GitHub Actions 额度耗尽，self-hosted runner 丢失 |
