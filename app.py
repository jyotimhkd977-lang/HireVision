from __future__ import annotations

import pickle
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional

import joblib
import pandas as pd
import numpy as np
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"

app = Flask(__name__, static_folder=str(BASE_DIR), static_url_path="")
CORS(app, resources={r"/api/*": {"origins": "*"}})

MODEL = None
MODEL_PATH = None
MODEL_ERROR = None
MODEL_FEATURES: List[str] = []

PREFERRED_FEATURES = [
    "Age",
    "Gender",
    "Branch",
    "CGPA",
    "Tenth_Percentage",
    "Twelfth_Percentage",
    "Backlogs",
    "Attendance",
    "Programming_Skill",
    "Aptitude_Score",
    "Communication_Skill",
    "Soft_Skills",
    "Coding_Rating",
    "Projects",
    "Internships",
    "Certifications",
    "Hackathons",
]

FEATURE_ALIASES = {
    "age": "Age",
    "Age": "Age",
    "gender": "Gender",
    "Gender": "Gender",
    "branch": "Branch",
    "Branch": "Branch",
    "cgpa": "CGPA",
    "CGPA": "CGPA",
    "tenth_percentage": "Tenth_Percentage",
    "Tenth_Percentage": "Tenth_Percentage",
    "tenth_percent": "Tenth_Percentage",
    "tenth": "Tenth_Percentage",
    "twelfth_percentage": "Twelfth_Percentage",
    "Twelfth_Percentage": "Twelfth_Percentage",
    "twelfth_percent": "Twelfth_Percentage",
    "twelfth": "Twelfth_Percentage",
    "backlogs": "Backlogs",
    "Backlogs": "Backlogs",
    "attendance": "Attendance",
    "Attendance": "Attendance",
    "programming_skill": "Programming_Skill",
    "Programming_Skill": "Programming_Skill",
    "programming": "Programming_Skill",
    "aptitude_score": "Aptitude_Score",
    "Aptitude_Score": "Aptitude_Score",
    "aptitude": "Aptitude_Score",
    "communication_skill": "Communication_Skill",
    "Communication_Skill": "Communication_Skill",
    "communication": "Communication_Skill",
    "soft_skills": "Soft_Skills",
    "Soft_Skills": "Soft_Skills",
    "soft": "Soft_Skills",
    "coding_rating": "Coding_Rating",
    "Coding_Rating": "Coding_Rating",
    "coding": "Coding_Rating",
    "projects": "Projects",
    "Projects": "Projects",
    "internships": "Internships",
    "Internships": "Internships",
    "certifications": "Certifications",
    "Certifications": "Certifications",
    "hackathons": "Hackathons",
    "Hackathons": "Hackathons",
}

REQUIRED_FIELDS = [
    "Age",
    "Gender",
    "Branch",
    "CGPA",
    "Tenth_Percentage",
    "Twelfth_Percentage",
    "Backlogs",
    "Attendance",
    "Programming_Skill",
    "Aptitude_Score",
    "Communication_Skill",
    "Soft_Skills",
    "Coding_Rating",
    "Projects",
    "Internships",
    "Certifications",
    "Hackathons",
]


def find_model_file() -> Optional[Path]:
    root_candidates = [BASE_DIR, MODEL_DIR]
    for root in root_candidates:
        if not root.exists():
            continue
        for pattern in ("*.pkl", "*.joblib", "*.pickle"):
            matches = sorted(root.glob(pattern), key=lambda p: p.name.lower())
            for path in matches:
                name_l = path.name.lower()
                if any(keyword in name_l for keyword in ("hirevision", "student", "placement", "predict", "model")):
                    return path
    for root in root_candidates:
        if not root.exists():
            continue
        for pattern in ("*.pkl", "*.joblib", "*.pickle"):
            matches = sorted(root.glob(pattern), key=lambda p: p.name.lower())
            if matches:
                return matches[0]
    return None


def load_model():
    global MODEL, MODEL_PATH, MODEL_ERROR, MODEL_FEATURES

    if MODEL is not None:
        return MODEL

    model_path = find_model_file()
    if model_path is None:
        MODEL_ERROR = (
            "No trained ML model file found. Place your .pkl/.joblib file in the project root or in the models/ folder."
        )
        return None

    try:
        MODEL = joblib.load(model_path)
    except Exception:
        try:
            with open(model_path, "rb") as f:
                MODEL = pickle.load(f)
        except Exception as exc:
            MODEL_ERROR = f"Could not load the model file '{model_path.name}': {exc}"
            return None

    MODEL_PATH = model_path
    MODEL_ERROR = None

    try:
        feature_names = getattr(MODEL, "feature_names_in_", None)
        if feature_names is not None:
            MODEL_FEATURES = list(feature_names)
        else:
            MODEL_FEATURES = list(PREFERRED_FEATURES)
    except Exception:
        MODEL_FEATURES = list(PREFERRED_FEATURES)

    return MODEL


