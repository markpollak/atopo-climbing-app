import json
import uuid
from pathlib import Path
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from ..database import get_db
from ..models import CragUpdate

router = APIRouter(prefix="/api/crags", tags=["crags"])

UPLOADS_DIR = Path(__file__).parent.parent / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)


def _row_to_dict(row) -> dict:
    return dict(row)


@router.get("")
def list_crags():
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM crags ORDER BY id").fetchall()
    return [_row_to_dict(r) for r in rows]


@router.get("/routes/all")
def list_all_routes():
    """All routes across every crag, with crag_name and crag_area attached."""
    with get_db() as conn:
        rows = conn.execute(
            """SELECT r.id, r.crag_id, r.n, r.name, r.grade, r.stars,
                      r.style, r.len, r.desc, r.warn, r.color, r.status,
                      c.name AS crag_name, c.area AS crag_area
               FROM routes r JOIN crags c ON c.id = r.crag_id
               ORDER BY c.id, r.n"""
        ).fetchall()
    return [dict(r) for r in rows]


@router.get("/{crag_id}")
def get_crag(crag_id: int):
    with get_db() as conn:
        row = conn.execute("SELECT * FROM crags WHERE id = ?", (crag_id,)).fetchone()
    if not row:
        raise HTTPException(404)
    return _row_to_dict(row)


@router.put("/{crag_id}")
def update_crag(crag_id: int, body: CragUpdate):
    fields = body.model_dump(exclude_none=True)
    if not fields:
        raise HTTPException(400, "No fields to update")
    set_clause = ", ".join(f"{k} = ?" for k in fields)
    values = list(fields.values()) + [crag_id]
    with get_db() as conn:
        conn.execute(
            f"UPDATE crags SET {set_clause}, updated_at = datetime('now') WHERE id = ?",
            values,
        )
        row = conn.execute("SELECT * FROM crags WHERE id = ?", (crag_id,)).fetchone()
    if not row:
        raise HTTPException(404)
    return _row_to_dict(row)


ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".tiff", ".tif"}

@router.post("/{crag_id}/photo")
async def upload_photo(crag_id: int, file: UploadFile = File(...)):
    suffix = Path(file.filename or "photo.jpg").suffix.lower() or ".jpg"
    is_image_mime = file.content_type and file.content_type.startswith("image/")
    is_image_ext = suffix in ALLOWED_IMAGE_EXTENSIONS
    if not is_image_mime and not is_image_ext:
        raise HTTPException(400, "File must be an image (jpg, png, webp, heic, tiff)")
    filename = f"crag_{crag_id}_{uuid.uuid4().hex[:8]}{suffix}"
    dest = UPLOADS_DIR / filename

    contents = await file.read()
    dest.write_bytes(contents)

    photo_url = f"/uploads/{filename}"

    with get_db() as conn:
        conn.execute(
            "UPDATE crags SET photo_url = ?, updated_at = datetime('now') WHERE id = ?",
            (photo_url, crag_id),
        )
        row = conn.execute("SELECT * FROM crags WHERE id = ?", (crag_id,)).fetchone()

    if not row:
        raise HTTPException(404)
    return _row_to_dict(row)


@router.get("/{crag_id}/sectors")
def list_sectors(crag_id: int):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM sectors WHERE crag_id = ? ORDER BY sort_order", (crag_id,)
        ).fetchall()
    return [dict(r) for r in rows]
