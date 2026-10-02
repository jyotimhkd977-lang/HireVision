/**
 * HireVision AI — Secure Admin Portal & Multi-Year Student Management Studio
 * Features:
 * - SQLite database integration (hirevision.db)
 * - Multi-Year Cohort Manager (2026, 2025, 2024, Master Ledger)
 * - Full Student Record CRUD (Add, Edit, Delete, Update Placement Offer)
 * - On-Demand AI Placement Predictor
 * - Intelligent Company Drive Matcher (Eligibility Filter)
 * - High-Risk Early Warning & Intervention Analyzer
 * - Chart.js Multi-Year Analytics & CSV Export
 */

let currentBatchTab = '2026';
let currentAdminSubSection = 'students'; // 'analytics' | 'students' | 'matcher' | 'highrisk'

/* ============================================================
   ADMIN LOGIN PAGE (SECURE GATEWAY)
   ============================================================ */
function renderAdminLoginPage() {
  if (HV.isAdminLoggedIn && HV.adminUser?.email === ADMIN_CREDENTIALS.email) {
    Router.navigate('admin');
    return;
  }

  const main = document.getElementById('app-main');
  main.innerHTML = `
    <div class="auth-page">
      <div class="auth-box">
        <div class="auth-header">
          <p class="auth-eyebrow" style="color:var(--color-stamp-red);">Restricted Terminal · Level 5 Clearance</p>
          <div class="brand-seal" style="margin-inline:auto;margin-bottom:var(--space-4);color:var(--color-navy);width:48px;height:48px;font-size:var(--text-md);border-color:var(--color-stamp-red);">🛡️</div>
          <h2>Placement Cell Admin Portal</h2>
          <p>Confidential Placement Records · GIET University, Gunupur</p>
        </div>

        <div class="auth-card" style="border-top:3px solid var(--color-stamp-red);">
          <div style="background:rgba(140,47,57,0.06);border:1px solid rgba(140,47,57,0.2);padding:var(--space-3) var(--space-4);border-radius:var(--radius-sm);margin-bottom:var(--space-5);font-size:var(--text-xs);color:var(--color-stamp-red);font-family:var(--font-mono);">
            ⚠️ <strong>RESTRICTED ACCESS:</strong> Only the single authorized System Administrator / Chief Placement Officer may authenticate.
          </div>

          <form id="admin-form" novalidate>
            <div class="form-group">
              <label class="form-label" for="admin-email">Administrator Email / ID</label>
              <input class="form-input" type="email" id="admin-email"
                     placeholder="ommabinash11@gmail.com" autocomplete="username" required>
              <span class="form-error" id="admin-email-err" role="alert"></span>
            </div>
            <div class="form-group">
              <label class="form-label" for="admin-pass">Master Security Password</label>
              <input class="form-input" type="password" id="admin-pass"
                     placeholder="Enter administrator password" autocomplete="current-password" required>
              <span class="form-error" id="admin-pass-err" role="alert"></span>
            </div>
            <div class="form-group">
              <span class="form-error" id="admin-global-err" role="alert" style="display:block;"></span>
            </div>
            <button type="submit" class="btn btn-primary auth-submit" id="admin-submit" style="background:var(--color-stamp-red);border-color:var(--color-stamp-red);">
              <span id="admin-submit-text">Verify & Enter Admin Console →</span>
            </button>
          </form>
        </div>

        <div class="admin-login-notice" role="note">
          🔒 Strictly protected system. Public and student registration as Administrator is prohibited.<br>
          Unauthorized breach attempts are logged to the security audit ledger.
        </div>

        <div style="text-align:center;margin-top:var(--space-4);">
          <a href="#home" class="btn btn-ghost" style="font-size:var(--text-xs);">← Return to Public Portal</a>
        </div>
      </div>
    </div>
  `;

  const form = main.querySelector('#admin-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = main.querySelector('#admin-email').value.trim();
    const passInput  = main.querySelector('#admin-pass').value;
    const globalErr  = main.querySelector('#admin-global-err');
    const emailErr   = main.querySelector('#admin-email-err');
    const passErr    = main.querySelector('#admin-pass-err');

    let valid = true;
    if (!emailInput) {
      emailErr.textContent = 'Administrator Email / ID is required.';
      emailErr.classList.add('visible');
      valid = false;
    } else {
      emailErr.textContent = '';
      emailErr.classList.remove('visible');
    }

    if (!passInput) {
      passErr.textContent = 'Master password is required.';
      passErr.classList.add('visible');
      valid = false;
    } else {
      passErr.textContent = '';
      passErr.classList.remove('visible');
    }

    if (!valid) return;

    const btn  = main.querySelector('#admin-submit');
    const text = main.querySelector('#admin-submit-text');
    btn.disabled = true;
    text.innerHTML = '<span class="spinner"></span> Authenticating…';

    await new Promise(r => setTimeout(r, 900));

    btn.disabled = false;
    text.textContent = 'Verify & Enter Admin Console →';

    const isEmailValid = (emailInput.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase()) ||
                         (emailInput.toLowerCase() === 'ommabinash11');
    const isPassValid  = (passInput === ADMIN_CREDENTIALS.password);

    if (isEmailValid && isPassValid) {
      HV.isAdminLoggedIn = true;
      HV.adminUser = {
        name:  ADMIN_CREDENTIALS.name,
        email: ADMIN_CREDENTIALS.email,
        title: ADMIN_CREDENTIALS.title,
        role:  'admin',
        loginTime: new Date().toISOString()
      };
      HV.currentUser = null;
      saveSession();
      renderNav();
      showToast(`Welcome, Administrator ${ADMIN_CREDENTIALS.name} 🛡️`, 'success');
      Router.navigate('admin');
    } else {
      globalErr.textContent = 'Access Denied: Invalid administrator credentials. Only the designated Placement Administrator is authorized.';
      globalErr.classList.add('visible');
    }
  });
}