def collect_requested_values(payload: Dict[str, Any]) -> Dict[str, Any]:
    normalized: Dict[str, Any] = {}
    for key, value in payload.items():
        mapped = FEATURE_ALIASES.get(str(key).strip())
        if mapped is not None:
            normalized[mapped] = value
        else:
            normalized[str(key).strip()] = value
    return normalized


def normalize_branch(value: Any) -> str:
    text = str(value).strip()
    if not text:
        return "CSE"
    mapping = {
        "cse": "CSE",
        "cse-aiml": "CSE-AIML",
        "cse aiml": "CSE-AIML",
        "cse-ds": "CSE-DS",
        "cse ds": "CSE-DS",
        "cse-cybersecurity": "CSE-CyberSecurity",
        "cse cybersecurity": "CSE-CyberSecurity",
        "ece": "ECE",
        "ece-vlsi": "ECE-VLSI",
        "ece vlsi": "ECE-VLSI",
        "eee": "EEE",
        "mechanical": "Mechanical",
        "civil": "Civil",
        "aircraft & maintainance": "Aircraft & Maintainance",
        "aircraft and maintainance": "Aircraft & Maintainance",
        "biotech": "Biotech",
        "bca": "BCA",
        "mca": "MCA",
        "bba": "BBA",
        "mba": "MBA",
        "it": "CSE",
    }
    return mapping.get(text.lower(), text)


def normalize_gender(value: Any) -> str:
    text = str(value).strip()
    if not text:
        return "Female"
    mapping = {"male": "Male", "m": "Male", "female": "Female", "f": "Female", "other": "Other"}
    return mapping.get(text.lower(), text)


def build_feature_row(payload: Dict[str, Any]) -> Dict[str, Any]:
    cleaned = collect_requested_values(payload)

    row: Dict[str, Any] = {}
    for feature in PREFERRED_FEATURES:
        if feature == "Gender":
            row[feature] = normalize_gender(cleaned.get(feature, cleaned.get("gender", "Female")))
        elif feature == "Branch":
            row[feature] = normalize_branch(cleaned.get(feature, cleaned.get("branch", "CSE")))
        else:
            value = cleaned.get(feature)
            if value is None:
                row[feature] = 0
            else:
                try:
                    row[feature] = float(value)
                except (TypeError, ValueError):
                    row[feature] = 0

    return row


def convert_to_model_input(row: Dict[str, Any], model_features: Iterable[str]) -> pd.DataFrame:
    columns = list(model_features)
    frame = pd.DataFrame([row], columns=columns)

    if not columns:
        return pd.DataFrame([row])

    # Fill any missing features with zeros
    for col in columns:
        if col not in frame.columns:
            frame[col] = 0

    # Reorder columns exactly as expected by model
    frame = frame[columns]

    # If there are any object/string columns, create dummy columns for model compatibility.
    object_cols = [c for c in frame.columns if frame[c].dtype == object or pd.api.types.is_string_dtype(frame[c])]
    if object_cols:
        encoded = pd.get_dummies(frame, columns=object_cols, dtype=float)
        return encoded

    return frame


def determine_predicted_label(prediction_value: Any) -> str:
    if isinstance(prediction_value, (list, tuple, np.ndarray)):
        prediction_value = prediction_value[0]

    if hasattr(prediction_value, "item"):
        prediction_value = prediction_value.item()

    if isinstance(prediction_value, (str, bytes)):
        label_text = str(prediction_value).strip().lower()
        if "placed" in label_text:
            return "Placed"
        return "Not Placed"

    try:
        value = int(float(prediction_value))
    except (TypeError, ValueError):
        return "Not Placed"

    return "Placed" if value >= 1 else "Not Placed"


def determine_confidence(model: Any, prediction_value: Any, feature_frame: pd.DataFrame) -> float:
    try:
        if hasattr(model, "predict_proba"):
            proba = model.predict_proba(feature_frame)
            if hasattr(proba, "__len__") and len(proba) > 0:
                arr = np.asarray(proba[0])
                pred_label = determine_predicted_label(prediction_value)

                classes = getattr(model, "classes_", None)
                if classes is not None:
                    class_values = list(classes)
                    class_index = 0
                    for idx, cls in enumerate(class_values):
                        if str(cls).lower() == pred_label.lower() or int(float(cls)) == (1 if pred_label == "Placed" else 0):
                            class_index = idx
                            break
                    confidence = float(arr[class_index]) if class_index < len(arr) else float(arr[-1])
                    return round(confidence * 100, 2)

                confidence = float(arr[0]) if len(arr) == 1 else float(arr[1] if pred_label == "Placed" else arr[0])
                return round(confidence * 100, 2)
    except Exception:
        pass

    return 50.0


