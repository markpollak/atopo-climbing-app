import sqlite3
import json
from pathlib import Path

DB_PATH = Path(__file__).parent / "atopo.db"


def get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    with get_db() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS guides (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                version TEXT NOT NULL DEFAULT '1.0',
                status TEXT NOT NULL DEFAULT 'draft',
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                updated_at TEXT NOT NULL DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS crags (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guide_id INTEGER REFERENCES guides(id),
                name TEXT NOT NULL,
                area TEXT NOT NULL DEFAULT '',
                type TEXT NOT NULL DEFAULT 'Trad',
                walkin TEXT NOT NULL DEFAULT '',
                aspect TEXT NOT NULL DEFAULT '',
                lat REAL,
                lng REAL,
                photo_url TEXT,
                photo_aspect REAL,
                access_notes TEXT NOT NULL DEFAULT '',
                approach TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                updated_at TEXT NOT NULL DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS sectors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                crag_id INTEGER NOT NULL REFERENCES crags(id),
                name TEXT NOT NULL,
                sort_order INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS routes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                crag_id INTEGER NOT NULL REFERENCES crags(id),
                sector_id INTEGER REFERENCES sectors(id),
                n INTEGER NOT NULL,
                name TEXT NOT NULL,
                grade TEXT NOT NULL DEFAULT '',
                stars INTEGER NOT NULL DEFAULT 0,
                style TEXT NOT NULL DEFAULT 'Trad',
                len INTEGER NOT NULL DEFAULT 0,
                desc TEXT NOT NULL DEFAULT '',
                warn TEXT,
                color TEXT NOT NULL DEFAULT '#888',
                line TEXT NOT NULL DEFAULT '[]',
                stances TEXT NOT NULL DEFAULT '[]',
                status TEXT NOT NULL DEFAULT 'none',
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                UNIQUE(crag_id, n)
            );
        """)
