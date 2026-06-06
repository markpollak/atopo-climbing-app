import json
from fastapi import APIRouter, HTTPException
from ..database import get_db
from ..models import RouteUpdate

router = APIRouter(prefix="/api/crags/{crag_id}/routes", tags=["routes"])


def _row_to_dict(row) -> dict:
    d = dict(row)
    d["line"] = json.loads(d["line"])
    d["stances"] = json.loads(d["stances"])
    return d


@router.get("")
def list_routes(crag_id: int):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM routes WHERE crag_id = ? ORDER BY n", (crag_id,)
        ).fetchall()
    return [_row_to_dict(r) for r in rows]


@router.get("/{route_id}")
def get_route(crag_id: int, route_id: int):
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM routes WHERE id = ? AND crag_id = ?", (route_id, crag_id)
        ).fetchone()
    if not row:
        raise HTTPException(404)
    return _row_to_dict(row)


@router.put("/{route_id}")
def update_route(crag_id: int, route_id: int, body: RouteUpdate):
    fields = body.model_dump(exclude_none=True)
    if not fields:
        raise HTTPException(400, "No fields to update")

    # Serialise list fields to JSON
    for key in ("line", "stances"):
        if key in fields:
            fields[key] = json.dumps(fields[key])

    set_clause = ", ".join(f"{k} = ?" for k in fields)
    values = list(fields.values()) + [route_id, crag_id]

    with get_db() as conn:
        conn.execute(
            f"UPDATE routes SET {set_clause}, updated_at = datetime('now') WHERE id = ? AND crag_id = ?",
            values,
        )
        row = conn.execute(
            "SELECT * FROM routes WHERE id = ? AND crag_id = ?", (route_id, crag_id)
        ).fetchone()
    if not row:
        raise HTTPException(404)
    return _row_to_dict(row)
