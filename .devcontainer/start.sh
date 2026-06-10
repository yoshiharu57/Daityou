#!/bin/bash

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# すでに起動済みなら何もしない
if lsof -i:8000 > /dev/null 2>&1; then
  echo "サーバーはすでに起動しています"
  exit 0
fi

echo "=== バックエンド起動 (ポート 8000) ==="
cd "$ROOT/backend"
nohup uvicorn main:app --host 0.0.0.0 --port 8000 --reload \
  > /tmp/backend.log 2>&1 &
echo "バックエンド PID: $!"

echo "=== フロントエンド起動 (ポート 3000) ==="
cd "$ROOT/frontend"
nohup npm run dev \
  > /tmp/frontend.log 2>&1 &
echo "フロントエンド PID: $!"

echo ""
echo "起動完了！"
echo "  メイン画面 : http://localhost:3000"
echo "  API仕様書  : http://localhost:8000/docs"
