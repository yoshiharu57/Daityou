from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
import shutil
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/photos", tags=["photos"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".pdf"}


def get_upload_path(bridge_id: int, inspection_id: int) -> str:
    path = os.path.join(UPLOAD_DIR, f"bridge_{bridge_id}", f"inspection_{inspection_id}")
    os.makedirs(path, exist_ok=True)
    return path


@router.get("/inspection/{inspection_id}", response_model=List[schemas.Photo])
def list_photos(inspection_id: int, db: Session = Depends(get_db)):
    inspection = db.query(models.Inspection).filter(models.Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="点検記録が見つかりません")
    return db.query(models.Photo).filter(models.Photo.inspection_id == inspection_id).all()


@router.post("/upload/{inspection_id}", response_model=List[schemas.Photo])
async def upload_photos(
    inspection_id: int,
    files: List[UploadFile] = File(...),
    captions: Optional[str] = Form(None),
    photo_type: Optional[str] = Form(None),
    member_type: Optional[str] = Form(None),
    damage_type: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    inspection = db.query(models.Inspection).filter(models.Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="点検記録が見つかりません")

    upload_path = get_upload_path(inspection.bridge_id, inspection_id)
    saved_photos = []
    caption_list = captions.split(",") if captions else []

    for i, file in enumerate(files):
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            continue

        unique_name = f"{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(upload_path, unique_name)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        caption = caption_list[i] if i < len(caption_list) else None
        db_photo = models.Photo(
            inspection_id=inspection_id,
            filename=unique_name,
            original_filename=file.filename,
            caption=caption,
            photo_type=photo_type,
            member_type=member_type,
            damage_type=damage_type,
        )
        db.add(db_photo)
        saved_photos.append(db_photo)

    db.commit()
    for photo in saved_photos:
        db.refresh(photo)
    return saved_photos


@router.get("/file/{inspection_id}/{filename}")
def get_photo(inspection_id: int, filename: str, db: Session = Depends(get_db)):
    inspection = db.query(models.Inspection).filter(models.Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="点検記録が見つかりません")

    photo = db.query(models.Photo).filter(
        models.Photo.inspection_id == inspection_id,
        models.Photo.filename == filename
    ).first()
    if not photo:
        raise HTTPException(status_code=404, detail="写真が見つかりません")

    file_path = os.path.join(
        UPLOAD_DIR,
        f"bridge_{inspection.bridge_id}",
        f"inspection_{inspection_id}",
        filename
    )
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="ファイルが存在しません")

    return FileResponse(file_path)


@router.put("/{photo_id}", response_model=schemas.Photo)
def update_photo(
    photo_id: int,
    caption: Optional[str] = Form(None),
    photo_type: Optional[str] = Form(None),
    member_type: Optional[str] = Form(None),
    damage_type: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    photo = db.query(models.Photo).filter(models.Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="写真が見つかりません")
    if caption is not None:
        photo.caption = caption
    if photo_type is not None:
        photo.photo_type = photo_type
    if member_type is not None:
        photo.member_type = member_type
    if damage_type is not None:
        photo.damage_type = damage_type
    db.commit()
    db.refresh(photo)
    return photo


@router.delete("/{photo_id}")
def delete_photo(photo_id: int, db: Session = Depends(get_db)):
    photo = db.query(models.Photo).filter(models.Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="写真が見つかりません")

    inspection = db.query(models.Inspection).filter(models.Inspection.id == photo.inspection_id).first()
    if inspection:
        file_path = os.path.join(
            UPLOAD_DIR,
            f"bridge_{inspection.bridge_id}",
            f"inspection_{photo.inspection_id}",
            photo.filename
        )
        if os.path.exists(file_path):
            os.remove(file_path)

    db.delete(photo)
    db.commit()
    return {"message": "写真を削除しました"}
