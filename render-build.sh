#!/bin/bash
set -e

echo "======================================"
echo "  建設コンサルタント案件管理システム"
echo "  Render デプロイ ビルドスクリプト"
echo "======================================"

# ── フロントエンドのビルド ──────────────────────────────────
echo ""
echo ">>> [1/3] フロントエンドをビルド中..."
cd frontend
npm install
npm run build
cd ..
echo "    フロントエンドのビルド完了"

# ── Python パッケージのインストール ────────────────────────
echo ""
echo ">>> [2/3] Python パッケージをインストール中..."
pip install -r backend/requirements.txt
echo "    Python パッケージのインストール完了"

# ── データベース初期化 ──────────────────────────────────────
echo ""
echo ">>> [3/3] データベースを初期化中..."
cd backend
python seed_data.py
cd ..
echo "    データベースの初期化完了"

echo ""
echo ">>> ビルド完了！"
