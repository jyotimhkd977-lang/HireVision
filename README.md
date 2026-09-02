# HireVision AI

HireVision AI is a campus placement prediction web app designed for students, placement coordinators, and administrators. It presents a polished frontend experience for evaluating a student's placement readiness using academic, skill, and experience-based inputs.

This project is currently a static front-end prototype that demonstrates the full workflow:
- Student login/register flow
- Student dashboard with personal profile
- Placement prediction form
- Instant result screen with confidence score and suggestions
- Prediction history ledger
- Admin login and branch-wise analytics dashboard

## Project Overview

HireVision helps users estimate placement potential before the interview panel does. The app focuses on a student-friendly interface while also giving administrators a quick view of branch-wise placement performance and overall readiness trends.

## Current Features

### Student Experience
- Home landing page with project overview and CTA buttons
- Login/Register section for student accounts
- Personalized dashboard with profile summary
- Placement evaluation form with academic and skill parameters
- Prediction result screen showing likely placement outcome, confidence, and improvement advice
- History page showing previous predictions and trend tracking

### Admin Experience
- Admin login section
- Analytics dashboard with summary cards
- Branch-wise placement chart
- CGPA distribution chart
- Student records table for placement monitoring

### UI Highlights
- Modern academic theme with premium paper-and-ink styling
- Responsive layout for different screen sizes
- Chart.js visualizations for data comparison
- Custom branding for GIET University placement processes

## Tech Stack

- HTML5
- CSS3
- JavaScript
- Chart.js (CDN)
- Google Fonts

## Repository Structure

```bash
HireVision/
├── app.js               # Prediction logic and dashboard/chart behavior
├── index.html           # Main app layout and all sections/views
├── styles.css           # All styling, layout, and theme definitions
├── assets/
│   └── GIET Image.jpg   # Background image used in the home section
├── README.md            # Project documentation
└── .git/                # Git metadata
```

## How to Run

Because this is a front-end static site, you can run it in any of the following ways:

### Option 1: Open directly in browser
1. Go to the project folder
2. Open `index.html` in your browser

### Option 2: Run a local web server
From the project folder, run:

```bash
python -m http.server 8000
```

Then open:

```bash
http://localhost:8000
```

## App Flow

1. Open the home page
2. Navigate to Login/Register
3. Enter the dashboard
4. Fill the placement evaluation form
5. Submit for prediction
6. Review the result and improvement remarks
7. View the prediction history
8. Use admin login to access the admin dashboard

## Prediction Logic

The app currently uses a JavaScript-based scoring model to estimate placement probability. It combines:
- Programming skill
- Aptitude score
- Communication
- Soft skills
- Coding rating
- Projects
- Internships
- Certifications
- Hackathons

The computed result produces a binary outcome:
- Placed
- Not Placed

This is a prototype logic used to simulate the workflow and UI experience.

## Notes

- This project is currently a frontend demo/prototype.
- There is no real backend or database connected yet.
- The app uses static example data for demonstration purposes.
- The design and flows are intended to reflect a realistic placement prediction system.

## Credits

Designed and built for demonstration purposes with project team contributions reflected in the footer:
- Abhi
- Jyoti
- Shubhankar

## License

This project is for educational and demonstration use.
