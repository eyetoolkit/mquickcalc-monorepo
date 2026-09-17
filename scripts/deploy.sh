#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# mQuickCalc Monorepo — 一键部署脚本
#
# 绕过 GitHub Actions，本地 build + wrangler pages deploy 直接推到 Cloudflare。
# 适用于 GitHub Actions runner 不可用、或紧急 hotfix 的场景。
#
# 用法:
#   ./scripts/deploy.sh                # 部署全部 4 个站点
#   ./scripts/deploy.sh site-main      # 只部署 site-main
#   ./scripts/deploy.sh site-main finance  # 部署多个
#   ./scripts/deploy.sh --dry-run      # 只 build + 打印命令, 不上传
#
# 前置:
#   方式 A: wrangler login           (交互式浏览器授权, 最推荐)
#   方式 B: export CLOUDFLARE_API_TOKEN=xxx
#          token 需要 Pages:Edit 权限
# -----------------------------------------------------------------------------
set -euo pipefail

# === 颜色 ===
C_RED='\033[31m'; C_GREEN='\033[32m'; C_YELLOW='\033[33m'
C_CYAN='\033[36m'; C_GRAY='\033[90m'; C_BOLD='\033[1m'; C_RESET='\033[0m'

log()  { echo -e "${C_CYAN}▶${C_RESET} $*"; }
ok()   { echo -e "${C_GREEN}✓${C_RESET} $*"; }
warn() { echo -e "${C_YELLOW}!${C_RESET} $*"; }
err()  { echo -e "${C_RED}✗${C_RESET} $*" >&2; }

# === 配置 (与 tools/build.mjs 和 .github/workflows/deploy.yml 保持一致) ===
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
declare -A SITES=(
  [site-main]=mquickcalc
  [site-finance]=mquickcalc-finance
  [site-health]=mquickcalc-health
  [site-insurance]=mquickcalc-cover
)
SITE_LIST=("site-main" "site-finance" "site-health" "site-insurance")

DRY_RUN=false
TARGETS=()

# === 参数解析 ===
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    -h|--help)
      sed -n '2,16p' "$0" | sed 's/^# \{0,1\}//'
      exit 0 ;;
    -*) err "未知参数: $arg"; exit 1 ;;
    *) TARGETS+=("$arg") ;;
  esac
done

if [ ${#TARGETS[@]} -eq 0 ]; then
  TARGETS=("${SITE_LIST[@]}")
fi

# === 预检 ===
preflight() {
  log "预检..."
  local fail=0

  # node
  if ! command -v node &>/dev/null; then err "node 未安装"; fail=1
  else
    local nv; nv=$(node -p "process.versions.node.split('.')[0]")
    if [ "$nv" -lt 20 ]; then warn "node $nv 推荐 >= 20, 继续但可能失败"
    else ok "node $(node -v)"
    fi
  fi

  # wrangler
  if ! command -v wrangler &>/dev/null && ! npx wrangler --version &>/dev/null; then
    err "wrangler 不可用, 执行: npm install -g wrangler  或  npm i wrangler"
    fail=1
  else
    ok "wrangler $(npx wrangler --version 2>/dev/null || wrangler --version)"
  fi

  # CLOUDFLARE_API_TOKEN
  if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
    # 试试 wrangler 自己的配置
    if ! npx wrangler whoami &>/dev/null 2>&1; then
      warn "未检测到 Cloudflare 凭据"
      echo ""
      echo "  选项 1: 运行 ${C_BOLD}npx wrangler login${C_RESET} (浏览器授权)"
      echo "  选项 2: export CLOUDFLARE_API_TOKEN=<your-token>"
      echo "          (到 https://dash.cloudflare.com/profile/api-tokens 创建, Pages:Edit 权限)"
      echo ""
      fail=1
    else
      ok "wrangler 已登录: $(npx wrangler whoami 2>&1 | head -1)"
    fi
  else
    ok "CLOUDFLARE_API_TOKEN 已设置 (${#CLOUDFLARE_API_TOKEN} 字符)"
  fi

  # 构建脚本
  if [ ! -f "$ROOT/tools/build.mjs" ]; then err "tools/build.mjs 不存在"; fail=1
  else ok "tools/build.mjs 存在"; fi

  if [ $fail -eq 1 ]; then err "预检未通过, 已中止"; exit 1; fi
}

# === build ===
do_build() {
  log "执行 build..."
  (cd "$ROOT" && node tools/build.mjs)
  ok "build 完成"
}

# === deploy 单站 ===
deploy_site() {
  local site="$1"
  local project="${SITES[$site]}"
  local dir="$ROOT/packages/$site"

  if [ -z "$project" ]; then err "未知 site: $site"; return 1; fi
  if [ ! -d "$dir" ]; then err "目录不存在: $dir"; return 1; fi

  local file_count
  file_count=$(find "$dir" -type f | wc -l)
  local size_kb
  size_kb=$(du -sk "$dir" | cut -f1)

  echo ""
  log "▶ 部署 ${C_BOLD}${site}${C_RESET}  →  Cloudflare Pages ${C_BOLD}${project}${C_RESET}"
  echo -e "     ${C_GRAY}目录: $dir ($file_count files, ${size_kb} KB)${C_RESET}"

  local commit_msg="${DEPLOY_MSG:-local deploy $(date -u +%Y-%m-%dT%H:%M:%SZ)}"
  local cmd=(
    npx wrangler pages deploy "$dir"
    --project-name "$project"
    --branch=main
    --commit-dirty=true
    --commit-message="$commit_msg"
  )

  if $DRY_RUN; then
    warn "[dry-run] 将执行: ${cmd[*]}"
    return 0
  fi

  if "${cmd[@]}"; then
    ok "${site} ✅"
  else
    err "${site} 部署失败 (exit $?)"
    return 1
  fi
}

# === 主流程 ===
main() {
  echo -e "${C_BOLD}━━━ mQuickCalc 本地部署 ━━━${C_RESET}"
  echo ""
  echo -e "目标站点: ${C_BOLD}${TARGETS[*]}${C_RESET}"
  $DRY_RUN && echo -e "${C_YELLOW}⚠️  DRY-RUN 模式, 不会实际上传${C_RESET}"
  echo ""

  preflight
  do_build

  local failures=()
  for site in "${TARGETS[@]}"; do
    deploy_site "$site" || failures+=("$site")
  done

  echo ""
  if [ ${#failures[@]} -eq 0 ]; then
    echo -e "${C_GREEN}${C_BOLD}🎉 部署完成${C_RESET}"
    echo -e "  访问:"
    echo -e "    ${C_CYAN}https://mquickcalc.com${C_RESET}"
    echo -e "    ${C_CYAN}https://finance.mquickcalc.com${C_RESET}"
    echo -e "    ${C_CYAN}https://health.mquickcalc.com${C_RESET}"
    echo -e "    ${C_CYAN}https://cover.mquickcalc.com${C_RESET}"
  else
    err "以下站点部署失败: ${failures[*]}"
    exit 1
  fi
}

main "$@"
