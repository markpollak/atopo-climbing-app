"""Add more Peak District crags to the DB (idempotent — skips if already present)."""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from backend.database import init_db, get_db

CRAGS = [
    {
        "name": "Froggatt Edge",
        "area": "Peak District",
        "type": "Trad",
        "walkin": "15 min",
        "aspect": "West-facing · afternoon sun",
        "routes": [
            {"n":1,"name":"Strapadictomy","grade":"E2 5c","stars":3,"style":"Trad","len":18,"desc":"The classic slab route — delicate footwork on perfect gritstone.","color":"#F2453A"},
            {"n":2,"name":"Valkyrie","grade":"HVS 5a","stars":3,"style":"Trad","len":17,"desc":"The most popular route on the crag. A must-do of Peak District trad.","color":"#F0A93B"},
            {"n":3,"name":"Chequers Buttress","grade":"VDiff","stars":2,"style":"Trad","len":15,"desc":"Excellent introductory route up the central buttress.","color":"#2E9BE6"},
            {"n":4,"name":"Great Slab","grade":"VS 4c","stars":2,"style":"Trad","len":20,"desc":"Open slab climbing with thought-provoking moves.","color":"#46C07A"},
              {"n":5,"name":"Sunset Slab","grade":"VS 4c","stars":2,"style":"Trad","len":16,"desc":"Thin slab moves in a great position at the top.","color":"#B070E0"},
            {"n":6,"name":"Tody's Wall","grade":"E3 6a","stars":3,"style":"Trad","len":14,"desc":"Fingery climbing up the overhanging wall. A Peak classic.","color":"#25C2C2"},
            {"n":7,"name":"Downhill Racer","grade":"E1 5b","stars":2,"style":"Trad","len":15,"desc":"Sustained climbing on the right section of the edge.","color":"#F25C9C"},
            {"n":8,"name":"Green Gut","grade":"Severe 4a","stars":1,"style":"Trad","len":12,"desc":"A steady moderate through the mossy groove.","color":"#F7D14B"},
        ],
    },
    {
        "name": "Burbage South",
        "area": "Peak District",
        "type": "Trad",
        "walkin": "10 min",
        "aspect": "East-facing · morning sun",
        "routes": [
            {"n":1,"name":"The Rasp","grade":"HVS 5b","stars":3,"style":"Trad","len":14,"desc":"Demanding layback crack up the main buttress.","color":"#F2453A"},
            {"n":2,"name":"Goliath's Groove","grade":"VS 4c","stars":2,"style":"Trad","len":16,"desc":"Deep V-groove with superb jamming. One of the best VSs around.","color":"#F0A93B"},
            {"n":3,"name":"Martello Buttress","grade":"VDiff","stars":2,"style":"Trad","len":12,"desc":"Enjoyable climbing up the central tower.","color":"#2E9BE6"},
            {"n":4,"name":"Elder Crack","grade":"HS 4b","stars":1,"style":"Trad","len":13,"desc":"Solid crack climb up the left section.","color":"#46C07A"},
            {"n":5,"name":"Freddie's Finale","grade":"E2 5c","stars":3,"style":"Trad","len":17,"desc":"Bold climbing finishing directly up the arête.","color":"#B070E0"},
            {"n":6,"name":"Cave Crack","grade":"VS 4c","stars":2,"style":"Trad","len":15,"desc":"Jamming crack springing from the cave.","color":"#25C2C2"},
            {"n":7,"name":"Right Eliminate","grade":"E1 5b","stars":2,"style":"Trad","len":14,"desc":"The eliminate line up the right wall, thought-provoking.","color":"#F25C9C"},
        ],
    },
    {
        "name": "Millstone Edge",
        "area": "Peak District",
        "type": "Trad",
        "walkin": "25 min",
        "aspect": "East-facing · morning sun",
        "routes": [
            {"n":1,"name":"London Wall","grade":"E3 5c","stars":3,"style":"Trad","len":30,"desc":"The superb crack splitting the main wall — a Peak District pilgrimage route.","color":"#F2453A"},
            {"n":2,"name":"Great North Road","grade":"E1 5b","stars":2,"style":"Trad","len":28,"desc":"Long bold route on the main wall. Atmospheric and serious.","color":"#F0A93B"},
            {"n":3,"name":"Edge Lane","grade":"VS 4c","stars":2,"style":"Trad","len":22,"desc":"Popular VS with a crux at the top overlap.","color":"#2E9BE6"},
            {"n":4,"name":"Embankment Route 1","grade":"HVS 5a","stars":2,"style":"Trad","len":24,"desc":"First of the embankment series — sustained wall climbing.","color":"#46C07A"},
            {"n":5,"name":"Embankment Route 2","grade":"E1 5b","stars":2,"style":"Trad","len":24,"desc":"The second route of the embankment — harder than it looks.","color":"#B070E0"},
            {"n":6,"name":"Regent Street","grade":"E2 5c","stars":3,"style":"Trad","len":26,"desc":"One of Millstone's finest — powerful and unrelenting.","color":"#25C2C2"},
            {"n":7,"name":"Pedestal Route","grade":"VDiff","stars":1,"style":"Trad","len":20,"desc":"A good moderate that gives a taste of the quarry atmosphere.","color":"#F25C9C"},
            {"n":8,"name":"Craven Crack","grade":"HVS 5a","stars":2,"style":"Trad","len":22,"desc":"A quality crack requiring solid jamming technique.","color":"#F7D14B"},
            {"n":9,"name":"Boulevard","grade":"E4 6a","stars":3,"style":"Trad","len":28,"desc":"Technical and serious — the hardest of the classic Millstone lines.","color":"#F2453A"},
        ],
    },
    {
        "name": "Curbar Edge",
        "area": "Peak District",
        "type": "Trad",
        "walkin": "20 min",
        "aspect": "West-facing · afternoon sun",
        "routes": [
            {"n":1,"name":"Hairless Heart","grade":"E3 5c","stars":3,"style":"Trad","len":18,"desc":"Bold slab climbing on the main face.","color":"#F2453A"},
            {"n":2,"name":"Elder Statesman","grade":"HVS 5a","stars":2,"style":"Trad","len":16,"desc":"Classic HVS up the left side of the main buttress.","color":"#F0A93B"},
            {"n":3,"name":"The Wailing Wall","grade":"E5 6b","stars":3,"style":"Trad","len":17,"desc":"Technical face climbing — one of Peak District's hardest classics.","color":"#2E9BE6"},
            {"n":4,"name":"Profit of Doom","grade":"E4 6a","stars":3,"style":"Trad","len":19,"desc":"Sustained and serious wall climbing with a boulder problem crux.","color":"#46C07A"},
            {"n":5,"name":"Little Plum","grade":"VS 4c","stars":2,"style":"Trad","len":14,"desc":"Popular moderate up the smaller buttress.","color":"#B070E0"},
            {"n":6,"name":"Deadbay Crack","grade":"Severe 4a","stars":1,"style":"Trad","len":12,"desc":"The easiest route on the crag — a good warm-up.","color":"#25C2C2"},
            {"n":7,"name":"Left Unconquerable","grade":"HVS 5a","stars":3,"style":"Trad","len":17,"desc":"The original classic of Curbar — sustained jamming up the crack.","color":"#F25C9C"},
            {"n":8,"name":"Right Unconquerable","grade":"E1 5b","stars":3,"style":"Trad","len":18,"desc":"Twin to the left — harder and bolder above the break.","color":"#F7D14B"},
        ],
    },
]


def seed_crags():
    init_db()
    with get_db() as conn:
        for crag_data in CRAGS:
            existing = conn.execute(
                "SELECT id FROM crags WHERE name = ?", (crag_data["name"],)
            ).fetchone()
            if existing:
                print(f"  {crag_data['name']} already in DB — skipping.")
                continue

            cur = conn.execute(
                """INSERT INTO crags (name, area, type, walkin, aspect)
                   VALUES (?, ?, ?, ?, ?)""",
                (crag_data["name"], crag_data["area"], crag_data["type"],
                 crag_data["walkin"], crag_data["aspect"]),
            )
            crag_id = cur.lastrowid

            for r in crag_data["routes"]:
                conn.execute(
                    """INSERT INTO routes (crag_id, n, name, grade, stars, style, len, desc, color, line, stances, status)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (crag_id, r["n"], r["name"], r["grade"], r["stars"], r["style"],
                     r["len"], r["desc"], r["color"], "[]", "[]", "none"),
                )

            print(f"  Added: {crag_data['name']} (id={crag_id}, {len(crag_data['routes'])} routes)")


if __name__ == "__main__":
    seed_crags()
    print("Done.")
