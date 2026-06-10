#!/bin/bash
set -e

echo "=== 橋梁管理システム セットアップ ==="
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo ">>> Python パッケージをインストール中..."
pip install -r "$ROOT/backend/requirements.txt" -q

echo ">>> Node.js パッケージをインストール中..."
cd "$ROOT/frontend"
npm install --silent

echo ">>> フロントエンドをビルド中..."
npm run build

echo ">>> データベース初期化 & サンプルデータ投入..."
cd "$ROOT/backend"
python seed_data.py

echo "=== セットアップ完了 ==="
