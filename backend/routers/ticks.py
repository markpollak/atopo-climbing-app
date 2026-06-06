from datetime import date as date_type
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from ..database import get_db
from .auth import get_current_user

router = APIRouter(prefix="/api/ticks", tags=["ticks"])


class TickCreate(BaseModel):
    route_id: int
    ascent_type: str = "led"   # led | flash | onsight | second | TR | project
    notes: str = ""
    ticked_at: Optional[str] = None  # ISO date YYYY-MM-DD; defaults to today


_SELECT = """
    SELECT t.id, t.user_id, t.route_id, r.crag_id, r.name AS route_name,
           c.name AS crag_name, r.grade, t.ascent_type, t.notes, t.ticked_at
    FROM ticks t
    JOIN routes r ON r.id = t.route_id
    JOIN crags c ON c.id = r.crag_id
"""


@router.post("", status_code=201)
def create_tick(body: TickCreate, user=Depends(get_current_user)):
    ticked_at = body.ticked_at or date_type.today().isoformat()
    with get_db() as conn:
        if not conn.execute("SELECT id FROM routes WHERE id = ?", (body.route_id,)).fetchone():
            raise HTTPException(404, "Route not found")
        # Upsert: remove existing tick for this route by this user
        conn.execute(
            "DELETE FROM ticks WHERE user_id = ? AND route_id = ?",
            (user["id"], body.route_id),
        )
        cur = conn.execute(
            "INSERT INTO ticks (user_id, route_id, ascent_type, notes, ticked_at) VALUES (?,?,?,?,?)",
            (user["id"], body.route_id, body.ascent_type, body.notes, ticked_at),
        )
        row = conn.execute(_SELECT + "WHERE t.id = ?", (cur.lastrowid,)).fetchone()
    return dict(row)


@router.get("/me")
def list_my_ticks(user=Depends(get_current_user)):
    with get_db() as conn:
        rows = conn.execute(
            _SELECT + "WHERE t.user_id = ? ORDER BY t.ticked_at DESC, t.id DESC",
            (user["id"],),
        ).fetchall()
    return [dict(r) for r in rows]


@router.delete("/route/{route_id}", status_code=204)
def delete_tick_by_route(route_id: int, user=Depends(get_current_user)):
    with get_db() as conn:
        conn.execute(
            "DELETE FROM ticks WHERE user_id = ? AND route_id = ?",
            (user["id"], route_id),
        )


@router.delete("/{tick_id}", status_code=204)
def delete_tick(tick_id: int, user=Depends(get_current_user)):
    with get_db() as conn:
        result = conn.execute(
            "DELETE FROM ticks WHERE id = ? AND user_id = ?",
            (tick_id, user["id"]),
        )
        if result.rowcount == 0:
            raise HTTPException(404, "Tick not found")