/* ============================================================
   ACCESS DENIED VIEW (403 FORBIDDEN DOCKET)
   ============================================================ */
function renderAccessDenied() {
  const main = document.getElementById('app-main');
  main.innerHTML = `
    <div class="auth-page">
      <div class="auth-box" style="max-width:560px;">
        <div class="auth-card" style="border:2px solid var(--color-stamp-red);text-align:center;padding:var(--space-10);">
          <div style="width:64px;height:64px;margin-inline:auto;margin-bottom:var(--space-4);background:rgba(140,47,57,0.1);border:2px solid var(--color-stamp-red);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;">
            ⛔
          </div>
          <p class="auth-eyebrow" style="color:var(--color-stamp-red);margin-bottom:var(--space-2);">HTTP 403 · Security Exception</p>
          <h2 style="color:var(--color-navy);margin-bottom:var(--space-3);">Access Denied: Sensitive Repository</h2>
          <p style="color:var(--color-navy-mid);font-size:var(--text-sm);line-height:1.6;margin-bottom:var(--space-6);">
            The Placement Cell Administrative Console contains confidential student placement records, SQLite database records, and predictive ML distributions.
            Access is strictly reserved for the single authorized system administrator (<strong>${ADMIN_CREDENTIALS.email}</strong>).
          </p>

          <div style="display:flex;gap:var(--space-4);justify-content:center;flex-wrap:wrap;">
            <a href="#admin-login" class="btn btn-primary" style="background:var(--color-stamp-red);border-color:var(--color-stamp-red);">
              🔑 Administrator Sign In
            </a>
            <a href="#home" class="btn btn-outline">
              Return to Public Portal
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================
   MAIN ADMIN DASHBOARD VIEW
   ============================================================ */
async function renderAdminDashboard() {
  if (!HV.isAdminLoggedIn || !HV.adminUser || HV.adminUser.email !== ADMIN_CREDENTIALS.email) {
    renderAccessDenied();
    return;
  }

  const main = document.getElementById('app-main');
  main.innerHTML = `
    <div class="admin-page" style="padding-block: var(--space-8);">
      <div class="container">

        <!-- Top Security & DB Ribbon -->
        <div style="background:var(--color-navy);color:var(--color-paper);padding:var(--space-3) var(--space-6);border-radius:var(--radius-sm);margin-bottom:var(--space-6);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--space-3);font-family:var(--font-mono);font-size:var(--text-xs);">
          <div style="display:flex;align-items:center;gap:var(--space-3);flex-wrap:wrap;">
            <span style="color:var(--color-gold);">🛡️ MASTER ADMIN: ${HV.adminUser.name}</span>
            <span style="color:rgba(241,236,224,0.4);">|</span>
            <span id="db-status-badge" style="background:rgba(27,67,50,0.6);border:1px solid #2d6a4f;padding:2px 8px;border-radius:12px;color:#95d5b2;">
              ⚡ SQLite Connected (hirevision.db)
            </span>
          </div>
          <div style="display:flex;align-items:center;gap:var(--space-4);">
            <span style="color:rgba(241,236,224,0.7);">GIET UNIVERSITY PLACEMENT DIRECTORATE</span>
            <button id="admin-quick-logout" style="background:transparent;border:none;color:var(--color-stamp-red);cursor:pointer;font-family:var(--font-mono);font-size:var(--text-xs);text-decoration:underline;">
              [Exit]
            </button>
          </div>
        </div>

        <!-- Header -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:var(--space-6);flex-wrap:wrap;gap:var(--space-4);">
          <div>
            <p class="eyebrow" style="color:var(--color-stamp-red);">Institutional Placement Console</p>
            <h2>Placement Directorate Management Studio</h2>
            <p style="color:var(--color-navy-mid);font-size:var(--text-sm);">Multi-Year Cohort Management, AI Assessments & Recruitment Eligibility Engine</p>
          </div>
          <div style="display:flex;gap:var(--space-3);flex-wrap:wrap;">
            <button class="btn btn-primary" id="btn-open-add-student">
              ➕ Add Student Record
            </button>
            <button class="btn btn-outline" id="btn-export-all-csv">
              📥 Export Ledger (.CSV)
            </button>
          </div>
        </div>

        <!-- Multi-Year Batch Selector Tabs -->
        <div class="admin-tabs-bar" role="tablist">
          <button class="admin-batch-tab ${currentBatchTab === '2026' ? 'active' : ''}" data-batch="2026">
            🎓 Current Drive (2026 Batch)
          </button>
          <button class="admin-batch-tab ${currentBatchTab === '2025' ? 'active' : ''}" data-batch="2025">
            📜 Past Season (2025 Batch)
          </button>
          <button class="admin-batch-tab ${currentBatchTab === '2024' ? 'active' : ''}" data-batch="2024">
            🏛️ Historical Archive (2024 Batch)
          </button>
          <button class="admin-batch-tab ${currentBatchTab === 'all' ? 'active' : ''}" data-batch="all">
            🌐 Master Ledger (All Cohorts)
          </button>
        </div>

        <!-- Sub-section Switcher Pills -->
        <div class="admin-section-nav">
          <button class="admin-sub-tab ${currentAdminSubSection === 'students' ? 'active' : ''}" data-section="students">
            👥 Student Records & Management (${currentBatchTab === 'all' ? 'All' : currentBatchTab})
          </button>
          <button class="admin-sub-tab ${currentAdminSubSection === 'analytics' ? 'active' : ''}" data-section="analytics">
            📊 Cohort Analytics & Trends
          </button>
          <button class="admin-sub-tab ${currentAdminSubSection === 'matcher' ? 'active' : ''}" data-section="matcher">
            🎯 Company Drive Eligibility Matcher
          </button>
          <button class="admin-sub-tab ${currentAdminSubSection === 'highrisk' ? 'active' : ''}" data-section="highrisk">
            ⚠️ Early Warning & Intervention List
          </button>
        </div>

        <!-- Dynamic Container for Active Sub-section -->
        <div id="admin-sub-content">
          <div style="text-align:center;padding:var(--space-10);"><span class="spinner"></span> Loading SQLite Records…</div>
        </div>

      </div>
    </div>

    <!-- Modal Container -->
    <div id="admin-modal-container"></div>
  `;

  // Bind global tab listeners
  main.querySelectorAll('.admin-batch-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      currentBatchTab = btn.dataset.batch;
      renderAdminDashboard();
    });
  });

  main.querySelectorAll('.admin-sub-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      currentAdminSubSection = btn.dataset.section;
      renderAdminDashboard();
    });
  });

  main.querySelector('#btn-open-add-student')?.addEventListener('click', () => openStudentModal(null));
  main.querySelector('#admin-quick-logout')?.addEventListener('click', () => {
    HV.isAdminLoggedIn = false;
    HV.adminUser = null;
    saveSession();
    renderNav();
    showToast('Administrator session closed securely.', 'info');
    Router.navigate('home');
  });

  main.querySelector('#btn-export-all-csv')?.addEventListener('click', async () => {
    const students = await SQLiteDB.getStudents({ batch_year: currentBatchTab });
    exportStudentsCSV(students);
  });

  // Render the selected sub-section
  await loadSubSectionContent();
}

async function loadSubSectionContent() {
  const container = document.getElementById('admin-sub-content');
  if (!container) return;

  if (currentAdminSubSection === 'students') {
    await renderStudentsSection(container);
  } else if (currentAdminSubSection === 'analytics') {
    await renderAnalyticsSection(container);
  } else if (currentAdminSubSection === 'matcher') {
    await renderMatcherSection(container);
  } else if (currentAdminSubSection === 'highrisk') {
    await renderHighRiskSection(container);
  }
}

/* ============================================================
   SUB-SECTION 1: STUDENT MANAGEMENT (CRUD & TABLE)
   ============================================================ */
async function renderStudentsSection(container) {
  const students = await SQLiteDB.getStudents({ batch_year: currentBatchTab });

  // Summary Metrics
  const total = students.length;
  const placed = students.filter(s => String(s.placed_status).includes('Placed') || String(s.placed_status).includes('Shortlisted')).length;
  const rate = total > 0 ? Math.round((placed / total) * 100) : 0;
  const avgCgpa = total > 0 ? (students.reduce((a, b) => a + Number(b.cgpa), 0) / total).toFixed(2) : '0';
  const highRisk = students.filter(s => (s.confidence_pct || 0) < 60).length;

  container.innerHTML = `
    <!-- Summary Cards -->
    <div class="admin-summary-grid" style="margin-bottom:var(--space-6);">
      <div class="admin-stat-card">
        <p class="stat-eyebrow">Cohort Size (${currentBatchTab})</p>
        <p class="stat-big">${total}</p>
        <p class="stat-desc">Active students in SQLite records</p>
      </div>
      <div class="admin-stat-card">
        <p class="stat-eyebrow">Placement Ratio</p>
        <p class="stat-big" style="color:var(--color-forest);">${rate}%</p>
        <p class="stat-desc">${placed} of ${total} students placed/shortlisted</p>
      </div>
      <div class="admin-stat-card">
        <p class="stat-eyebrow">Cohort Avg CGPA</p>
        <p class="stat-big">${avgCgpa}</p>
        <p class="stat-desc">Academic mean score</p>
      </div>
      <div class="admin-stat-card">
        <p class="stat-eyebrow">Support Required</p>
        <p class="stat-big" style="color:var(--color-stamp-red);">${highRisk}</p>
        <p class="stat-desc">Confidence below 60% threshold</p>
      </div>
    </div>

    <!-- Student Table Card -->
    <div class="admin-table-card">
      <div class="admin-table-header" style="flex-wrap:wrap;gap:var(--space-3);padding:var(--space-4) var(--space-6);">
        <div>
          <h4 style="color:var(--color-paper);margin:0;">Student Records Ledger (${currentBatchTab.toUpperCase()})</h4>
          <span class="sub">SQLite Database Table: students</span>
        </div>
        <div style="display:flex;gap:var(--space-3);align-items:center;flex-wrap:wrap;">
          <input type="text" id="admin-table-search" placeholder="Search name, roll no, company…"
                 style="padding:var(--space-2) var(--space-3);background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.25);color:#fff;border-radius:var(--radius-sm);font-family:var(--font-mono);font-size:var(--text-xs);width:220px;">
          <select id="admin-branch-filter" style="padding:var(--space-2) var(--space-3);background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.25);color:#fff;border-radius:var(--radius-sm);font-family:var(--font-mono);font-size:var(--text-xs);">
            <option value="all" style="color:#000;">All Branches</option>
            <option value="CSE" style="color:#000;">CSE</option>
            <option value="CSE-AIML" style="color:#000;">CSE-AIML</option>
            <option value="ECE" style="color:#000;">ECE</option>
            <option value="EEE" style="color:#000;">EEE</option>
            <option value="Mechanical" style="color:#000;">Mechanical</option>
            <option value="Civil" style="color:#000;">Civil</option>
          </select>
        </div>
      </div>

      <div class="table-wrap">
        <table aria-label="Student management table" id="admin-students-table">
          <thead>
            <tr>
              <th scope="col">Roll No</th>
              <th scope="col">Student Candidate</th>
              <th scope="col">Branch & Batch</th>
              <th scope="col">CGPA / Backlogs</th>
              <th scope="col">AI Confidence</th>
              <th scope="col">Placement Status / Offer</th>
              <th scope="col" style="text-align:right;">Admin Actions</th>
            </tr>
          </thead>
          <tbody id="admin-students-tbody">
            ${renderStudentsTableRows(students)}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Search & Filter listeners
  const searchInput = container.querySelector('#admin-table-search');
  const branchFilter = container.querySelector('#admin-branch-filter');

  function applyFilters() {
    const q = searchInput.value.toLowerCase();
    const branch = branchFilter.value;
    const filtered = students.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(q) ||
                          s.roll_no.toLowerCase().includes(q) ||
                          (s.company_placed && s.company_placed.toLowerCase().includes(q));
      const matchBranch = (branch === 'all') || (s.branch === branch);
      return matchSearch && matchBranch;
    });
    container.querySelector('#admin-students-tbody').innerHTML = renderStudentsTableRows(filtered);
    bindRowActionButtons(container, filtered);
  }

  searchInput.addEventListener('input', applyFilters);
  branchFilter.addEventListener('change', applyFilters);
  bindRowActionButtons(container, students);
}

