#!/bin/bash
set -e

echo "=== 橋梁管理システム 起動スクリプト ==="
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo ">>> Python パッケージをインストール中..."
pip install -r "$ROOT/backend/requirements.txt" -q

echo ">>> Node.js パッケージをインストール中..."
cd "$ROOT/frontend"
npm install --silent

echo ">>> フロントエンドをビルド中..."
npm run build

echo ">>> サンプルデータを投入中..."
cd "$ROOT/backend"
python seed_data.py

echo ">>> バックエンドを起動中 (ポート 8000)..."
cd "$ROOT/backend"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
