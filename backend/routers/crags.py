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


@router.post("/{crag_id}/photo")
async def upload_photo(crag_id: int, file: UploadFile = File(...)):
    # Validate image type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image")

    suffix = Path(file.filename or "photo.jpg").suffix or ".jpg"
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
