"""
HireVision AI database module.
Manages student records, predictions, multi-year cohorts, and placement drives
using SQLite locally or PostgreSQL in production.
"""

import os
import sqlite3
from collections.abc import Mapping
from datetime import datetime
from pathlib import Path

try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover - installed from requirements.txt
    load_dotenv = None


BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BACKEND_DIR.parent
if load_dotenv:
    load_dotenv(PROJECT_DIR / ".env", override=False)

DB_PATH = os.getenv("SQLITE_DB_PATH", str(BACKEND_DIR / "hirevision.db"))
DATABASE_URL = (
    os.getenv("DATABASE_URL")
    or os.getenv("POSTGRES_PRISMA_URL")
    or os.getenv("POSTGRES_URL")
    or os.getenv("POSTGRES_URL_NON_POOLING")
)
DATABASE_BACKEND = os.getenv("DATABASE_BACKEND", "sqlite").lower().strip()
USE_POSTGRES = DATABASE_BACKEND in {"postgres", "postgresql"}

if USE_POSTGRES and not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_BACKEND=postgres requires DATABASE_URL or a POSTGRES_* connection URL."
    )

try:
    import psycopg
except ImportError:  # pragma: no cover - only needed for PostgreSQL deployments
    psycopg = None


INTEGRITY_ERRORS = (sqlite3.IntegrityError,)
if psycopg:
    INTEGRITY_ERRORS = INTEGRITY_ERRORS + (psycopg.IntegrityError,)


class HybridRow(Mapping):
    """A row that supports both row[0] and row['column'] access."""

    def __init__(self, columns, values):
        self._data = dict(zip(columns, values))
        self._values = tuple(values)

    def __getitem__(self, key):
        if isinstance(key, int):
            return self._values[key]
        return self._data[key]

    def __iter__(self):
        return iter(self._data)

    def __len__(self):
        return len(self._data)

    def as_dict(self):
        return dict(self._data)


def row_to_dict(row):
    """Convert SQLite, PostgreSQL, or HybridRow results to a plain dict."""
    if isinstance(row, HybridRow):
        return row.as_dict()
    if hasattr(row, "keys"):
        return {key: row[key] for key in row.keys()}
    return dict(row)


class PostgresCursor:
    def __init__(self, cursor):
        self._cursor = cursor
        self._columns = []

    @staticmethod
    def _adapt_query(query):
        # Existing application queries use SQLite's '?' placeholders.
        return query.replace("?", "%s")

    def execute(self, query, params=None):
        self._cursor.execute(self._adapt_query(query), params or ())
        self._columns = [column.name for column in (self._cursor.description or [])]
        return self

    def executemany(self, query, params_seq):
        self._cursor.executemany(self._adapt_query(query), params_seq)
        self._columns = [column.name for column in (self._cursor.description or [])]
        return self

    def _wrap(self, row):
        return HybridRow(self._columns, row) if row is not None else None

    def fetchone(self):
        return self._wrap(self._cursor.fetchone())

    def fetchall(self):
        return [self._wrap(row) for row in self._cursor.fetchall()]

    @property
    def lastrowid(self):
        # PostgreSQL has no cursor.lastrowid. All inserts that need the id use
        # a sequence-backed primary key, so LASTVAL() is safe here.
        self._cursor.execute("SELECT LASTVAL()")
        return self._cursor.fetchone()[0]


class PostgresConnection:
    def __init__(self, connection):
        self._connection = connection

    def cursor(self):
        return PostgresCursor(self._connection.cursor())

    def commit(self):
        self._connection.commit()

    def rollback(self):
        self._connection.rollback()

    def close(self):
        self._connection.close()


