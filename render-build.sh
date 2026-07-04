#!/bin/bash
set -e

echo "======================================"
echo "  建設コンサルタント案件管理システム"
echo "  Render デプロイ ビルドスクリプト"
echo "======================================"

# ── Python パッケージのインストール ────────────────────────
echo ""
echo ">>> [1/2] Python パッケージをインストール中..."
pip install -r backend/requirements.txt
echo "    Python パッケージのインストール完了"

# ── データベース初期化 ──────────────────────────────────────
echo ""
echo ">>> [2/2] データベースを初期化中..."
cd backend
python seed_data.py
cd ..
echo "    データベースの初期化完了"

echo ""
echo ">>> ビルド完了！"
