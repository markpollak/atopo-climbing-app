"""Run once to seed the DB from the hardcoded stanage data."""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from backend.database import init_db, get_db

ROUTES = [
    {"n":1,"name":"Route 1017","grade":"VDiff","stars":1,"style":"Trad","len":12,"desc":"Climb the line on the left section of the edge.","color":"#F2453A","line":[[0.042,0.730],[0.044,0.640],[0.044,0.520],[0.043,0.400],[0.042,0.280]]},
    {"n":2,"name":"Route 1019","grade":"Severe 4a","stars":1,"style":"Trad","len":14,"desc":"The next line right of 1017.","color":"#F0A93B","line":[[0.083,0.932],[0.093,0.810],[0.098,0.680],[0.102,0.520],[0.105,0.340],[0.109,0.210]]},
    {"n":3,"name":"Route 1020","grade":"HS 4b","stars":1,"style":"Trad","len":14,"desc":"Short steep line through the left buttress.","color":"#2E9BE6","line":[[0.112,0.870],[0.110,0.760],[0.107,0.650],[0.103,0.530],[0.101,0.380]]},
    {"n":4,"name":"Route 1024","grade":"VS 4c","stars":2,"style":"Trad","len":16,"desc":"Central wall route with good sustained climbing.","color":"#46C07A","line":[[0.201,0.870],[0.197,0.760],[0.193,0.640],[0.193,0.530],[0.193,0.400],[0.197,0.300]]},
    {"n":5,"name":"Route 1027","grade":"HVS 5a","stars":2,"style":"Trad","len":16,"desc":"Sustained climbing on the central section.","color":"#B070E0","line":[[0.249,0.850],[0.245,0.720],[0.241,0.620],[0.239,0.500],[0.238,0.380],[0.241,0.260]]},
    {"n":6,"name":"Route 1028","grade":"E1 5b","stars":2,"style":"Trad","len":17,"desc":"Bold climbing through the steeper central wall.","color":"#25C2C2","line":[[0.403,0.820],[0.407,0.680],[0.411,0.560],[0.414,0.440],[0.418,0.320],[0.422,0.200]]},
    {"n":7,"name":"Route 1030","grade":"VS 4c","stars":1,"style":"Trad","len":15,"desc":"The line up the right side of the central section.","color":"#F25C9C","line":[[0.431,0.830],[0.433,0.720],[0.437,0.600],[0.440,0.480],[0.425,0.360],[0.422,0.240]]},
    {"n":8,"name":"Route 1031","grade":"HVS 5a","stars":2,"style":"Trad","len":16,"desc":"Good climbing on the right-central buttress.","color":"#F7D14B","line":[[0.466,0.850],[0.473,0.740],[0.477,0.640],[0.481,0.540],[0.484,0.420],[0.459,0.280]]},
    {"n":9,"name":"Route 1032","grade":"E1 5b","stars":2,"style":"Trad","len":18,"desc":"The classic line of the right-central section.","color":"#F2453A","line":[[0.514,0.852],[0.516,0.820],[0.518,0.750],[0.521,0.640],[0.525,0.510],[0.525,0.380],[0.510,0.260]]},
    {"n":10,"name":"Route 1033","grade":"VS 4c","stars":1,"style":"Trad","len":15,"desc":"Straightforward climbing on the right section.","color":"#F0A93B","line":[[0.573,0.830],[0.573,0.700],[0.573,0.590],[0.573,0.470],[0.576,0.360],[0.578,0.250]]},
    {"n":11,"name":"Route 1035","grade":"E2 5b","stars":3,"style":"Trad","len":19,"desc":"An excellent sustained route on the right wall.","color":"#2E9BE6","line":[[0.617,0.898],[0.613,0.820],[0.610,0.720],[0.606,0.600],[0.602,0.480],[0.599,0.360],[0.606,0.250]]},
    {"n":12,"name":"Route 1040","grade":"HVS 5a","stars":2,"style":"Trad","len":16,"desc":"The line up the upper right section.","color":"#46C07A","line":[[0.635,0.770],[0.632,0.720],[0.629,0.660],[0.627,0.590],[0.626,0.510],[0.626,0.430]]},
    {"n":13,"name":"Route 1041","grade":"VS 4c","stars":1,"style":"Trad","len":15,"desc":"Moderate climbing on the right buttress.","color":"#B070E0","line":[[0.680,0.750],[0.687,0.690],[0.694,0.600],[0.698,0.510],[0.702,0.420],[0.705,0.330],[0.709,0.240]]},
    {"n":14,"name":"Route 1042","grade":"E1 5b","stars":2,"style":"Trad","len":18,"desc":"Good route up the right wall with a crux high up.","color":"#25C2C2","line":[[0.716,0.729],[0.716,0.650],[0.716,0.560],[0.716,0.470],[0.716,0.390],[0.716,0.210]]},
    {"n":15,"name":"Route 1043","grade":"HVS 5a","stars":2,"style":"Trad","len":17,"desc":"Follows the right-hand crack line.","color":"#F25C9C","line":[[0.735,0.760],[0.731,0.680],[0.728,0.600],[0.724,0.500],[0.720,0.400],[0.720,0.280],[0.720,0.165]]},
    {"n":16,"name":"Route 1044","grade":"E2 5c","stars":3,"style":"Trad","len":20,"desc":"One of the best routes on the right section. Sustained throughout.","color":"#F7D14B","line":[[0.790,0.780],[0.783,0.700],[0.775,0.615],[0.772,0.500],[0.768,0.400],[0.764,0.300],[0.761,0.195]]},
    {"n":17,"name":"Route 1045","grade":"VS 4c","stars":1,"style":"Trad","len":15,"desc":"Moderate crack climb on the far right section.","color":"#F2453A","line":[[0.838,0.840],[0.842,0.770],[0.845,0.680],[0.849,0.570],[0.853,0.450],[0.856,0.340]]},
    {"n":18,"name":"Route 1046","grade":"E1 5b","stars":2,"style":"Trad","len":18,"desc":"The steep crack system on the far right buttress.","color":"#F0A93B","line":[[0.891,0.838],[0.893,0.760],[0.890,0.660],[0.888,0.550],[0.889,0.440],[0.893,0.340],[0.893,0.250]]},
    {"n":19,"name":"Route 1047","grade":"HVS 5b","stars":2,"style":"Trad","len":17,"desc":"Follows the right crack line of the far right buttress.","color":"#2E9BE6","line":[[0.904,0.834],[0.905,0.750],[0.909,0.650],[0.908,0.540],[0.908,0.430],[0.912,0.320],[0.915,0.210]]},
    {"n":20,"name":"Route 1048","grade":"E3 5c","stars":3,"style":"Trad","len":20,"desc":"The bold line up the far right arête. Exposed and sustained.","color":"#46C07A","line":[[0.942,0.840],[0.946,0.760],[0.945,0.670],[0.942,0.570],[0.942,0.460],[0.940,0.350],[0.940,0.245],[0.940,0.175]]},
    {"n":21,"name":"Route 1059","grade":"E4 6a","stars":3,"style":"Trad","len":22,"desc":"The hardest line on this section. Takes the steep wall direct.","color":"#B070E0","line":[[0.979,0.720],[0.979,0.620],[0.979,0.510],[0.979,0.400],[0.979,0.300],[0.983,0.200]]},
]

