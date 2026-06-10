#!/bin/bash
set -e

echo ">>> フロントエンドをビルド中..."
cd frontend
npm install --silent
npm run build
cd ..

echo ">>> Python パッケージをインストール中..."
pip install -r backend/requirements.txt -q

echo ">>> データベースを初期化中..."
cd backend
python -c "
import models
from database import engine
models.Base.metadata.create_all(bind=engine)
print('DB tables created.')
"
