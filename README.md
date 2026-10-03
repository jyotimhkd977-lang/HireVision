# HireVision AI 🎓

> **See your placement potential.**

HireVision AI is an AI-powered campus placement prediction platform built for students, placement coordinators, and administrators at **GIET University, Gunupur, Rayagada, Odisha**.

The platform evaluates academic performance, technical skills, aptitude, interviews, internships, projects, and other placement indicators to provide a placement prediction, personalized improvement suggestions, and useful analytics.

![HireVision AI campus](frontend/assets/GIET%20Image.jpg)

## ✨ Features

| Feature | Description |
| --- | --- |
| 🧠 **AI Placement Prediction** | Evaluates 20 academic and skill parameters to estimate placement probability. |
| 💡 **Personalized Suggestions** | Provides targeted improvement tips for each weak area. |
| 📊 **Analytics Dashboard** | Displays branch-wise charts, CGPA distribution, and placement insights. |
| 📋 **Prediction History** | Maintains a complete ledger of previous evaluations. |
| 🛡️ **Admin Portal** | Provides a restricted dashboard for Career Services staff. |
| 📱 **Fully Responsive** | Works across mobile, tablet, and desktop screens. |
| ⚡ **Offline Friendly** | Uses a built-in heuristic model when the API is unavailable. |

## 🏗️ Project structure

```text
HIRE VISION/
├── Backend/
│   ├── main.py                # FastAPI prediction endpoint
│   ├── db.py                  # SQLite database access and seed data
│   ├── train_model.py         # Model training script
│   ├── model.pkl              # Trained prediction model
│   ├── hirevision.db          # SQLite database
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── index.html             # SPA entry point
│   ├── assets/
│   │   └── GIET Image.jpg      # Campus hero image
│   ├── css/
│   │   ├── variables.css       # Design tokens: colors, fonts, spacing
│   │   ├── global.css          # Reset, utilities, and shared styles
│   │   ├── nav.css             # Navigation styles
│   │   ├── landing.css         # Landing page styles
│   │   └── pages.css           # Auth, dashboard, form, and result styles
│   └── js/
│       ├── state.js            # App state, session, and utilities
│       ├── router.js            # SPA hash router
│       ├── nav.js               # Navigation component
│       ├── landing.js           # Landing page view
│       ├── auth.js              # Login and registration
│       ├── dashboard.js         # Student dashboard
│       ├── predict.js           # Prediction form and API call
│       ├── result.js            # Result report and history ledger
│       ├── admin.js             # Admin login, dashboard, and charts
│       └── app.js               # Entry point and route registration
└── README.md
```

## 🚀 Quick start

### 1. Open the frontend

Open `frontend/index.html` in a modern web browser. The frontend works without a server and falls back to the built-in heuristic model when the API is not running.

### 2. Start the backend API (optional)

From the project root, run:

```bash
cd Backend
pip install -r requirements.txt
```

To train the model first:

```bash
python train_model.py
```

Start the API server:

```bash
python main.py
```

Or run it with Uvicorn:

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at:

- Application: <http://127.0.0.1:8000>
- Interactive docs: <http://127.0.0.1:8000/docs>
- Health check: <http://127.0.0.1:8000/>

## ☁️ Deploy with Supabase PostgreSQL

The backend uses SQLite when `DATABASE_BACKEND=sqlite` (the local default) and PostgreSQL when `DATABASE_BACKEND=postgres`. The root `.env` file is ignored by Git and is configured for local SQLite development.

### Render backend

1. Create a Render Web Service from this repository. The included `render.yaml` can also be used as a Blueprint.
2. Set the service root directory to `Backend` if you are configuring it manually.
3. Use `pip install -r requirements.txt` as the build command and `uvicorn main:app --host 0.0.0.0 --port $PORT` as the start command.
4. Add these Render environment variables:

   ```text
   DATABASE_BACKEND=postgres
   DATABASE_URL=<your Supabase POSTGRES_PRISMA_URL or POSTGRES_URL>
   CORS_ORIGINS=https://<your-vercel-project>.vercel.app
   ```

   Copy the PostgreSQL URL from the Supabase/Vercel database dashboard into Render’s secret environment variable field; do not commit it to the repository. The application creates the three tables and seeds the sample data on first startup.

### Vercel frontend

1. Import the same repository into Vercel and set the project root directory to `frontend`.
2. Deploy it as a static site with no build command and `index.html` as the entry point.
3. After the Render service has a public URL, set that URL in `frontend/js/config.js` as `apiBase`, then redeploy Vercel:

   ```js
   apiBase: 'https://<your-render-service>.onrender.com'
   ```

The frontend uses local SQLite-backed API defaults when opened from a file and uses the configured Render URL when deployed. Only the backend should receive the PostgreSQL password and Supabase service credentials; never put those values in frontend files or `NEXT_PUBLIC_*` variables.

## 🔌 API reference

### `POST /predict`

Example request:

```json
{
  "Age": 21,
  "Gender": "Male",
  "Degree": "B.Tech",
  "Branch": "CSE",
  "CGPA": 8.2,
  "10th_Percentage": 85,
  "12th_Percentage": 82,
  "Attendance_Percentage": 90,
  "Active_Backlogs": 0,
  "Programming_Score": 7,
  "Aptitude_Score": 6,
  "Communication_Score": 6,
  "Technical_Interview_Score": 7,
  "Mock_Interview_Score": 7,
  "Internships": 1,
  "Projects": 3,
  "Hackathons": 1,
  "Certifications": 2,
  "Problem_Solving": 7,
  "English_Fluency": 7
}
```

Example response:

```json
{
  "placed": true,
  "prediction": 1,
  "probability_not_placed": 0.18,
  "probability_placed": 0.82
}
```

## 🎨 Design system

| Token | Value | Usage |
| --- | --- | --- |
| Paper | `#F1ECE0` | Page background |
| Card | `#FBF8F1` | Card background |
| Navy | `#1C2B45` | Primary ink and headings |
| Gold | `#A9782F` | Accent and eyebrows |
| Stamp green | `#2E5233` | Placed status |
| Stamp red | `#8C2F39` | Not-placed status |

**Typography:** Lora for headings, IBM Plex Sans for body text, and IBM Plex Mono for labels and UI metadata.

## 🧰 Technology

- HTML5, CSS3, and vanilla JavaScript
- FastAPI and Python
- Machine-learning prediction model
- Responsive, mobile-first interface

## 👥 Credits

Built by **Abhi, Jyoti, and Shubhankar** at **GIET University, Gunupur, Rayagada, Odisha**.

**Model version:** `v1.0`