SECTORS = ["Left Section", "Central Walls", "Right Buttress"]


def seed():
    init_db()
    with get_db() as conn:
        existing = conn.execute("SELECT COUNT(*) FROM crags").fetchone()[0]
        if existing > 0:
            print("DB already seeded — skipping.")
            return

        # Guide
        cur = conn.execute(
            "INSERT INTO guides (name, version, status) VALUES (?, ?, ?)",
            ("Dark Peak Grit", "1.0", "draft"),
        )
        guide_id = cur.lastrowid

        # Crag — photo_url left null (user will upload via Studio)
        cur = conn.execute(
            """INSERT INTO crags (guide_id, name, area, type, walkin, aspect, photo_aspect)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (guide_id, "Stanage Edge", "Peak District", "Trad",
             "20 min", "West-facing · afternoon sun", round(4072/2200, 4)),
        )
        crag_id = cur.lastrowid

        # Sectors
        for i, name in enumerate(SECTORS):
            conn.execute(
                "INSERT INTO sectors (crag_id, name, sort_order) VALUES (?, ?, ?)",
                (crag_id, name, i),
            )

        # Routes
        for r in ROUTES:
            conn.execute(
                """INSERT INTO routes (crag_id, n, name, grade, stars, style, len, desc, color, line, stances, status)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (crag_id, r["n"], r["name"], r["grade"], r["stars"], r["style"],
                 r["len"], r["desc"], r["color"], json.dumps(r["line"]), "[]", "none"),
            )

        print(f"Seeded: guide {guide_id}, crag {crag_id}, {len(ROUTES)} routes.")


if __name__ == "__main__":
    seed()
