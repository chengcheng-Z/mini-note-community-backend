#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ $# -lt 1 ]; then
  echo "用法: ./deploy/deploy.sh <镜像TAG>"
  echo "示例: ./deploy/deploy.sh 66c3942"
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
export TAG

PREVIOUS_TAG=""
if [ -f .deployed-tag ]; then
  PREVIOUS_TAG="$(cat .deployed-tag)"
fi

echo "==> 启动中间件"
docker compose -f docker-compose.infra.yml up -d

echo "==> 数据库迁移"
./deploy/migrate.sh

if [ "${APP_IMAGE_PREFIX:-xiaohashu}" != "xiaohashu" ]; then
  echo "==> 拉取应用镜像 TAG=${TAG}"
  docker compose -f docker-compose.app.yml pull
else
  echo "==> 本地镜像模式，跳过 pull"
fi

echo "==> 启动应用"
docker compose -f docker-compose.app.yml up -d --remove-orphans

APP_SERVICES="$(docker compose -f docker-compose.app.yml config --services | wc -l | tr -d ' ')"
GATEWAY_PORT="${GATEWAY_PORT:-8000}"
HEALTHY=0

echo "==> 健康检查"
for _ in $(seq 1 60); do
  RUNNING="$(docker compose -f docker-compose.app.yml ps --status running --services | wc -l | tr -d ' ')"
  if [ "$RUNNING" -ge "$APP_SERVICES" ] && timeout 1 bash -c "</dev/tcp/127.0.0.1/${GATEWAY_PORT}" 2>/dev/null; then
    HEALTHY=1
    break
  fi
  sleep 2
done

if [ "$HEALTHY" -ne 1 ]; then
  echo "==> 健康检查失败"
  docker compose -f docker-compose.app.yml ps
  if [ -n "$PREVIOUS_TAG" ]; then
    echo "==> 回滚到 ${PREVIOUS_TAG}"
    export TAG="$PREVIOUS_TAG"
    docker compose -f docker-compose.app.yml up -d --remove-orphans
  else
    echo "==> 没有上一版可回滚"
  fi
  exit 1
fi

echo "$TAG" > .deployed-tag
echo "==> 部署成功: ${TAG}"
docker compose -f docker-compose.app.yml ps