def generate_tips(payload: Dict[str, Any]) -> List[str]:
    tips: List[str] = []
    aptitude = float(payload.get("Aptitude_Score", 0) or 0)
    internships = float(payload.get("Internships", 0) or 0)
    hackathons = float(payload.get("Hackathons", 0) or 0)
    communication = float(payload.get("Communication_Skill", 0) or 0)
    certifications = float(payload.get("Certifications", 0) or 0)
    cgpa = float(payload.get("CGPA", 0) or 0)

    if aptitude < 7:
        tips.append("Aptitude score trails the rest of your profile — a weekly mock test would close this gap fastest.")
    if internships < 2:
        tips.append("One more internship would materially improve your placement probability.")
    if hackathons < 1:
        tips.append("Try joining a coding contest or hackathon; recruiters value hands-on competitive exposure.")
    if communication < 7:
        tips.append("Book a mock interview session to strengthen communication and confidence before campus drives.")
    if certifications < 2:
        tips.append("Add a relevant certification in your core technology stack to strengthen your profile.")
    if cgpa < 7.5:
        tips.append("Improving your CGPA will reduce risk and increase your odds in shortlist-driven rounds.")

    if not tips:
        tips.append("Your profile looks well balanced — keep consistency in academics and coding practice to maintain momentum.")

    return tips[:3]


def fallback_predict(row: Dict[str, Any]) -> Dict[str, Any]:
    cgpa = float(row.get("CGPA", 0) or 0)
    tenth = float(row.get("Tenth_Percentage", 0) or 0)
    twelfth = float(row.get("Twelfth_Percentage", 0) or 0)
    attendance = float(row.get("Attendance", 0) or 0)
    prog = float(row.get("Programming_Skill", 0) or 0)
    apt = float(row.get("Aptitude_Score", 0) or 0)
    comm = float(row.get("Communication_Skill", 0) or 0)
    soft = float(row.get("Soft_Skills", 0) or 0)
    code = float(row.get("Coding_Rating", 0) or 0)
    proj = float(row.get("Projects", 0) or 0)
    intern = float(row.get("Internships", 0) or 0)
    cert = float(row.get("Certifications", 0) or 0)
    hack = float(row.get("Hackathons", 0) or 0)

    score = (
        ((prog + apt + comm + soft + code) / 5) * 7
        + proj * 3
        + intern * 6
        + cert * 2
        + hack * 3
        + cgpa * 5
        + (tenth + twelfth) / 2 * 0.2
        + attendance * 0.15
    )

    placed = score >= 62
    confidence = max(35, min(95, round((score / 100) * 100, 2)))

    return {
        "prediction": "Placed" if placed else "Not Placed",
        "confidence": confidence,
        "model_path": str(MODEL_PATH) if MODEL_PATH else None,
        "demo_mode": True,
        "tips": generate_tips(row),
        "warning": MODEL_ERROR if MODEL_ERROR else "No trained model file found. Using demo fallback logic.",
    }


def predict_from_payload(raw_payload: Dict[str, Any]) -> Dict[str, Any]:
    if not isinstance(raw_payload, dict):
        raise ValueError("Request payload must be a JSON object.")

    missing = []
    for field in REQUIRED_FIELDS:
        if field not in collect_requested_values(raw_payload):
            missing.append(field)

    if missing:
        raise ValueError(f"Missing required fields: {', '.join(missing)}")

    row = build_feature_row(raw_payload)
    model = load_model()
    if model is None:
        return fallback_predict(row)

    feature_names = list(getattr(model, "feature_names_in_", MODEL_FEATURES) or MODEL_FEATURES or PREFERRED_FEATURES)
    frame = convert_to_model_input(row, feature_names)

    try:
        prediction_value = model.predict(frame)
    except Exception:
        fallback = pd.DataFrame([row], columns=PREFERRED_FEATURES)
        prediction_value = model.predict(fallback)

    prediction_label = determine_predicted_label(prediction_value)
    confidence = determine_confidence(model, prediction_value, frame)

    return {
        "prediction": prediction_label,
        "confidence": confidence,
        "model_path": str(MODEL_PATH) if MODEL_PATH else None,
        "tips": generate_tips(row),
        "demo_mode": False,
    }


@app.route("/health")
def health_check():
    return jsonify({
        "status": "ok",
        "model_loaded": MODEL is not None,
        "demo_mode": MODEL is None,
        "model_path": str(MODEL_PATH) if MODEL_PATH else None,
        "model_error": MODEL_ERROR,
    })


@app.route("/api/model-info")
def model_info():
    model = load_model()
    if model is None:
        return jsonify({
            "model_type": "demo_fallback",
            "model_path": str(MODEL_PATH) if MODEL_PATH else None,
            "features": PREFERRED_FEATURES,
            "demo_mode": True,
            "warning": MODEL_ERROR or "No trained model file found. Demo fallback is active.",
        })

    return jsonify({
        "model_type": type(model).__name__,
        "model_path": str(MODEL_PATH),
        "features": list(getattr(model, "feature_names_in_", MODEL_FEATURES) or MODEL_FEATURES or PREFERRED_FEATURES),
        "demo_mode": False,
    })


@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "Request body must be valid JSON."}), 400

    try:
        result = predict_from_payload(data)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"error": f"Prediction failed: {exc}"}), 500

    return jsonify(result)


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_app(path: str):
    if path and (BASE_DIR / path).exists():
        return send_from_directory(str(BASE_DIR), path)
    return send_from_directory(str(BASE_DIR), "index.html")


if __name__ == "__main__":
    load_model()
    app.run(host="0.0.0.0", port=5000, debug=True)
