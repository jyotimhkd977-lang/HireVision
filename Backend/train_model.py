"""
HireVision AI — Model Training Script
Run this once to train and save the placement prediction model as model.pkl.
Uses a synthetic dataset if no real data is available.
"""

import os
import pickle
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

print("=" * 60)
print("  HireVision AI — Placement Prediction Model Trainer")
print("=" * 60)

# ──────────────────────────────────────────────────────────
# 1. Generate synthetic training data
# ──────────────────────────────────────────────────────────
np.random.seed(42)
N = 2000  # samples

# Features: Age, Gender, CGPA, 10th, 12th, Attendance, Backlogs,
#           Prog, Apt, Comm, TechInt, MockInt, Intern, Proj, Hack, Certs, ProbSolv, English
def make_sample():
    age        = np.random.randint(18, 25)
    gender     = np.random.randint(0, 3)
    cgpa       = np.clip(np.random.normal(7.5, 1.2), 4.0, 10.0)
    tenth      = np.clip(np.random.normal(78, 12), 40, 100)
    twelfth    = np.clip(np.random.normal(75, 12), 40, 100)
    attendance = np.clip(np.random.normal(82, 10), 50, 100)
    backlogs   = max(0, int(np.random.exponential(0.8)))
    prog       = np.clip(int(np.random.normal(6, 2)), 1, 10)
    apt        = np.clip(int(np.random.normal(6, 2)), 1, 10)
    comm       = np.clip(int(np.random.normal(6, 2)), 1, 10)
    tech       = np.clip(int(np.random.normal(6, 2)), 1, 10)
    mock       = np.clip(int(np.random.normal(6, 2)), 1, 10)
    intern_    = max(0, int(np.random.exponential(0.8)))
    projects   = max(0, int(np.random.exponential(2.0)))
    hackathons = max(0, int(np.random.exponential(0.6)))
    certs      = max(0, int(np.random.exponential(1.0)))
    prob_solv  = np.clip(int(np.random.normal(6, 2)), 1, 10)
    english    = np.clip(int(np.random.normal(6, 2)), 1, 10)
    return [age, gender, cgpa, tenth, twelfth, attendance, backlogs,
            prog, apt, comm, tech, mock, intern_, projects, hackathons,
            certs, prob_solv, english]

X_list = [make_sample() for _ in range(N)]
X = np.array(X_list, dtype=float)

# Simulate labels with realistic placement logic
def label(row):
    _, _, cgpa, tenth, twelfth, attendance, backlogs, \
    prog, apt, comm, tech, mock, intern_, proj, hack, certs, prob, eng = row
    score = (
        (cgpa / 10) * 0.30 +
        (prog + apt + comm + tech + mock + prob + eng) / 7 / 10 * 0.40 +
        min(1.0, (intern_ * 0.3 + proj * 0.1 + hack * 0.2 + certs * 0.1)) * 0.20 +
        (0.10 if backlogs == 0 else max(0, 0.10 - backlogs * 0.05))
    )
    prob_val = 1 / (1 + np.exp(-10 * (score - 0.5)))
    return int(np.random.rand() < prob_val)

y = np.array([label(row) for row in X_list])
print(f"Dataset: {N} samples | Placed: {y.sum()} ({y.mean()*100:.1f}%)")

# ──────────────────────────────────────────────────────────
# 2. Train / test split
# ──────────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# ──────────────────────────────────────────────────────────
# 3. Model pipeline
# ──────────────────────────────────────────────────────────
pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('clf', GradientBoostingClassifier(
        n_estimators=200,
        learning_rate=0.08,
        max_depth=4,
        subsample=0.85,
        random_state=42,
    )),
])

print("\nTraining Gradient Boosting Classifier…")
pipeline.fit(X_train, y_train)

# ──────────────────────────────────────────────────────────
# 4. Evaluate
# ──────────────────────────────────────────────────────────
y_pred = pipeline.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"\nTest Accuracy: {acc*100:.2f}%")
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=["Not Placed", "Placed"]))

# ──────────────────────────────────────────────────────────
# 5. Save model
# ──────────────────────────────────────────────────────────
model_path = os.path.join(os.path.dirname(__file__), "model.pkl")
bundle = {"model": pipeline, "encoders": {}}
with open(model_path, "wb") as f:
    pickle.dump(bundle, f)
print(f"\n[OK] Model saved to: {model_path}")
print("   Run `python main.py` (or uvicorn) to start the API server.")
