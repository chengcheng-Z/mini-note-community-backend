#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "缺少 .env"
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

COMPOSE="docker compose -f docker-compose.infra.yml"

echo "==> 确保 MySQL 已启动"
$COMPOSE up -d mysql

echo "==> 等待 MySQL 就绪"
until $COMPOSE exec -T mysql sh -c 'mysqladmin ping -h 127.0.0.1 -uroot -p"$MYSQL_ROOT_PASSWORD" --silent' >/dev/null 2>&1; do
  sleep 2
done

$COMPOSE exec -T mysql sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" xiaohashu -e "CREATE TABLE IF NOT EXISTS schema_migrations (version VARCHAR(255) PRIMARY KEY, applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP);"'

shopt -s nullglob
for f in deploy/migrations/*.sql; do
  version="$(basename "$f")"
  applied="$($COMPOSE exec -T -e VERSION="$version" mysql sh -c 'mysql -N -B -uroot -p"$MYSQL_ROOT_PASSWORD" xiaohashu -e "SELECT COUNT(*) FROM schema_migrations WHERE version=\"$VERSION\";"' | tr -d '\r')"

  if [ "$applied" = "0" ]; then
    echo "==> 应用迁移 ${version}"
    $COMPOSE exec -T mysql sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" xiaohashu' < "$f"
    $COMPOSE exec -T -e VERSION="$version" mysql sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" xiaohashu -e "INSERT INTO schema_migrations(version) VALUES(\"$VERSION\");"'
  else
    echo "==> 已应用 ${version}"
  fi
done

echo "==> 迁移完成"
