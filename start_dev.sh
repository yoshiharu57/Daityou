#!/bin/bash
set -e

echo "=== 橋梁管理システム 開発モード起動 ==="
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo ">>> Python パッケージをインストール中..."
pip install -r "$ROOT/backend/requirements.txt" -q

echo ">>> サンプルデータを投入中..."
cd "$ROOT/backend"
python seed_data.py

echo ">>> バックエンドをバックグラウンドで起動..."
cd "$ROOT/backend"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
echo "バックエンド PID: $BACKEND_PID"

echo ">>> フロントエンド依存関係のインストール..."
cd "$ROOT/frontend"
npm install --silent

echo ""
echo "=== 開発サーバー起動 ==="
echo "バックエンド: http://localhost:8000"
echo "フロントエンド: http://localhost:3000"
echo "API docs:      http://localhost:8000/docs"
echo ""

npm run dev
