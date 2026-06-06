import json
from fastapi import APIRouter, HTTPException
from ..database import get_db
from ..models import RouteUpdate, RouteCreate

router = APIRouter(prefix="/api/crags/{crag_id}/routes", tags=["routes"])


def _row_to_dict(row) -> dict:
    d = dict(row)
    d["line"] = json.loads(d["line"])
    d["stances"] = json.loads(d["stances"])
    return d


ROUTE_COLORS = [
    "#F2453A", "#F0A93B", "#2E9BE6", "#46C07A", "#B070E0",
    "#25C2C2", "#F25C9C", "#F7D14B",
]


@router.post("")
def create_route(crag_id: int, body: RouteCreate):
    with get_db() as conn:
        row = conn.execute(
            "SELECT MAX(n) as max_n FROM routes WHERE crag_id = ?", (crag_id,)
        ).fetchone()
        next_n = (row["max_n"] or 0) + 1
        color = ROUTE_COLORS[(next_n - 1) % len(ROUTE_COLORS)]
        if body.color != "#888":
            color = body.color
        conn.execute(
            """INSERT INTO routes (crag_id, n, name, grade, style, len, color, line, stances)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, '[]')""",
            (crag_id, next_n, body.name, body.grade, body.style, body.len, color,
             json.dumps(body.line)),
        )
        new_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
        row = conn.execute("SELECT * FROM routes WHERE id = ?", (new_id,)).fetchone()
    return _row_to_dict(row)


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
