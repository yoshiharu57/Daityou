from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from database import engine
import models
from routers import bridges, inspections, photos

models.Base.metadata.create_all(bind=engine)

# 初回起動時にサンプルデータを投入（橋梁が0件のときのみ）
def _seed_if_empty():
    from database import SessionLocal
    db = SessionLocal()
    try:
        if db.query(models.Bridge).count() == 0:
            import seed_data  # noqa: F401
    finally:
        db.close()

_seed_if_empty()

app = FastAPI(
    title="橋梁管理システム",
    description="市区町村向け橋梁データベース管理システム",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(bridges.router)
app.include_router(inspections.router)
app.include_router(photos.router)


@app.get("/health")
def health_check():
    return {"status": "ok", "message": "橋梁管理システムが稼働中です"}


frontend_build = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(frontend_build):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_build, "assets")), name="assets")

    @app.get("/", response_class=FileResponse)
    def read_root():
        return os.path.join(frontend_build, "index.html")

    @app.get("/{full_path:path}", response_class=FileResponse)
    def catch_all(full_path: str):
        return os.path.join(frontend_build, "index.html")
