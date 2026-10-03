"""
HireVision AI — SQLite Database Module
Manages student records, predictions, multi-year cohorts, and placement drives.
"""

import sqlite3
import os
import json
from typing import List, Dict, Any, Optional
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "hirevision.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Create tables if they don't already exist and seed initial multi-year cohort."""
    conn = get_db()
    cursor = conn.cursor()

    # Students table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        roll_no TEXT UNIQUE,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        branch TEXT NOT NULL,
        batch_year TEXT NOT NULL,
        cgpa REAL NOT NULL,
        tenth_pct REAL NOT NULL,
        twelfth_pct REAL NOT NULL,
        attendance_pct REAL NOT NULL,
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
        package_lpa REAL DEFAULT 0.0,
        confidence_pct REAL DEFAULT 75.0,
        created_at TEXT NOT NULL
    );
    """)

    # Prediction assessments table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        student_name TEXT NOT NULL,
        branch TEXT NOT NULL,
        batch_year TEXT NOT NULL,
        cgpa REAL NOT NULL,
        probability_placed REAL NOT NULL,
        predicted_tier TEXT NOT NULL,
        weaknesses_json TEXT,
        suggestions_json TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE
    );
    """)

    # Company placement drives table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS company_drives (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_name TEXT NOT NULL,
        role TEXT NOT NULL,
        min_cgpa REAL NOT NULL,
        max_backlogs INTEGER NOT NULL DEFAULT 0,
        min_programming INTEGER NOT NULL DEFAULT 6,
        eligible_branches TEXT NOT NULL,
        package_lpa REAL NOT NULL,
        drive_date TEXT NOT NULL,
        batch_year TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Upcoming'
    );
    """)

    conn.commit()

    # Check if empty, seed authentic GIET multi-year dataset
    cursor.execute("SELECT COUNT(*) FROM students")
    count = cursor.fetchone()[0]
    if count == 0:
        seed_initial_data(conn)

    conn.close()
    print(f"[HireVision DB] [OK] SQLite database initialized at: {DB_PATH}")


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