function renderStudentsTableRows(students) {
  if (!students.length) {
    return `<tr><td colspan="7" style="text-align:center;padding:var(--space-8);color:var(--color-navy-mid);font-family:var(--font-mono);">No student records found matching filter.</td></tr>`;
  }

  return students.map(s => {
    const conf = s.confidence_pct || 70;
    const isPlaced = String(s.placed_status).includes('Placed') || String(s.placed_status).includes('Shortlisted');
    const isHighRisk = conf < 60;

    return `
      <tr data-student-id="${s.id}">
        <td style="font-family:var(--font-mono);font-size:var(--text-xs);font-weight:600;color:var(--color-navy);">${s.roll_no || 'N/A'}</td>
        <td>
          <div style="font-weight:600;color:var(--color-navy);">${s.name}</div>
          <div style="font-size:11px;color:var(--color-navy-mid);font-family:var(--font-mono);">${s.email}</div>
        </td>
        <td>
          <span class="pill pill-gold" style="font-size:10px;">${s.branch}</span>
          <span style="font-family:var(--font-mono);font-size:11px;color:var(--color-navy-mid);margin-left:4px;">'${String(s.batch_year).slice(-2)}</span>
        </td>
        <td>
          <span style="font-weight:700;">${s.cgpa}</span>
          ${s.active_backlogs > 0 ? `<span class="pill pill-red" style="font-size:9px;margin-left:4px;">${s.active_backlogs} BL</span>` : `<span style="font-size:10px;color:var(--color-forest);margin-left:4px;">✓ 0 BL</span>`}
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:var(--space-2);">
            <div class="progress-bar-wrap" style="width:70px;">
              <div class="progress-bar-fill ${isPlaced ? 'green' : (isHighRisk ? 'red' : 'gold')}" style="width:${conf}%;"></div>
            </div>
            <span style="font-family:var(--font-mono);font-size:var(--text-xs);font-weight:600;">${conf}%</span>
          </div>
        </td>
        <td>
          <span class="pill ${isPlaced ? 'pill-green' : (isHighRisk ? 'pill-red' : 'pill-gold')}">${s.placed_status || 'In-Progress'}</span>
          ${s.company_placed ? `<div style="font-size:10px;font-family:var(--font-mono);color:var(--color-navy);margin-top:2px;">🏢 ${s.company_placed} ${s.package_lpa ? `(${s.package_lpa} LPA)` : ''}</div>` : ''}
        </td>
        <td style="text-align:right;">
          <div style="display:flex;gap:4px;justify-content:flex-end;">
            <button class="action-btn btn-ai-predict" title="Run AI Prediction" data-id="${s.id}">⚡ AI Predict</button>
            <button class="action-btn btn-edit-student" title="Edit Student Data" data-id="${s.id}">✏️ Edit</button>
            <button class="action-btn btn-tag-offer" title="Tag Company Offer" data-id="${s.id}">🏷️ Offer</button>
            <button class="action-btn action-btn-danger btn-delete-student" title="Delete from SQLite" data-id="${s.id}">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function bindRowActionButtons(container, currentStudentList) {
  // Edit
  container.querySelectorAll('.btn-edit-student').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const student = currentStudentList.find(s => String(s.id) === String(id));
      if (student) openStudentModal(student);
    });
  });

  // AI Predict
  container.querySelectorAll('.btn-ai-predict').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      btn.disabled = true;
      btn.textContent = '⚡ Evaluating…';
      const res = await SQLiteDB.predictStudent(id);
      btn.disabled = false;
      btn.textContent = '⚡ AI Predict';
      if (res) {
        showToast(`AI Prediction updated: ${res.name} → ${res.confidence_pct}% (${res.tier})`, 'success');
        renderAdminDashboard();
      }
    });
  });

  // Offer
  container.querySelectorAll('.btn-tag-offer').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const student = currentStudentList.find(s => String(s.id) === String(id));
      if (student) openOfferModal(student);
    });
  });

  // Delete
  container.querySelectorAll('.btn-delete-student').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const student = currentStudentList.find(s => String(s.id) === String(id));
      if (confirm(`Are you sure you want to delete ${student?.name || 'this student'} from the SQLite database?`)) {
        await SQLiteDB.deleteStudent(id);
        showToast('Student record deleted from SQLite.', 'info');
        renderAdminDashboard();
      }
    });
  });
}

/* ============================================================
   SUB-SECTION 2: COHORT ANALYTICS & MULTI-YEAR CHARTS
   ============================================================ */
async function renderAnalyticsSection(container) {
  const data = await SQLiteDB.getCohortAnalytics();
  const cohorts = data.cohorts || {};

  container.innerHTML = `
    <!-- Charts Grid -->
    <div class="admin-charts-grid">
      <!-- Multi-Year Placement Comparison -->
      <div class="chart-card">
        <div class="chart-card-header">
          <h4>Multi-Year Placement Trends</h4>
          <span class="chart-eyebrow">Cohorts 2024–2026</span>
        </div>
        <div class="chart-card-body">
          <canvas id="chart-multiyear-bar"></canvas>
        </div>
      </div>

      <!-- CGPA Cohort Breakdown -->
      <div class="chart-card">
        <div class="chart-card-header">
          <h4>Branch Performance Roster</h4>
          <span class="chart-eyebrow">${currentBatchTab.toUpperCase()} Batch</span>
        </div>
        <div class="chart-card-body">
          <canvas id="chart-branch-radar"></canvas>
        </div>
      </div>
    </div>

    <!-- Multi-Year Breakdown Table -->
    <div class="admin-table-card" style="margin-top:var(--space-6);">
      <div class="admin-table-header">
        <h4>Year-over-Year Institutional Summary</h4>
        <span class="sub">Career Services Historical Archive</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Academic Batch</th>
              <th>Total Cohort</th>
              <th>Placed / Shortlisted</th>
              <th>Placement Rate (%)</th>
              <th>Batch Average CGPA</th>
              <th>Average CTC (LPA)</th>
            </tr>
          </thead>
          <tbody>
            ${Object.keys(cohorts).map(y => `
              <tr>
                <td style="font-weight:700;font-family:var(--font-mono);">${y} Batch</td>
                <td>${cohorts[y].total_students} Candidates</td>
                <td>${cohorts[y].placed_students} Placed</td>
                <td><span class="pill pill-green">${cohorts[y].placement_rate}%</span></td>
                <td style="font-weight:600;">${cohorts[y].avg_cgpa}</td>
                <td style="font-family:var(--font-mono);font-weight:600;color:var(--color-navy);">${cohorts[y].avg_package_lpa || '7.5'} LPA</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  requestAnimationFrame(() => initMultiYearCharts(cohorts));
}

function initMultiYearCharts(cohorts) {
  const barCanvas = document.getElementById('chart-multiyear-bar');
  if (barCanvas && !barCanvas._chartInstance) {
    const labels = Object.keys(cohorts).sort();
    const rates  = labels.map(l => cohorts[l]?.placement_rate || 0);
    const totals = labels.map(l => cohorts[l]?.total_students || 0);

    barCanvas._chartInstance = new Chart(barCanvas, {
      type: 'bar',
      data: {
        labels: labels.map(l => `${l} Batch`),
        datasets: [
          {
            label: 'Placement Rate (%)',
            data: rates.length ? rates : [72, 85, 71],
            backgroundColor: 'rgba(28,43,69,0.85)',
            borderRadius: 4
          },
          {
            label: 'Total Registered (x10)',
            data: totals.length ? totals.map(t => t * 10) : [60, 50, 60],
            backgroundColor: 'rgba(169,120,47,0.75)',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, max: 100 }
        }
      }
    });
  }

  const branchCanvas = document.getElementById('chart-branch-radar');
  if (branchCanvas && !branchCanvas._chartInstance) {
    branchCanvas._chartInstance = new Chart(branchCanvas, {
      type: 'bar',
      data: {
        labels: ['CSE', 'CSE-AIML', 'ECE', 'EEE', 'Mechanical', 'Civil'],
        datasets: [{
          label: 'Avg Confidence Score (%)',
          data: [88, 92, 74, 65, 58, 52],
          backgroundColor: ['#1C2B45', '#A9782F', '#48597A', '#CDC3A9', '#8C2F39', '#556581'],
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true, max: 100 } }
      }
    });
  }
}

/* ============================================================
   SUB-SECTION 3: INTELLIGENT COMPANY DRIVE MATCHER
   ============================================================ */
async function renderMatcherSection(container) {
  container.innerHTML = `
    <div style="background:var(--color-card);border:1.5px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-8);margin-bottom:var(--space-6);">
      <div style="margin-bottom:var(--space-6);">
        <p class="eyebrow" style="color:var(--color-gold);">Recruitment Eligibility Engine</p>
        <h3>Match Students to Company Drive Criteria</h3>
        <p style="color:var(--color-navy-mid);font-size:var(--text-sm);">Instantly filter the active SQLite cohort against corporate recruitment eligibility thresholds.</p>
      </div>

      <form id="matcher-form" class="modal-grid-3" style="gap:var(--space-4);margin-bottom:var(--space-6);">
        <div class="form-group">
          <label class="form-label">Target Company</label>
          <input class="form-input" id="match-company" type="text" value="Amazon Web Services" required>
        </div>
        <div class="form-group">
          <label class="form-label">Minimum CGPA</label>
          <input class="form-input" id="match-cgpa" type="number" step="0.1" value="7.5" min="0" max="10" required>
        </div>
        <div class="form-group">
          <label class="form-label">Max Allowed Backlogs</label>
          <input class="form-input" id="match-backlogs" type="number" value="0" min="0" max="10" required>
        </div>
        <div class="form-group">
          <label class="form-label">Min Coding Proficiency (1–10)</label>
          <input class="form-input" id="match-prog" type="number" value="7" min="1" max="10" required>
        </div>
        <div class="form-group">
          <label class="form-label">Target Batch Year</label>
          <select class="form-select" id="match-batch">
            <option value="2026" selected>2026 Batch (Current)</option>
            <option value="2025">2025 Batch</option>
            <option value="2024">2024 Batch</option>
          </select>
        </div>
        <div class="form-group" style="display:flex;align-items:flex-end;">
          <button type="submit" class="btn btn-primary" style="width:100%;" id="btn-run-match">
            🎯 Run Eligibility Matching
          </button>
        </div>
      </form>

      <div id="matcher-results">
        <div style="text-align:center;padding:var(--space-6);color:var(--color-navy-mid);font-family:var(--font-mono);font-size:var(--text-xs);">
          Click "Run Eligibility Matching" to compute candidate shortlist.
        </div>
      </div>
    </div>
  `;

  const form = container.querySelector('#matcher-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = container.querySelector('#btn-run-match');
    btn.disabled = true;
    btn.textContent = 'Computing…';

    const criteria = {
      company_name: container.querySelector('#match-company').value,
      min_cgpa: parseFloat(container.querySelector('#match-cgpa').value),
      max_backlogs: parseInt(container.querySelector('#match-backlogs').value, 10),
      min_programming: parseInt(container.querySelector('#match-prog').value, 10),
      eligible_branches: ['CSE', 'CSE-AIML', 'ECE', 'EEE', 'Mechanical', 'Civil'],
      batch_year: container.querySelector('#match-batch').value
    };

    const res = await SQLiteDB.matchDrives(criteria);
    btn.disabled = false;
    btn.textContent = '🎯 Run Eligibility Matching';

    renderMatcherResults(container.querySelector('#matcher-results'), res);
  });
}

function renderMatcherResults(resultsContainer, data) {
  const list = data.eligible_students || [];
  resultsContainer.innerHTML = `
    <div style="border-top:1.5px solid var(--color-border);padding-top:var(--space-6);animation:fadeIn 0.3s ease;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-4);flex-wrap:wrap;gap:var(--space-3);">
        <div>
          <h4 style="margin:0;">Eligible Candidates for ${data.company_name}</h4>
          <span style="font-family:var(--font-mono);font-size:var(--text-xs);color:var(--color-forest);">
            ✓ ${data.eligible_count} of ${data.total_cohort} students qualified (${data.eligibility_percentage}% eligibility rate)
          </span>
        </div>
        <button class="btn btn-outline" id="btn-export-shortlist" style="font-size:var(--text-xs);">
          📥 Export Shortlist CSV
        </button>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Student</th>
              <th>Branch</th>
              <th>CGPA</th>
              <th>Programming</th>
              <th>Placement Confidence</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(s => `
              <tr>
                <td style="font-family:var(--font-mono);font-size:var(--text-xs);">${s.roll_no}</td>
                <td style="font-weight:600;">${s.name}</td>
                <td><span class="pill pill-gold" style="font-size:10px;">${s.branch}</span></td>
                <td style="font-weight:700;">${s.cgpa}</td>
                <td style="font-family:var(--font-mono);">${s.programming_score}/10</td>
                <td><span class="pill pill-green">${s.confidence_pct || 80}%</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  resultsContainer.querySelector('#btn-export-shortlist')?.addEventListener('click', () => {
    exportStudentsCSV(list, `GIET_${data.company_name}_Shortlist.csv`);
  });
}

/* ============================================================
   SUB-SECTION 4: HIGH-RISK EARLY WARNING SYSTEM
   ============================================================ */
async function renderHighRiskSection(container) {
  const all = await SQLiteDB.getStudents({ batch_year: currentBatchTab });
  const atRisk = all.filter(s => (s.confidence_pct || 0) < 65 || s.active_backlogs > 0);

  container.innerHTML = `
    <div class="admin-table-card">
      <div class="admin-table-header" style="background:var(--color-stamp-red);">
        <div>
          <h4 style="color:#fff;margin:0;">Placement Early Warning & Remedial Advisory</h4>
          <span class="sub" style="color:rgba(255,255,255,0.8);">${atRisk.length} candidates requiring immediate placement cell intervention</span>
        </div>
        <button class="btn btn-ghost" id="btn-export-remedial" style="color:#fff;border-color:rgba(255,255,255,0.4);font-size:var(--text-xs);">
          📥 Export Remedial Docket
        </button>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Branch</th>
              <th>CGPA / Backlogs</th>
              <th>Deficit Dimensions</th>
              <th>Prescribed Remedial Action</th>
              <th style="text-align:right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${atRisk.map(s => {
              const deficits = [];
              if (s.active_backlogs > 0) deficits.push(`${s.active_backlogs} Active Backlogs`);
              if (s.programming_score < 7) deficits.push(`Low DSA Score (${s.programming_score}/10)`);
              if (s.aptitude_score < 7) deficits.push(`Low Aptitude (${s.aptitude_score}/10)`);
              if (s.internships === 0) deficits.push(`No Internship`);

              return `
                <tr>
                  <td>
                    <div style="font-weight:600;">${s.name}</div>
                    <div style="font-family:var(--font-mono);font-size:11px;color:var(--color-navy-mid);">${s.roll_no} · ${s.email}</div>
                  </td>
                  <td><span class="pill pill-gold" style="font-size:10px;">${s.branch}</span></td>
                  <td>
                    <span style="font-weight:700;">${s.cgpa}</span>
                    <span class="pill pill-red" style="font-size:9px;margin-left:4px;">${s.active_backlogs} BL</span>
                  </td>
                  <td>
                    <div style="display:flex;flex-wrap:wrap;gap:4px;">
                      ${deficits.map(d => `<span class="pill pill-red" style="font-size:10px;">${d}</span>`).join('')}
                    </div>
                  </td>
                  <td style="font-size:var(--text-xs);color:var(--color-navy);">
                    Enroll in Department Special Doubt Clearning & Daily Aptitude Mock Drill.
                  </td>
                  <td style="text-align:right;">
                    <button class="action-btn btn-edit-student" data-id="${s.id}">✏️ Update Plan</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  container.querySelectorAll('.btn-edit-student').forEach(btn => {
    btn.addEventListener('click', () => {
      const student = atRisk.find(s => String(s.id) === String(btn.dataset.id));
      if (student) openStudentModal(student);
    });
  });

  container.querySelector('#btn-export-remedial')?.addEventListener('click', () => {
    exportStudentsCSV(atRisk, 'GIET_Placement_Early_Warning_Interventions.csv');
  });
}

/* ============================================================
   STUDENT ADD / EDIT MODAL
   ============================================================ */
function openStudentModal(student = null) {
  const modalContainer = document.getElementById('admin-modal-container');
  const isEdit = !!student;

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-content">
        <div class="modal-header">
          <h3>${isEdit ? `✏️ Edit Student Record (#${student.roll_no})` : '➕ Add New Student to SQLite Database'}</h3>
          <button class="modal-close" id="modal-close-btn">&times;</button>
        </div>

        <form id="student-modal-form">
          <div class="modal-grid-2">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input class="form-input" id="m-name" type="text" value="${student?.name || ''}" required placeholder="e.g. Ramesh Kumar">
            </div>
            <div class="form-group">
              <label class="form-label">Roll Number</label>
              <input class="form-input" id="m-roll" type="text" value="${student?.roll_no || ''}" required placeholder="e.g. 22CSE199">
            </div>
          </div>

          <div class="modal-grid-3">
            <div class="form-group">
              <label class="form-label">College Email</label>
              <input class="form-input" id="m-email" type="email" value="${student?.email || ''}" required placeholder="student@giet.edu">
            </div>
            <div class="form-group">
              <label class="form-label">Branch</label>
              <select class="form-select" id="m-branch">
                ${['CSE', 'CSE-AIML', 'ECE', 'EEE', 'Mechanical', 'Civil'].map(b => `
                  <option value="${b}" ${student?.branch === b ? 'selected' : ''}>${b}</option>
                `).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Batch Year</label>
              <select class="form-select" id="m-batch">
                ${['2026', '2025', '2024'].map(y => `
                  <option value="${y}" ${student?.batch_year === y ? 'selected' : ''}>${y} Batch</option>
                `).join('')}
              </select>
            </div>
          </div>

          <div class="modal-grid-3">
            <div class="form-group">
              <label class="form-label">Current CGPA</label>
              <input class="form-input" id="m-cgpa" type="number" step="0.01" min="0" max="10" value="${student?.cgpa || 8.0}" required>
            </div>
            <div class="form-group">
              <label class="form-label">10th Score (%)</label>
              <input class="form-input" id="m-tenth" type="number" step="0.1" min="0" max="100" value="${student?.tenth_pct || 85.0}" required>
            </div>
            <div class="form-group">
              <label class="form-label">12th Score (%)</label>
              <input class="form-input" id="m-twelfth" type="number" step="0.1" min="0" max="100" value="${student?.twelfth_pct || 82.0}" required>
            </div>
          </div>

          <div class="modal-grid-3">
            <div class="form-group">
              <label class="form-label">Active Backlogs</label>
              <input class="form-input" id="m-backlogs" type="number" min="0" max="20" value="${student?.active_backlogs ?? 0}" required>
            </div>
            <div class="form-group">
              <label class="form-label">DSA / Coding (1–10)</label>
              <input class="form-input" id="m-prog" type="number" min="1" max="10" value="${student?.programming_score || 7}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Aptitude (1–10)</label>
              <input class="form-input" id="m-apt" type="number" min="1" max="10" value="${student?.aptitude_score || 7}" required>
            </div>
          </div>

          <div class="modal-grid-3">
            <div class="form-group">
              <label class="form-label">Internships Done</label>
              <input class="form-input" id="m-intern" type="number" min="0" max="10" value="${student?.internships ?? 1}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Projects Built</label>
              <input class="form-input" id="m-proj" type="number" min="0" max="20" value="${student?.projects ?? 2}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Hackathons Won</label>
              <input class="form-input" id="m-hack" type="number" min="0" max="10" value="${student?.hackathons ?? 0}" required>
            </div>
          </div>

          <div class="modal-grid-2">
            <div class="form-group">
              <label class="form-label">Placement Status</label>
              <select class="form-select" id="m-status">
                ${['In-Progress', 'Shortlisted', 'Placed', 'Needs Training', 'Not Placed'].map(st => `
                  <option value="${st}" ${student?.placed_status?.includes(st) ? 'selected' : ''}>${st}</option>
                `).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Placed Company (if any)</label>
              <input class="form-input" id="m-company" type="text" value="${student?.company_placed || ''}" placeholder="e.g. Amazon Web Services">
            </div>
          </div>

          <div style="display:flex;gap:var(--space-3);justify-content:flex-end;margin-top:var(--space-6);border-top:1.5px solid var(--color-border);padding-top:var(--space-4);">
            <button type="button" class="btn btn-outline" id="modal-cancel-btn">Cancel</button>
            <button type="submit" class="btn btn-primary" id="modal-save-btn">
              💾 ${isEdit ? 'Save Changes' : 'Create Record in SQLite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Close handlers
  const close = () => { modalContainer.innerHTML = ''; };
  modalContainer.querySelector('#modal-close-btn').addEventListener('click', close);
  modalContainer.querySelector('#modal-cancel-btn').addEventListener('click', close);

  // Submit handler
  const form = modalContainer.querySelector('#student-modal-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const saveBtn = modalContainer.querySelector('#modal-save-btn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving…';

    const payload = {
      name: modalContainer.querySelector('#m-name').value.trim(),
      roll_no: modalContainer.querySelector('#m-roll').value.trim(),
      email: modalContainer.querySelector('#m-email').value.trim(),
      branch: modalContainer.querySelector('#m-branch').value,
      batch_year: modalContainer.querySelector('#m-batch').value,
      cgpa: parseFloat(modalContainer.querySelector('#m-cgpa').value),
      tenth_pct: parseFloat(modalContainer.querySelector('#m-tenth').value),
      twelfth_pct: parseFloat(modalContainer.querySelector('#m-twelfth').value),
      active_backlogs: parseInt(modalContainer.querySelector('#m-backlogs').value, 10),
      programming_score: parseInt(modalContainer.querySelector('#m-prog').value, 10),
      aptitude_score: parseInt(modalContainer.querySelector('#m-apt').value, 10),
      internships: parseInt(modalContainer.querySelector('#m-intern').value, 10),
      projects: parseInt(modalContainer.querySelector('#m-proj').value, 10),
      hackathons: parseInt(modalContainer.querySelector('#m-hack').value, 10),
      placed_status: modalContainer.querySelector('#m-status').value,
      company_placed: modalContainer.querySelector('#m-company').value.trim()
    };

    if (isEdit) {
      await SQLiteDB.updateStudent(student.id, payload);
      showToast(`Student #${payload.roll_no} updated in SQLite!`, 'success');
    } else {
      await SQLiteDB.addStudent(payload);
      showToast(`Student #${payload.roll_no} created in SQLite database!`, 'success');
    }

    close();
    renderAdminDashboard();
  });
}

/* ============================================================
   OFFER TAGGING MODAL
   ============================================================ */
function openOfferModal(student) {
  const modalContainer = document.getElementById('admin-modal-container');
  modalContainer.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-content" style="max-width:480px;">
        <div class="modal-header">
          <h3>🏷️ Tag Placement Offer (${student.name})</h3>
          <button class="modal-close" id="modal-close-btn">&times;</button>
        </div>
        <form id="offer-modal-form">
          <div class="form-group">
            <label class="form-label">Placed Company</label>
            <input class="form-input" id="offer-company" type="text" value="${student.company_placed || ''}" required placeholder="e.g. Microsoft IDC">
          </div>
          <div class="form-group">
            <label class="form-label">Offered Package (CTC in LPA)</label>
            <input class="form-input" id="offer-lpa" type="number" step="0.1" value="${student.package_lpa || 12.0}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Status Tag</label>
            <select class="form-select" id="offer-status">
              <option value="Placed (${student.company_placed || 'Direct'})" selected>Placed</option>
              <option value="Shortlisted (${student.company_placed || 'Direct'})">Shortlisted / Final Round</option>
            </select>
          </div>
          <div style="display:flex;gap:var(--space-3);justify-content:flex-end;margin-top:var(--space-6);">
            <button type="button" class="btn btn-outline" id="modal-cancel-btn">Cancel</button>
            <button type="submit" class="btn btn-primary">💾 Confirm Placement Offer</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const close = () => { modalContainer.innerHTML = ''; };
  modalContainer.querySelector('#modal-close-btn').addEventListener('click', close);
  modalContainer.querySelector('#modal-cancel-btn').addEventListener('click', close);

  modalContainer.querySelector('#offer-modal-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const company = modalContainer.querySelector('#offer-company').value.trim();
    const lpa = parseFloat(modalContainer.querySelector('#offer-lpa').value);
    const statusTag = `Placed (${company})`;

    await SQLiteDB.updateStudent(student.id, {
      company_placed: company,
      package_lpa: lpa,
      placed_status: statusTag,
      confidence_pct: 95.0
    });

    showToast(`Placement offer saved for ${student.name} (${company} · ${lpa} LPA)`, 'success');
    close();
    renderAdminDashboard();
  });
}

/* ============================================================
   CSV EXPORT UTILITY
   ============================================================ */
function exportStudentsCSV(students, filename = `GIET_Placement_Cohort_${currentBatchTab}.csv`) {
  const headers = ['ID', 'Roll No', 'Name', 'Email', 'Branch', 'Batch Year', 'CGPA', 'Backlogs', 'DSA Score', 'Aptitude Score', 'Confidence (%)', 'Status', 'Company', 'Package (LPA)'];
  const rows = students.map(s => [
    s.id,
    `"${s.roll_no || ''}"`,
    `"${s.name}"`,
    `"${s.email}"`,
    s.branch,
    s.batch_year,
    s.cgpa,
    s.active_backlogs ?? 0,
    s.programming_score ?? 7,
    s.aptitude_score ?? 7,
    s.confidence_pct ?? 75,
    `"${s.placed_status || 'In-Progress'}"`,
    `"${s.company_placed || ''}"`,
    s.package_lpa ?? 0
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  showToast(`Exported ${students.length} student records as CSV.`, 'success');
}
