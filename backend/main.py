from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from database import engine
import models
from routers import projects, activity_logs, opportunities

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="建設コンサルタント案件管理システム",
    description="営業職向け受注案件管理システム",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router)
app.include_router(activity_logs.router)
app.include_router(opportunities.router)


@app.get("/health")
def health_check():
    return {"status": "ok", "message": "案件管理システムが稼働中です"}


frontend_build = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(frontend_build):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_build, "assets")), name="assets")

    @app.get("/", response_class=FileResponse)
    def read_root():
        return os.path.join(frontend_build, "index.html")

    @app.get("/{full_path:path}", response_class=FileResponse)
    def catch_all(full_path: str):
        return os.path.join(frontend_build, "index.html")
