/**
 * HireVision AI — Application State & Utilities
 * Shared state, helpers, and session management
 */

/* ============================================================
   SINGLE AUTHORIZED ADMIN CREDENTIALS (SENSITIVE / PROTECTED)
   ============================================================ */
const ADMIN_CREDENTIALS = Object.freeze({
  email: 'ommabinash11@gmail.com',
  password: 'Abhi@6370',
  name: 'Omm Abinash',
  title: 'Chief Placement Officer & System Administrator',
  role: 'admin'
});

/* ============================================================
   STATE
   ============================================================ */
const HV = {
  // Logged-in student
  currentUser: null,       // { name, email, branch, cgpa, etc. }
  isAdminLoggedIn: false,
  adminUser: null,         // Admin profile when authenticated

  // Prediction store
  history: [],             // Array of prediction records
  lastResult: null,        // Most recent prediction result + form data

  // Callbacks for nav re-render on auth change
  onAuthChange: null,
};

/* ============================================================
   STORAGE HELPERS
   ============================================================ */
const Store = {
  save(key, value) {
    try { localStorage.setItem(`hv_${key}`, JSON.stringify(value)); } catch (_) {}
  },
  load(key, fallback = null) {
    try {
      const raw = localStorage.getItem(`hv_${key}`);
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch (_) { return fallback; }
  },
  remove(key) { localStorage.removeItem(`hv_${key}`); },
};

/* ============================================================
   SESSION PERSISTENCE
   ============================================================ */
function loadSession() {
  HV.currentUser     = Store.load('user', null);
  HV.isAdminLoggedIn = Store.load('admin', false);
  HV.adminUser       = Store.load('adminUser', null);
  HV.history         = Store.load('history', []);
  HV.lastResult      = Store.load('lastResult', null);
}

function saveSession() {
  Store.save('user',       HV.currentUser);
  Store.save('admin',      HV.isAdminLoggedIn);
  Store.save('adminUser',  HV.adminUser);
  Store.save('history',    HV.history);
  Store.save('lastResult', HV.lastResult);
}

function logout() {
  HV.currentUser     = null;
  HV.isAdminLoggedIn = false;
  HV.adminUser       = null;
  Store.remove('user');
  Store.remove('admin');
  Store.remove('adminUser');
  if (HV.onAuthChange) HV.onAuthChange();
  Router.navigate('home');
  showToast('Logged out successfully.', 'info');
}

/* ============================================================
   TOAST
   ============================================================ */
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 3500);
}

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
function initScrollReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

/* ============================================================
   COUNTER ANIMATION
   ============================================================ */
