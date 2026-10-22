#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ $# -lt 1 ]; then
  echo "用法: ./deploy/deploy.sh <镜像TAG> [服务名...]"
  echo "全部部署: ./deploy/deploy.sh 66c3942"
  echo "单个部署: ./deploy/deploy.sh 66c3942 gateway"
  echo "多个部署: ./deploy/deploy.sh 66c3942 auth user note"
  exit 1
fi

if [ ! -f .env ]; then
  echo "缺少 .env"
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

TAG="$1"
shift
export TAG

COMPOSE_APP="docker compose -f docker-compose.app.yml"
ALL_SERVICES="$($COMPOSE_APP config --services)"

if [ $# -eq 0 ]; then
  mapfile -t TARGETS <<< "$ALL_SERVICES"
else
  TARGETS=("$@")
fi

for svc in "${TARGETS[@]}"; do
  if ! grep -qx "$svc" <<< "$ALL_SERVICES"; then
    echo "未知服务: $svc"
    exit 1
  fi
done

LEGACY_TAG=""
if [ -f .deployed-tag ]; then
  LEGACY_TAG="$(cat .deployed-tag)"
fi

mkdir -p .deployed-tags
declare -A PREV_TAGS=()
for svc in "${TARGETS[@]}"; do
  if [ -f ".deployed-tags/$svc" ]; then
    PREV_TAGS[$svc]="$(cat ".deployed-tags/$svc")"
  else
    PREV_TAGS[$svc]="$LEGACY_TAG"
  fi
done

echo "==> 启动中间件"
docker compose -f docker-compose.infra.yml up -d

echo "==> 数据库迁移"
./deploy/migrate.sh

echo "==> 部署 TAG=${TAG} 服务: ${TARGETS[*]}"
if [ "${APP_IMAGE_PREFIX:-xiaohashu}" != "xiaohashu" ]; then
  $COMPOSE_APP pull "${TARGETS[@]}"
else
  echo "==> 本地镜像模式，跳过 pull"
fi

$COMPOSE_APP up -d --remove-orphans "${TARGETS[@]}"

GATEWAY_PORT="${GATEWAY_PORT:-8000}"
HEALTHY=0

echo "==> 健康检查"
for _ in $(seq 1 60); do
  RUNNING="$($COMPOSE_APP ps --status running --services)"
  OK=1
  for svc in "${TARGETS[@]}"; do
    if ! grep -qx "$svc" <<< "$RUNNING"; then
      OK=0
      break
    fi
  done

  if [ "$OK" -eq 1 ]; then
    if printf '%s\n' "${TARGETS[@]}" | grep -qx gateway; then
      if timeout 1 bash -c "</dev/tcp/127.0.0.1/${GATEWAY_PORT}" 2>/dev/null; then
        HEALTHY=1
        break
      fi
    else
      HEALTHY=1
      break
    fi
  fi
  sleep 2
done

if [ "$HEALTHY" -ne 1 ]; then
  echo "==> 健康检查失败"
  $COMPOSE_APP ps
  for svc in "${TARGETS[@]}"; do
    prev="${PREV_TAGS[$svc]:-}"
    if [ -n "$prev" ]; then
      echo "==> 回滚 ${svc} 到 ${prev}"
      TAG="$prev" $COMPOSE_APP up -d --no-deps --force-recreate "$svc"
    else
      echo "==> ${svc} 没有上一版可回滚"
    fi
  done
  exit 1
fi

for svc in "${TARGETS[@]}"; do
  echo "$TAG" > ".deployed-tags/$svc"
done
echo "$TAG" > .deployed-tag

echo "==> 部署成功: ${TAG}"
$COMPOSE_APP ps
