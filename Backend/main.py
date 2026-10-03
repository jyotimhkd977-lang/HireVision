"""
HireVision AI — FastAPI ML Prediction & SQLite Student Management Backend
Provides endpoints for ML placement prediction, multi-year student management,
company drive matching, and analytics.
"""

from __future__ import annotations

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Literal, Optional, List, Dict, Any
import os
import math
import json
from datetime import datetime

# Import database module. SQLite remains the local default; PostgreSQL is
# selected with DATABASE_BACKEND=postgres in Render/Vercel environments.
try:
    from db import get_db, init_db, DATABASE_BACKEND, row_to_dict, INTEGRITY_ERRORS
except ImportError:
    from .db import get_db, init_db, DATABASE_BACKEND, row_to_dict, INTEGRITY_ERRORS

# ──────────────────────────────────────────────────────────
# App setup
# ──────────────────────────────────────────────────────────
app = FastAPI(
    title="HireVision AI Prediction & Management API",
    description="Campus placement prediction & student database backend for HireVision AI.",
    version="2.0.0",
)

configured_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "*").split(",")
    if origin.strip()
]
allow_all_origins = configured_origins == ["*"]

# Allow requests from the frontend (file://, localhost, and the configured Vercel URL).
app.add_middleware(
    CORSMiddleware,
    allow_origins=configured_origins,
    allow_credentials=not allow_all_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────────────────
# Request / Response models
# ──────────────────────────────────────────────────────────
class PredictionRequest(BaseModel):
    Age: int                         = Field(21, ge=17, le=35)
    Gender: Literal["Male", "Female", "Other"] = Field("Male")
    Degree: str                      = Field("B.Tech", min_length=1)
    Branch: str                      = Field("CSE", min_length=1)
    CGPA: float                      = Field(..., ge=0, le=10)
    field_10th: float                = Field(..., ge=0, le=100, alias="10th_Percentage")
    field_12th: float                = Field(..., ge=0, le=100, alias="12th_Percentage")
    Attendance_Percentage: float     = Field(85.0, ge=0, le=100)
    Active_Backlogs: int             = Field(0, ge=0, le=50)
    Programming_Score: int           = Field(7, ge=1, le=10)
    Aptitude_Score: int              = Field(6, ge=1, le=10)
    Communication_Score: int         = Field(6, ge=1, le=10)
    Technical_Interview_Score: int   = Field(7, ge=1, le=10)
    Mock_Interview_Score: int        = Field(7, ge=1, le=10)
    Internships: int                 = Field(1, ge=0, le=20)
    Projects: int                    = Field(2, ge=0, le=50)
    Hackathons: int                  = Field(0, ge=0, le=30)
    Certifications: int              = Field(1, ge=0, le=30)
    Problem_Solving: int             = Field(7, ge=1, le=10)
    English_Fluency: int             = Field(7, ge=1, le=10)

    model_config = {"populate_by_name": True}


class PredictionResponse(BaseModel):
    placed: bool
    prediction: int               # 1 = placed, 0 = not placed
    probability_placed: float
    probability_not_placed: float
    confidence_percentage: float
    tier: str
    suggestions: List[str]


class StudentCreate(BaseModel):
    roll_no: str
    name: str
    email: str
    branch: str
    batch_year: str = "2026"
    cgpa: float
    tenth_pct: float = 80.0
    twelfth_pct: float = 80.0
    attendance_pct: float = 85.0
    active_backlogs: int = 0
    programming_score: int = 7
    aptitude_score: int = 6
    communication_score: int = 6
    tech_interview_score: int = 7
    mock_interview_score: int = 7
    internships: int = 1
    projects: int = 2
    hackathons: int = 0
    certifications: int = 1
    problem_solving: int = 7
    english_fluency: int = 7
    placed_status: str = "In-Progress"
    company_placed: str = ""
    package_lpa: float = 0.0


class StudentUpdate(BaseModel):
    roll_no: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    branch: Optional[str] = None
    batch_year: Optional[str] = None
    cgpa: Optional[float] = None
    tenth_pct: Optional[float] = None
    twelfth_pct: Optional[float] = None
    attendance_pct: Optional[float] = None
    active_backlogs: Optional[int] = None
    programming_score: Optional[int] = None
    aptitude_score: Optional[int] = None
    communication_score: Optional[int] = None
    tech_interview_score: Optional[int] = None
    mock_interview_score: Optional[int] = None
    internships: Optional[int] = None
    projects: Optional[int] = None
    hackathons: Optional[int] = None
    certifications: Optional[int] = None
    problem_solving: Optional[int] = None
    english_fluency: Optional[int] = None
    placed_status: Optional[str] = None
    company_placed: Optional[str] = None
    package_lpa: Optional[float] = None
    confidence_pct: Optional[float] = None


class DriveMatchRequest(BaseModel):
    company_name: str
    min_cgpa: float = 7.0
    max_backlogs: int = 0
    min_programming: int = 6
    eligible_branches: List[str] = ["CSE", "CSE-AIML", "ECE"]
    batch_year: str = "2026"


# ──────────────────────────────────────────────────────────
# Model loading (Scikit-Learn)
# ──────────────────────────────────────────────────────────
_model = None
_label_encoders: dict = {}

def _try_load_model():
    """Attempt to load a pre-trained sklearn model from disk."""
    global _model, _label_encoders
    model_path = os.path.join(os.path.dirname(__file__), "model.pkl")
    if not os.path.exists(model_path):
        return False
    try:
        import pickle
        with open(model_path, "rb") as f:
            bundle = pickle.load(f)
        if isinstance(bundle, dict):
            _model          = bundle.get("model")
            _label_encoders = bundle.get("encoders", {})
        else:
            _model = bundle
        print("[HireVision] [OK] Trained model loaded from model.pkl")
        return True
    except Exception as e:
        print(f"[HireVision] [WARN] Model load failed: {e}")
        return False


def _heuristic_score(req: PredictionRequest) -> float:
    """Logistic heuristic approximating placement probability."""
    cgpa_norm       = req.CGPA / 10.0
    tenth_norm      = req.field_10th / 100.0
    twelfth_norm    = req.field_12th / 100.0
    attendance_norm = req.Attendance_Percentage / 100.0
    backlog_penalty = max(0, 1 - req.Active_Backlogs * 0.18)
    academic = (cgpa_norm * 0.50 + tenth_norm * 0.20 + twelfth_norm * 0.20 + attendance_norm * 0.10) * backlog_penalty

    skill_avg = (
        req.Programming_Score +
        req.Aptitude_Score +
        req.Communication_Score +
        req.Technical_Interview_Score +
        req.Mock_Interview_Score +
        req.Problem_Solving +
        req.English_Fluency
    ) / 7.0
    skills = skill_avg / 10.0

    exp_score = min(1.0,
        req.Internships    * 0.30 +
        req.Projects       * 0.15 +
        req.Hackathons     * 0.20 +
        req.Certifications * 0.10
    )

    bonus = 0.0
    if req.CGPA >= 8.5 and req.Active_Backlogs == 0:
        bonus = 0.10
    elif req.CGPA >= 7.5 and req.Active_Backlogs == 0:
        bonus = 0.05

    raw = academic * 0.35 + skills * 0.35 + exp_score * 0.20 + bonus
    prob = 1 / (1 + math.exp(-10 * (raw - 0.5)))
    return round(min(0.98, max(0.02, prob)), 4)


def _predict_with_model(req: PredictionRequest) -> float:
    """Use sklearn model if available, otherwise heuristic."""
    if _model is None:
        return _heuristic_score(req)
    try:
        import numpy as np
        gender_map = {"Male": 0, "Female": 1, "Other": 2}
        gender_enc = gender_map.get(req.Gender, 0)
        features = np.array([[
            req.Age, gender_enc, req.CGPA, req.field_10th, req.field_12th,
            req.Attendance_Percentage, req.Active_Backlogs, req.Programming_Score,
            req.Aptitude_Score, req.Communication_Score, req.Technical_Interview_Score,
            req.Mock_Interview_Score, req.Internships, req.Projects, req.Hackathons,
            req.Certifications, req.Problem_Solving, req.English_Fluency
        ]])
        if hasattr(_model, "predict_proba"):
            probs = _model.predict_proba(features)[0]
            classes = list(_model.classes_)
            return float(probs[classes.index(1)] if 1 in classes else probs[-1])
        else:
            pred = _model.predict(features)[0]
            return 0.85 if pred == 1 else 0.25
    except Exception:
        return _heuristic_score(req)


def _get_tier_and_suggestions(prob: float, req: PredictionRequest) -> tuple[str, List[str]]:
    if prob >= 0.85:
        tier = "Super-Dream Potential (15+ LPA)"
    elif prob >= 0.70:
        tier = "Dream Potential (8–14 LPA)"
    elif prob >= 0.50:
        tier = "Core & IT Services (4–7 LPA)"
    else:
        tier = "Needs Active Support (< 4 LPA)"

    suggestions = []
    if req.Active_Backlogs > 0:
        suggestions.append(f"Clear your {req.Active_Backlogs} active backlogs immediately as most Tier-1 recruiters enforce 0 backlogs.")
    if req.Programming_Score < 7:
        suggestions.append("Level up Data Structures & Algorithms on LeetCode/CodeChef to reach medium/hard proficiency.")
    if req.Aptitude_Score < 7:
        suggestions.append("Practice daily quantitative & logical aptitude mock drills to clear screening rounds.")
    if req.Internships == 0:
        suggestions.append("Target at least one summer internship or open-source contribution to strengthen industry relevance.")
    if req.Projects < 2:
        suggestions.append("Build and deploy 2 production-ready full-stack or AI projects with GitHub documentation.")
    if not suggestions:
        suggestions.append("Maintain strong competitive programming consistency and practice mock system design interviews.")

    return tier, suggestions


# ──────────────────────────────────────────────────────────
# Startup Event
# ──────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    init_db()
    _try_load_model()


# ──────────────────────────────────────────────────────────
# Endpoints: Health & Metadata
# ──────────────────────────────────────────────────────────
@app.get("/", summary="Health & System Status")
async def root():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM students")
    student_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(DISTINCT batch_year) FROM students")
    batch_count = cursor.fetchone()[0]
    conn.close()

    return {
        "service": "HireVision AI Backend & ML Engine",
        "version": "2.0.0",
        "status":  "running",
        "database": DATABASE_BACKEND,
        "model": "loaded" if _model else "heuristic-engine",
        "total_students_in_db": student_count,
        "active_batches": batch_count
    }


# ──────────────────────────────────────────────────────────
# Endpoints: ML Prediction
# ──────────────────────────────────────────────────────────
@app.post("/predict", response_model=PredictionResponse, summary="Predict placement probability")
async def predict(req: PredictionRequest):
    try:
        prob = _predict_with_model(req)
        placed = prob >= 0.50
        prob_not = round(1.0 - prob, 4)
        conf_pct = round(prob * 100, 1)
        tier, suggestions = _get_tier_and_suggestions(prob, req)

        return PredictionResponse(
            placed=placed,
            prediction=1 if placed else 0,
            probability_placed=prob,
            probability_not_placed=prob_not,
            confidence_percentage=conf_pct,
            tier=tier,
            suggestions=suggestions
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")


# ──────────────────────────────────────────────────────────
# Endpoints: Student Management (SQLite/PostgreSQL CRUD)
# ──────────────────────────────────────────────────────────
@app.get("/api/students", summary="List students with multi-year & branch filters")
async def get_students(
    batch_year: Optional[str] = Query(None, description="Filter by cohort: '2026', '2025', '2024' or 'all'"),
    branch: Optional[str] = Query(None, description="Filter by branch: 'CSE', 'CSE-AIML', etc."),
    status: Optional[str] = Query(None, description="Filter by placed_status"),
    search: Optional[str] = Query(None, description="Search by name, roll_no or email")
):
    conn = get_db()
    cursor = conn.cursor()

    query = "SELECT * FROM students WHERE 1=1"
    params = []

    if batch_year and batch_year.lower() != "all":
        query += " AND batch_year = ?"
        params.append(batch_year)
    if branch and branch.lower() != "all":
        query += " AND branch = ?"
        params.append(branch)
    if status and status.lower() != "all":
        query += " AND placed_status LIKE ?"
        params.append(f"%{status}%")
    if search:
        query += " AND (name LIKE ? OR roll_no LIKE ? OR email LIKE ? OR company_placed LIKE ?)"
        term = f"%{search}%"
        params.extend([term, term, term, term])

    query += " ORDER BY id DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    return [row_to_dict(row) for row in rows]


@app.post("/api/students", summary="Add a new student to the database")
async def create_student(student: StudentCreate):
    conn = get_db()
    cursor = conn.cursor()

    # Calculate initial confidence via AI predictor
    req = PredictionRequest(
        CGPA=student.cgpa,
        field_10th=student.tenth_pct,
        field_12th=student.twelfth_pct,
        Attendance_Percentage=student.attendance_pct,
        Active_Backlogs=student.active_backlogs,
        Programming_Score=student.programming_score,
        Aptitude_Score=student.aptitude_score,
        Communication_Score=student.communication_score,
        Technical_Interview_Score=student.tech_interview_score,
        Mock_Interview_Score=student.mock_interview_score,
        Internships=student.internships,
        Projects=student.projects,
        Hackathons=student.hackathons,
        Certifications=student.certifications,
        Problem_Solving=student.problem_solving,
        English_Fluency=student.english_fluency,
        Branch=student.branch
    )
    prob = _predict_with_model(req)
    conf_pct = round(prob * 100, 1)

    try:
        cursor.execute("""
        INSERT INTO students (
            roll_no, name, email, branch, batch_year, cgpa, tenth_pct, twelfth_pct, attendance_pct,
            active_backlogs, programming_score, aptitude_score, communication_score, tech_interview_score,
            mock_interview_score, internships, projects, hackathons, certifications, problem_solving,
            english_fluency, placed_status, company_placed, package_lpa, confidence_pct, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            student.roll_no, student.name, student.email, student.branch, student.batch_year,
            student.cgpa, student.tenth_pct, student.twelfth_pct, student.attendance_pct,
            student.active_backlogs, student.programming_score, student.aptitude_score,
            student.communication_score, student.tech_interview_score, student.mock_interview_score,
            student.internships, student.projects, student.hackathons, student.certifications,
            student.problem_solving, student.english_fluency, student.placed_status,
            student.company_placed, student.package_lpa, conf_pct, datetime.now().isoformat()
        ))
        new_id = cursor.lastrowid
        # Read the sequence value before committing so this also works with
        # Supabase's transaction-pooled PostgreSQL connection.
        conn.commit()
        cursor.execute("SELECT * FROM students WHERE id = ?", (new_id,))
        created = row_to_dict(cursor.fetchone())
        conn.close()
        return {"status": "success", "message": "Student created successfully", "student": created}
    except INTEGRITY_ERRORS as e:
        conn.close()
        raise HTTPException(status_code=400, detail=f"Student with this roll number or email already exists: {e}")
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/students/{student_id}", summary="Get single student details")
async def get_student(student_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM students WHERE id = ?", (student_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Student not found")
    return row_to_dict(row)


@app.put("/api/students/{student_id}", summary="Update student in the database")
async def update_student(student_id: int, updates: StudentUpdate):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM students WHERE id = ?", (student_id,))
    current = cursor.fetchone()
    if not current:
        conn.close()
        raise HTTPException(status_code=404, detail="Student not found")

    update_dict = {k: v for k, v in updates.dict().items() if v is not None}
    if not update_dict:
        conn.close()
        return {"status": "no_change", "student": row_to_dict(current)}

    # If academics or scores changed, recalculate confidence
    recalc_keys = {"cgpa", "tenth_pct", "twelfth_pct", "active_backlogs", "programming_score", "aptitude_score", "internships"}
    if any(k in update_dict for k in recalc_keys):
        merged = {**row_to_dict(current), **update_dict}
        req = PredictionRequest(
            CGPA=merged["cgpa"],
            field_10th=merged["tenth_pct"],
            field_12th=merged["twelfth_pct"],
            Attendance_Percentage=merged["attendance_pct"],
            Active_Backlogs=merged["active_backlogs"],
            Programming_Score=merged["programming_score"],
            Aptitude_Score=merged["aptitude_score"],
            Communication_Score=merged["communication_score"],
            Technical_Interview_Score=merged["tech_interview_score"],
            Mock_Interview_Score=merged["mock_interview_score"],
            Internships=merged["internships"],
            Projects=merged["projects"],
            Hackathons=merged["hackathons"],
            Certifications=merged["certifications"],
            Problem_Solving=merged["problem_solving"],
            English_Fluency=merged["english_fluency"],
            Branch=merged["branch"]
        )
        prob = _predict_with_model(req)
        update_dict["confidence_pct"] = round(prob * 100, 1)

    set_clause = ", ".join([f"{k} = ?" for k in update_dict.keys()])
    values = list(update_dict.values()) + [student_id]

    cursor.execute(f"UPDATE students SET {set_clause} WHERE id = ?", values)
    conn.commit()

    cursor.execute("SELECT * FROM students WHERE id = ?", (student_id,))
    updated = row_to_dict(cursor.fetchone())
    conn.close()
    return {"status": "success", "message": "Student updated successfully", "student": updated}


@app.delete("/api/students/{student_id}", summary="Delete student from the database")
async def delete_student(student_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM students WHERE id = ?", (student_id,))
    conn.commit()
    conn.close()
    return {"status": "success", "message": f"Student #{student_id} removed from records."}


@app.post("/api/students/{student_id}/predict", summary="Run on-demand AI prediction for a student")
async def run_student_prediction(student_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM students WHERE id = ?", (student_id,))
    s = cursor.fetchone()
    if not s:
        conn.close()
        raise HTTPException(status_code=404, detail="Student not found")

    student = row_to_dict(s)
    req = PredictionRequest(
        CGPA=student["cgpa"],
        field_10th=student["tenth_pct"],
        field_12th=student["twelfth_pct"],
        Attendance_Percentage=student["attendance_pct"],
        Active_Backlogs=student["active_backlogs"],
        Programming_Score=student["programming_score"],
        Aptitude_Score=student["aptitude_score"],
        Communication_Score=student["communication_score"],
        Technical_Interview_Score=student["tech_interview_score"],
        Mock_Interview_Score=student["mock_interview_score"],
        Internships=student["internships"],
        Projects=student["projects"],
        Hackathons=student["hackathons"],
        Certifications=student["certifications"],
        Problem_Solving=student["problem_solving"],
        English_Fluency=student["english_fluency"],
        Branch=student["branch"]
    )

    prob = _predict_with_model(req)
    conf_pct = round(prob * 100, 1)
    tier, suggestions = _get_tier_and_suggestions(prob, req)

    cursor.execute("UPDATE students SET confidence_pct = ? WHERE id = ?", (conf_pct, student_id))
    cursor.execute("""
    INSERT INTO predictions (
        student_id, student_name, branch, batch_year, cgpa, probability_placed,
        predicted_tier, weaknesses_json, suggestions_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        student_id, student["name"], student["branch"], student["batch_year"], student["cgpa"],
        prob, tier, json.dumps([]), json.dumps(suggestions), datetime.now().isoformat()
    ))
    conn.commit()
    conn.close()

    return {
        "student_id": student_id,
        "name": student["name"],
        "confidence_pct": conf_pct,
        "tier": tier,
        "suggestions": suggestions,
        "placed": prob >= 0.50
    }


# ──────────────────────────────────────────────────────────
# Endpoints: Multi-Year Analytics & Company Matcher
# ──────────────────────────────────────────────────────────
@app.get("/api/analytics/cohorts", summary="Multi-year cohort analytics & KPIs")
async def get_cohort_analytics():
    conn = get_db()
    cursor = conn.cursor()

    batches = ["2026", "2025", "2024"]
    stats = {}

    for b in batches:
        cursor.execute("SELECT COUNT(*) FROM students WHERE batch_year = ?", (b,))
        total = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM students WHERE batch_year = ? AND (placed_status LIKE 'Placed%' OR placed_status LIKE 'Shortlisted%')", (b,))
        placed = cursor.fetchone()[0]

        cursor.execute("SELECT AVG(cgpa), AVG(confidence_pct), AVG(package_lpa) FROM students WHERE batch_year = ?", (b,))
        averages = cursor.fetchone()
        avg_cgpa, avg_conf, avg_pkg = averages[0], averages[1], averages[2]

        stats[b] = {
            "total_students": total,
            "placed_students": placed,
            "placement_rate": round((placed / total * 100), 1) if total > 0 else 0,
            "avg_cgpa": round(avg_cgpa or 0, 2),
            "avg_confidence": round(avg_conf or 0, 1),
            "avg_package_lpa": round(avg_pkg or 0, 1)
        }

    # Branch breakdown for current batch
    cursor.execute("""
    SELECT branch, COUNT(*) as count,
           SUM(CASE WHEN placed_status LIKE 'Placed%' OR placed_status LIKE 'Shortlisted%' THEN 1 ELSE 0 END) as placed_count,
           AVG(confidence_pct) as avg_conf
    FROM students
    GROUP BY branch
    """)
    branch_rows = cursor.fetchall()
    branch_stats = {row["branch"]: {
        "count": row["count"],
        "placed": row["placed_count"],
        "rate": round((row["placed_count"] / row["count"] * 100), 1) if row["count"] > 0 else 0,
        "avg_confidence": round(row["avg_conf"] or 0, 1)
    } for row in branch_rows}

    conn.close()

    return {
        "cohorts": stats,
        "branches": branch_stats,
        "database_type": DATABASE_BACKEND
    }


@app.post("/api/drives/match", summary="Match eligible students for a company drive")
async def match_drive_eligibility(req: DriveMatchRequest):
    conn = get_db()
    cursor = conn.cursor()

    branch_placeholders = ",".join(["?"] * len(req.eligible_branches))
    query = f"""
    SELECT * FROM students
    WHERE batch_year = ?
      AND cgpa >= ?
      AND active_backlogs <= ?
      AND programming_score >= ?
      AND branch IN ({branch_placeholders})
    ORDER BY cgpa DESC, confidence_pct DESC
    """
    params = [req.batch_year, req.min_cgpa, req.max_backlogs, req.min_programming] + req.eligible_branches

    cursor.execute(query, params)
    rows = cursor.fetchall()
    eligible = [row_to_dict(r) for r in rows]

    cursor.execute("SELECT COUNT(*) FROM students WHERE batch_year = ?", (req.batch_year,))
    total_batch = cursor.fetchone()[0]
    conn.close()

    return {
        "company_name": req.company_name,
        "criteria": {
            "min_cgpa": req.min_cgpa,
            "max_backlogs": req.max_backlogs,
            "min_programming": req.min_programming,
            "branches": req.eligible_branches,
            "batch_year": req.batch_year
        },
        "total_cohort": total_batch,
        "eligible_count": len(eligible),
        "eligibility_percentage": round((len(eligible) / total_batch * 100), 1) if total_batch > 0 else 0,
        "eligible_students": eligible
    }


@app.get("/api/drives", summary="List campus placement drives")
async def list_drives():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM company_drives ORDER BY drive_date ASC")
    rows = cursor.fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]


@app.post("/api/admin/reset-db", summary="Re-seed the database with default multi-year records")
async def reset_database():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DROP TABLE IF EXISTS students")
    cursor.execute("DROP TABLE IF EXISTS predictions")
    cursor.execute("DROP TABLE IF EXISTS company_drives")
    conn.commit()
    conn.close()

    init_db()
    return {"status": "success", "message": f"{DATABASE_BACKEND} database re-seeded with 2026, 2025, and 2024 cohorts."}


# ──────────────────────────────────────────────────────────
# Entry point
# ──────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