function animateCounter(el, target, suffix = '', duration = 1800) {
  const start = performance.now();
  const isFloat = String(target).includes('.');
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
    const current = eased * target;
    el.textContent = (isFloat ? current.toFixed(2) : Math.floor(current).toLocaleString()) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function initCounters() {
  const counterEls = document.querySelectorAll('[data-counter]');
  if (!counterEls.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el     = e.target;
        const target = parseFloat(el.dataset.counter);
        const suffix = el.dataset.suffix || '';
        animateCounter(el, target, suffix);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counterEls.forEach(el => obs.observe(el));
}

/* ============================================================
   RANGE SLIDER VALUE DISPLAY
   ============================================================ */
function initSliders() {
  document.querySelectorAll('.form-range').forEach(range => {
    const display = range.closest('.range-wrap')?.querySelector('.range-value');
    if (!display) return;
    display.textContent = range.value;
    range.addEventListener('input', () => { display.textContent = range.value; });
  });
}

/* ============================================================
   FAQ ACCORDION
   ============================================================ */
function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item.open').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ============================================================
   FORM VALIDATION HELPERS
   ============================================================ */
function setError(input, msg) {
  input.classList.add('error');
  const errEl = input.closest('.form-group')?.querySelector('.form-error');
  if (errEl) { errEl.textContent = msg; errEl.classList.add('visible'); }
}

function clearError(input) {
  input.classList.remove('error');
  const errEl = input.closest('.form-group')?.querySelector('.form-error');
  if (errEl) { errEl.textContent = ''; errEl.classList.remove('visible'); }
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ============================================================
   RECOMMENDATION ENGINE (client-side)
   ============================================================ */
function generateRemarks(formData, placed) {
  const tips = [];
  if (formData.Active_Backlogs > 0)            tips.push('Clear all active backlogs — they are a red flag for most recruiters.');
  if (formData.Aptitude_Score < 6)             tips.push('Improve aptitude through weekly mock tests and timed practice sets.');
  if (formData.Communication_Score < 6)        tips.push('Practice communication skills through group discussions and mock interviews.');
  if (formData.Programming_Score < 6)          tips.push('Strengthen programming fundamentals — solve 3–5 LeetCode problems per day.');
  if (formData.Internships < 1)                tips.push('Complete at least one internship to demonstrate industry exposure.');
  if (formData.Hackathons < 1)                 tips.push('Participate in a hackathon or open-source coding contest to build your portfolio.');
  if (formData.CGPA < 7.0)                     tips.push('Focus on improving your CGPA — aim for 7.0+ in upcoming semesters.');
  if (formData.Certifications < 2)             tips.push('Earn two or more industry-recognized certifications in your domain.');
  if (formData.Technical_Interview_Score < 6)  tips.push('Practice technical interview questions in your domain and data structures.');
  if (formData.Attendance_Percentage < 75)     tips.push('Maintain at least 75% attendance — poor attendance affects recommendations.');
  if (formData.Mock_Interview_Score < 6)       tips.push('Attend career services mock interviews to improve your interview readiness.');
  if (!placed && tips.length === 0)            tips.push('You are borderline — focus on all areas to push your placement probability above 80%.');
  return tips.slice(0, 4);
}

function computeBreakdowns(fd) {
  const acad = ((fd.CGPA / 10) * 0.4 + (fd['10th_Percentage'] / 100) * 0.3 + (fd['12th_Percentage'] / 100) * 0.3) * 100;
  const prog = fd.Programming_Score * 10;
  const apt  = fd.Aptitude_Score   * 10;
  const comm = ((fd.Communication_Score + fd.English_Fluency) / 2) * 10;
  const exp  = Math.min(100, (fd.Internships * 20 + fd.Projects * 10 + fd.Hackathons * 15 + fd.Certifications * 10));
  return { Academics: Math.round(acad), Programming: prog, Aptitude: apt, Communication: comm, Experience: exp };
}

/* ============================================================
   SQLITE DATABASE API & SYNCHRONIZATION LAYER
   ============================================================ */
const API_BASE = 'http://127.0.0.1:8000';

const SQLiteDB = {
  // Check if FastAPI SQLite backend is active
  async isOnline() {
    try {
      const res = await fetch(`${API_BASE}/`, { method: 'GET', signal: AbortSignal.timeout(1200) });
      return res.ok;
    } catch (_) {
      return false;
    }
  },

  // Get multi-year student list
  async getStudents(params = {}) {
    try {
      const qs = new URLSearchParams();
      if (params.batch_year && params.batch_year !== 'all') qs.set('batch_year', params.batch_year);
      if (params.branch && params.branch !== 'all')         qs.set('branch', params.branch);
      if (params.status && params.status !== 'all')         qs.set('status', params.status);
      if (params.search)                                   qs.set('search', params.search);

      const res = await fetch(`${API_BASE}/api/students?${qs.toString()}`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        Store.save('sqlite_students_cache', data);
        return data;
      }
    } catch (_) {}

    // Fallback: local cached or default multi-year records
    return this._getLocalStudents(params);
  },

  async addStudent(studentData) {
    try {
      const res = await fetch(`${API_BASE}/api/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const result = await res.json();
        return result.student;
      }
    } catch (_) {}

    // Local fallback creation
    const local = this._getLocalStudents({ batch_year: 'all' });
    const newStudent = {
      id: Date.now(),
      ...studentData,
      confidence_pct: Math.round((studentData.cgpa / 10 * 0.5 + (studentData.programming_score || 7)/10 * 0.5) * 100),
      created_at: new Date().toISOString()
    };
    local.unshift(newStudent);
    Store.save('sqlite_students_cache', local);
    return newStudent;
  },

  async updateStudent(id, updateData) {
    try {
      const res = await fetch(`${API_BASE}/api/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const result = await res.json();
        return result.student;
      }
    } catch (_) {}

    const local = this._getLocalStudents({ batch_year: 'all' });
    const idx = local.findIndex(s => s.id === id || String(s.id) === String(id));
    if (idx !== -1) {
      local[idx] = { ...local[idx], ...updateData };
      Store.save('sqlite_students_cache', local);
      return local[idx];
    }
    return null;
  },

  async deleteStudent(id) {
    try {
      const res = await fetch(`${API_BASE}/api/students/${id}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) return true;
    } catch (_) {}

    let local = this._getLocalStudents({ batch_year: 'all' });
    local = local.filter(s => s.id !== id && String(s.id) !== String(id));
    Store.save('sqlite_students_cache', local);
    return true;
  },

  async predictStudent(id) {
    try {
      const res = await fetch(`${API_BASE}/api/students/${id}/predict`, {
        method: 'POST',
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    const local = this._getLocalStudents({ batch_year: 'all' });
    const s = local.find(item => item.id === id || String(item.id) === String(id));
    if (s) {
      const conf = Math.min(96, Math.max(45, Math.round((s.cgpa / 10 * 45) + (s.programming_score / 10 * 35) + (s.internships * 10))));
      s.confidence_pct = conf;
      Store.save('sqlite_students_cache', local);
      return { student_id: id, name: s.name, confidence_pct: conf, placed: conf >= 50, tier: conf >= 85 ? 'Super-Dream Potential' : 'Dream Potential' };
    }
    return null;
  },

  async getCohortAnalytics() {
    try {
      const res = await fetch(`${API_BASE}/api/analytics/cohorts`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return await res.json();
    } catch (_) {}

    // Fallback computed from local students
    const all = this._getLocalStudents({ batch_year: 'all' });
    const cohorts = {};
    ['2026', '2025', '2024'].forEach(y => {
      const batch = all.filter(s => s.batch_year === y);
      const placed = batch.filter(s => String(s.placed_status).includes('Placed') || String(s.placed_status).includes('Shortlisted'));
      const avgCgpa = batch.length ? (batch.reduce((a,b) => a + Number(b.cgpa), 0) / batch.length).toFixed(2) : '0';
      const avgPkg  = batch.length ? (batch.reduce((a,b) => a + Number(b.package_lpa || 0), 0) / batch.length).toFixed(1) : '0';
      cohorts[y] = {
        total_students: batch.length,
        placed_students: placed.length,
        placement_rate: batch.length ? Math.round((placed.length / batch.length) * 100) : 0,
        avg_cgpa: Number(avgCgpa),
        avg_package_lpa: Number(avgPkg)
      };
    });
    return { cohorts, database_type: 'SQLite3 (Local / Synced)' };
  },

  async matchDrives(criteria) {
    try {
      const res = await fetch(`${API_BASE}/api/drives/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(criteria),
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    const all = this._getLocalStudents({ batch_year: criteria.batch_year });
    const eligible = all.filter(s => {
      const cgpaOk = s.cgpa >= criteria.min_cgpa;
      const backlogsOk = s.active_backlogs <= criteria.max_backlogs;
      const progOk = s.programming_score >= criteria.min_programming;
      const branchOk = criteria.eligible_branches.includes(s.branch);
      return cgpaOk && backlogsOk && progOk && branchOk;
    });

    return {
      company_name: criteria.company_name,
      total_cohort: all.length,
      eligible_count: eligible.length,
      eligibility_percentage: all.length ? Math.round((eligible.length / all.length) * 100) : 0,
      eligible_students: eligible
    };
  },

  // Internal local storage fallback
  _getLocalStudents(params = {}) {
    let list = Store.load('sqlite_students_cache', null);
    if (!list || !list.length) {
      list = [
        // 2026 Batch
        { id: 1, roll_no: '22CSE011', name: 'Omm Abinash Barik', email: 'ommabinash11@gmail.com', branch: 'CSE', batch_year: '2026', cgpa: 8.65, tenth_pct: 88, twelfth_pct: 85.5, attendance_pct: 92, active_backlogs: 0, programming_score: 9, aptitude_score: 8, communication_score: 8, tech_interview_score: 9, mock_interview_score: 9, internships: 2, projects: 4, hackathons: 2, certifications: 3, problem_solving: 9, english_fluency: 8, placed_status: 'Shortlisted (Amazon)', company_placed: 'Amazon Web Services', package_lpa: 18.5, confidence_pct: 92.0 },
        { id: 2, roll_no: '22AIML042', name: 'DibyaJyoti Pradhan', email: 'dibyajyoti@giet.edu', branch: 'CSE-AIML', batch_year: '2026', cgpa: 9.12, tenth_pct: 92, twelfth_pct: 91.0, attendance_pct: 95, active_backlogs: 0, programming_score: 9, aptitude_score: 9, communication_score: 8, tech_interview_score: 9, mock_interview_score: 9, internships: 3, projects: 5, hackathons: 3, certifications: 4, problem_solving: 9, english_fluency: 9, placed_status: 'Shortlisted (Microsoft)', company_placed: 'Microsoft IDC', package_lpa: 24.0, confidence_pct: 96.0 },
        { id: 3, roll_no: '22AIML018', name: 'Jyotiranjan Mohakud', email: 'jyotiranjan@giet.edu', branch: 'CSE-AIML', batch_year: '2026', cgpa: 9.02, tenth_pct: 90, twelfth_pct: 89.0, attendance_pct: 93, active_backlogs: 0, programming_score: 8, aptitude_score: 8, communication_score: 8, tech_interview_score: 9, mock_interview_score: 8, internships: 2, projects: 4, hackathons: 2, certifications: 3, problem_solving: 8, english_fluency: 8, placed_status: 'Placed (HighRadius)', company_placed: 'HighRadius', package_lpa: 10.5, confidence_pct: 88.0 },
        { id: 4, roll_no: '22ECE054', name: 'Shubhankar Mishra', email: 'shubhankar@giet.edu', branch: 'ECE', batch_year: '2026', cgpa: 7.42, tenth_pct: 78, twelfth_pct: 75.0, attendance_pct: 84, active_backlogs: 0, programming_score: 6, aptitude_score: 7, communication_score: 7, tech_interview_score: 6, mock_interview_score: 7, internships: 1, projects: 2, hackathons: 1, certifications: 2, problem_solving: 7, english_fluency: 7, placed_status: 'In-Progress', company_placed: '', package_lpa: 0.0, confidence_pct: 68.0 },
        { id: 5, roll_no: '22MECH009', name: 'Dillip Kumar Chaudhury', email: 'dillip@giet.edu', branch: 'Mechanical', batch_year: '2026', cgpa: 6.85, tenth_pct: 72, twelfth_pct: 68.0, attendance_pct: 80, active_backlogs: 1, programming_score: 5, aptitude_score: 5, communication_score: 6, tech_interview_score: 5, mock_interview_score: 5, internships: 1, projects: 2, hackathons: 0, certifications: 1, problem_solving: 5, english_fluency: 6, placed_status: 'Needs Training', company_placed: '', package_lpa: 0.0, confidence_pct: 48.0 },
        { id: 6, roll_no: '22CSE105', name: 'Priyanka Senapati', email: 'priyanka.s@giet.edu', branch: 'CSE', batch_year: '2026', cgpa: 8.40, tenth_pct: 86, twelfth_pct: 84.0, attendance_pct: 90, active_backlogs: 0, programming_score: 8, aptitude_score: 7, communication_score: 8, tech_interview_score: 8, mock_interview_score: 8, internships: 2, projects: 3, hackathons: 1, certifications: 2, problem_solving: 8, english_fluency: 8, placed_status: 'Placed (Infosys SE)', company_placed: 'Infosys', package_lpa: 9.5, confidence_pct: 85.0 },

        // 2025 Batch
        { id: 7, roll_no: '21CSE088', name: 'Rohan Dash', email: 'rohan.d21@giet.edu', branch: 'CSE', batch_year: '2025', cgpa: 8.80, tenth_pct: 89, twelfth_pct: 87.0, attendance_pct: 94, active_backlogs: 0, programming_score: 9, aptitude_score: 8, communication_score: 9, tech_interview_score: 8, mock_interview_score: 9, internships: 2, projects: 4, hackathons: 2, certifications: 3, problem_solving: 9, english_fluency: 8, placed_status: 'Placed (TCS Digital)', company_placed: 'Tata Consultancy Services', package_lpa: 7.5, confidence_pct: 90.0 },
        { id: 8, roll_no: '21AIML033', name: 'Swastik Mohapatra', email: 'swastik.m21@giet.edu', branch: 'CSE-AIML', batch_year: '2025', cgpa: 8.95, tenth_pct: 91, twelfth_pct: 88.0, attendance_pct: 93, active_backlogs: 0, programming_score: 9, aptitude_score: 8, communication_score: 8, tech_interview_score: 9, mock_interview_score: 9, internships: 2, projects: 4, hackathons: 3, certifications: 4, problem_solving: 9, english_fluency: 8, placed_status: 'Placed (Cognizant)', company_placed: 'Cognizant GenC Pro', package_lpa: 8.5, confidence_pct: 91.0 },
        { id: 9, roll_no: '21ECE019', name: 'Subhashree Panda', email: 'subhashree.p21@giet.edu', branch: 'ECE', batch_year: '2025', cgpa: 8.10, tenth_pct: 82, twelfth_pct: 80.0, attendance_pct: 88, active_backlogs: 0, programming_score: 7, aptitude_score: 8, communication_score: 8, tech_interview_score: 7, mock_interview_score: 8, internships: 2, projects: 3, hackathons: 1, certifications: 2, problem_solving: 7, english_fluency: 8, placed_status: 'Placed (Wipro)', company_placed: 'Wipro Turbo', package_lpa: 6.5, confidence_pct: 82.0 },
        { id: 10, roll_no: '21EEE012', name: 'Alok Kumar Sahoo', email: 'alok.s21@giet.edu', branch: 'EEE', batch_year: '2025', cgpa: 6.70, tenth_pct: 71, twelfth_pct: 69.0, attendance_pct: 80, active_backlogs: 2, programming_score: 5, aptitude_score: 5, communication_score: 5, tech_interview_score: 5, mock_interview_score: 5, internships: 0, projects: 1, hackathons: 0, certifications: 1, problem_solving: 5, english_fluency: 6, placed_status: 'Not Placed', company_placed: '', package_lpa: 0.0, confidence_pct: 42.0 },

        // 2024 Batch
        { id: 11, roll_no: '20CSE004', name: 'Akash Panda', email: 'akash.p20@giet.edu', branch: 'CSE', batch_year: '2024', cgpa: 9.25, tenth_pct: 94, twelfth_pct: 92.0, attendance_pct: 96, active_backlogs: 0, programming_score: 10, aptitude_score: 9, communication_score: 9, tech_interview_score: 9, mock_interview_score: 10, internships: 3, projects: 5, hackathons: 4, certifications: 5, problem_solving: 10, english_fluency: 9, placed_status: 'Placed (Oracle)', company_placed: 'Oracle Cloud', package_lpa: 16.0, confidence_pct: 97.0 },
        { id: 12, roll_no: '20AIML002', name: 'Deepak Kumar Sutar', email: 'deepak.s20@giet.edu', branch: 'CSE-AIML', batch_year: '2024', cgpa: 8.70, tenth_pct: 88, twelfth_pct: 86.0, attendance_pct: 91, active_backlogs: 0, programming_score: 8, aptitude_score: 8, communication_score: 8, tech_interview_score: 8, mock_interview_score: 8, internships: 2, projects: 4, hackathons: 2, certifications: 3, problem_solving: 8, english_fluency: 8, placed_status: 'Placed (Capgemini)', company_placed: 'Capgemini Engineering', package_lpa: 7.5, confidence_pct: 87.0 }
      ];
      Store.save('sqlite_students_cache', list);
    }

    let result = [...list];
    if (params.batch_year && params.batch_year !== 'all') {
      result = result.filter(s => s.batch_year === params.batch_year);
    }
    if (params.branch && params.branch !== 'all') {
      result = result.filter(s => s.branch === params.branch);
    }
    if (params.status && params.status !== 'all') {
      result = result.filter(s => String(s.placed_status).toLowerCase().includes(params.status.toLowerCase()));
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.roll_no.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.company_placed && s.company_placed.toLowerCase().includes(q))
      );
    }
    return result;
  }
};