def get_db():
    if USE_POSTGRES:
        if psycopg is None:
            raise RuntimeError("psycopg is required when DATABASE_BACKEND=postgres.")
        return PostgresConnection(psycopg.connect(DATABASE_URL))

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    """Create tables if they don't already exist and seed initial multi-year cohort."""
    conn = get_db()
    cursor = conn.cursor()
    id_type = "BIGSERIAL PRIMARY KEY" if USE_POSTGRES else "INTEGER PRIMARY KEY AUTOINCREMENT"
    id_ref_type = "BIGINT" if USE_POSTGRES else "INTEGER"
    real_type = "DOUBLE PRECISION" if USE_POSTGRES else "REAL"

    # Students table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id {id_type},
        roll_no TEXT UNIQUE,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        branch TEXT NOT NULL,
        batch_year TEXT NOT NULL,
        cgpa {real_type} NOT NULL,
        tenth_pct {real_type} NOT NULL,
        twelfth_pct {real_type} NOT NULL,
        attendance_pct {real_type} NOT NULL,
        active_backlogs INTEGER NOT NULL DEFAULT 0,
        programming_score INTEGER NOT NULL DEFAULT 7,
        aptitude_score INTEGER NOT NULL DEFAULT 6,
        communication_score INTEGER NOT NULL DEFAULT 6,
        tech_interview_score INTEGER NOT NULL DEFAULT 7,
        mock_interview_score INTEGER NOT NULL DEFAULT 7,
        internships INTEGER NOT NULL DEFAULT 1,
        projects INTEGER NOT NULL DEFAULT 2,
        hackathons INTEGER NOT NULL DEFAULT 0,
        certifications INTEGER NOT NULL DEFAULT 1,
        problem_solving INTEGER NOT NULL DEFAULT 7,
        english_fluency INTEGER NOT NULL DEFAULT 7,
        placed_status TEXT NOT NULL DEFAULT 'In-Progress',
        company_placed TEXT DEFAULT '',
        package_lpa {real_type} DEFAULT 0.0,
        confidence_pct {real_type} DEFAULT 75.0,
        created_at TEXT NOT NULL
    );
    """.format(id_type=id_type, real_type=real_type))

    # Prediction assessments table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS predictions (
        id {id_type},
        student_id {id_ref_type},
        student_name TEXT NOT NULL,
        branch TEXT NOT NULL,
        batch_year TEXT NOT NULL,
        cgpa {real_type} NOT NULL,
        probability_placed {real_type} NOT NULL,
        predicted_tier TEXT NOT NULL,
        weaknesses_json TEXT,
        suggestions_json TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE
    );
    """.format(id_type=id_type, id_ref_type=id_ref_type, real_type=real_type))

    # Company placement drives table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS company_drives (
        id {id_type},
        company_name TEXT NOT NULL,
        role TEXT NOT NULL,
        min_cgpa {real_type} NOT NULL,
        max_backlogs INTEGER NOT NULL DEFAULT 0,
        min_programming INTEGER NOT NULL DEFAULT 6,
        eligible_branches TEXT NOT NULL,
        package_lpa {real_type} NOT NULL,
        drive_date TEXT NOT NULL,
        batch_year TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Upcoming'
    );
    """.format(id_type=id_type, real_type=real_type))

    conn.commit()

    # Check if empty, seed authentic GIET multi-year dataset
    cursor.execute("SELECT COUNT(*) FROM students")
    count = cursor.fetchone()[0]
    if count == 0:
        seed_initial_data(conn)

    conn.close()
    location = DATABASE_URL.split("?")[0] if USE_POSTGRES else DB_PATH
    print(f"[HireVision DB] [OK] {DATABASE_BACKEND} database initialized: {location}")


def seed_initial_data(conn):
    """Seed comprehensive sample records for 2026, 2025, and 2024 batches."""
    cursor = conn.cursor()
    now = datetime.now().isoformat()

    sample_students = [
        # --- Current Batch (2026) ---
        ("22CSE011", "Omm Abinash Barik", "ommabinash11@gmail.com", "CSE", "2026", 8.65, 88.0, 85.5, 92.0, 0, 9, 8, 8, 9, 9, 2, 4, 2, 3, 9, 8, "Shortlisted (Amazon)", "Amazon Web Services", 18.5, 92.0, now),
        ("22AIML042", "DibyaJyoti Pradhan", "dibyajyoti@giet.edu", "CSE-AIML", "2026", 9.12, 92.0, 91.0, 95.0, 0, 9, 9, 8, 9, 9, 3, 5, 3, 4, 9, 9, "Shortlisted (Microsoft)", "Microsoft IDC", 24.0, 96.0, now),
        ("22AIML018", "Jyotiranjan Mohakud", "jyotiranjan@giet.edu", "CSE-AIML", "2026", 9.02, 90.0, 89.0, 93.0, 0, 8, 8, 8, 9, 8, 2, 4, 2, 3, 8, 8, "Placed (HighRadius)", "HighRadius", 10.5, 88.0, now),
        ("22ECE054", "Shubhankar Mishra", "shubhankar@giet.edu", "ECE", "2026", 7.42, 78.0, 75.0, 84.0, 0, 6, 7, 7, 6, 7, 1, 2, 1, 2, 7, 7, "In-Progress", "", 0.0, 68.0, now),
        ("22MECH009", "Dillip Kumar Chaudhury", "dillip@giet.edu", "Mechanical", "2026", 6.85, 72.0, 68.0, 80.0, 1, 5, 5, 6, 5, 5, 1, 2, 0, 1, 5, 6, "Needs Training", "", 0.0, 48.0, now),
        ("22CSE105", "Priyanka Senapati", "priyanka.s@giet.edu", "CSE", "2026", 8.40, 86.0, 84.0, 90.0, 0, 8, 7, 8, 8, 8, 2, 3, 1, 2, 8, 8, "Placed (Infosys SE)", "Infosys", 9.5, 85.0, now),
        ("22EEE023", "Rajesh Kumar Nayak", "rajesh.n@giet.edu", "EEE", "2026", 7.10, 74.0, 71.0, 82.0, 0, 6, 6, 6, 6, 6, 1, 2, 0, 1, 6, 6, "In-Progress", "", 0.0, 62.0, now),
        ("22CIVIL015", "Ananya Rath", "ananya.r@giet.edu", "Civil", "2026", 6.95, 70.0, 72.0, 78.0, 1, 5, 6, 7, 5, 6, 1, 1, 0, 1, 5, 7, "Needs Training", "", 0.0, 51.0, now),

        # --- Past Batch (2025) ---
        ("21CSE088", "Rohan Dash", "rohan.d21@giet.edu", "CSE", "2025", 8.80, 89.0, 87.0, 94.0, 0, 9, 8, 9, 8, 9, 2, 4, 2, 3, 9, 8, "Placed (TCS Digital)", "Tata Consultancy Services", 7.5, 90.0, now),
        ("21AIML033", "Swastik Mohapatra", "swastik.m21@giet.edu", "CSE-AIML", "2025", 8.95, 91.0, 88.0, 93.0, 0, 9, 8, 8, 9, 9, 2, 4, 3, 4, 9, 8, "Placed (Cognizant GenC Pro)", "Cognizant", 8.5, 91.0, now),
        ("21ECE019", "Subhashree Panda", "subhashree.p21@giet.edu", "ECE", "2025", 8.10, 82.0, 80.0, 88.0, 0, 7, 8, 8, 7, 8, 2, 3, 1, 2, 7, 8, "Placed (Wipro Turbo)", "Wipro", 6.5, 82.0, now),
        ("21MECH045", "Soumya Ranjan Tripathy", "soumya.t21@giet.edu", "Mechanical", "2025", 7.60, 79.0, 76.0, 85.0, 0, 6, 7, 7, 7, 7, 2, 3, 1, 2, 7, 7, "Placed (Tata Motors)", "Tata Motors", 6.8, 74.0, now),
        ("21EEE012", "Alok Kumar Sahoo", "alok.s21@giet.edu", "EEE", "2025", 6.70, 71.0, 69.0, 80.0, 2, 5, 5, 5, 5, 5, 0, 1, 0, 1, 5, 6, "Not Placed", "", 0.0, 42.0, now),

        # --- Historical Batch (2024) ---
        ("20CSE004", "Akash Panda", "akash.p20@giet.edu", "CSE", "2024", 9.25, 94.0, 92.0, 96.0, 0, 10, 9, 9, 9, 10, 3, 5, 4, 5, 10, 9, "Placed (Oracle)", "Oracle Cloud", 16.0, 97.0, now),
        ("20AIML002", "Deepak Kumar Sutar", "deepak.s20@giet.edu", "CSE-AIML", "2024", 8.70, 88.0, 86.0, 91.0, 0, 8, 8, 8, 8, 8, 2, 4, 2, 3, 8, 8, "Placed (Capgemini)", "Capgemini Engineering", 7.5, 87.0, now),
        ("20ECE072", "Pooja Panigrahi", "pooja.p20@giet.edu", "ECE", "2024", 7.80, 80.0, 78.0, 86.0, 0, 7, 7, 8, 7, 7, 1, 2, 1, 2, 7, 8, "Placed (L&T Tech)", "L&T Technology Services", 6.0, 78.0, now),
        ("20CIVIL031", "Bhabani Shankar Behera", "bhabani.b20@giet.edu", "Civil", "2024", 7.30, 75.0, 74.0, 83.0, 0, 6, 6, 6, 6, 6, 1, 2, 0, 1, 6, 6, "Placed (Shapoorji Pallonji)", "Shapoorji Pallonji", 5.5, 65.0, now)
    ]

    cursor.executemany("""
    INSERT INTO students (
        roll_no, name, email, branch, batch_year, cgpa, tenth_pct, twelfth_pct, attendance_pct,
        active_backlogs, programming_score, aptitude_score, communication_score, tech_interview_score,
        mock_interview_score, internships, projects, hackathons, certifications, problem_solving,
        english_fluency, placed_status, company_placed, package_lpa, confidence_pct, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, sample_students)

    # Seed placement drives
    sample_drives = [
        ("Amazon Web Services", "Software Development Engineer (SDE-1)", 8.0, 0, 8, "CSE,CSE-AIML,ECE", 18.5, "2026-10-15", "2026", "Upcoming"),
        ("Microsoft IDC", "Full Stack Developer", 8.5, 0, 8, "CSE,CSE-AIML", 24.0, "2026-10-22", "2026", "Upcoming"),
        ("HighRadius", "Product Engineer", 7.5, 0, 7, "CSE,CSE-AIML,ECE,EEE", 10.5, "2026-11-05", "2026", "Scheduled"),
        ("Infosys Limited", "Specialist Programmer", 7.0, 1, 7, "CSE,CSE-AIML,ECE,EEE,Mechanical,Civil", 9.5, "2026-11-12", "2026", "Scheduled"),
        ("Tata Consultancy Services", "TCS Digital / Prime", 6.5, 0, 6, "CSE,CSE-AIML,ECE,EEE,Mechanical,Civil", 7.5, "2026-11-20", "2026", "Scheduled"),
        ("Tata Motors", "Graduate Engineer Trainee", 6.8, 0, 5, "Mechanical,EEE,Civil", 6.8, "2026-11-25", "2026", "Scheduled")
    ]

    cursor.executemany("""
    INSERT INTO company_drives (
        company_name, role, min_cgpa, max_backlogs, min_programming, eligible_branches,
        package_lpa, drive_date, batch_year, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, sample_drives)

    conn.commit()
