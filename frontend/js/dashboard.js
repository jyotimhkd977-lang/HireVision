/**
 * HireVision AI — Student Dashboard View
 */

function renderDashboardPage() {
  if (!HV.currentUser) { Router.navigate('auth'); return; }

  const u = HV.currentUser;
  const lastResult = HV.lastResult;
  const initials = u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);

  // Compute skill score from last result if available
  const confidence = lastResult ? Math.round(lastResult.probability_placed * 100) : null;
  const placed     = lastResult ? lastResult.placed : null;

  // Compute overall skill score from last form submission
  let skillScore = null;
  let weakAreas  = [];
  let tips       = [];

  if (lastResult && lastResult.formData) {
    const fd = lastResult.formData;
    skillScore = Math.round((
      fd.Programming_Score + fd.Aptitude_Score + fd.Communication_Score +
      fd.Problem_Solving + fd.English_Fluency + fd.Technical_Interview_Score + fd.Mock_Interview_Score
    ) / 7 * 10);

    const checks = [
      { key:'Programming',   val: fd.Programming_Score,   threshold: 6 },
      { key:'Aptitude',      val: fd.Aptitude_Score,      threshold: 6 },
      { key:'Communication', val: fd.Communication_Score,  threshold: 6 },
      { key:'Backlogs',      val: fd.Active_Backlogs === 0 ? 10 : 0, threshold: 5, inv: true },
      { key:'Attendance',    val: fd.Attendance_Percentage, threshold: 75 },
    ];
    weakAreas = checks.filter(c => c.inv ? c.val < c.threshold : c.val < c.threshold).map(c => c.key);
    tips = generateRemarks(fd, placed);
  }

  const recentPredictions = HV.history.slice(0, 3);

  const main = document.getElementById('app-main');
  main.innerHTML = `
    <div class="dashboard-page">
      <div class="container">
        <div class="dashboard-header">
          <div class="dashboard-title-area">
            <p class="eyebrow">Your Record</p>
            <h2>Student Dashboard</h2>
            <p>Your placement readiness profile and evaluation history.</p>
          </div>
          <button class="btn btn-primary" data-view="predict">
            New Prediction →
          </button>
        </div>

        <div class="dashboard-grid">
          <!-- Identity Card -->
          <div class="id-card reveal">
            <div class="id-card-header">
              <div class="id-avatar" aria-label="Student initials">${initials}</div>
              <p class="name">${u.name}</p>
              <p class="role">Student · ${u.branch || 'Not Set'}</p>
            </div>
            <div class="id-card-body">
              <div class="id-row">
                <span class="id-key">Email</span>
                <span class="id-val" style="font-size:11px">${u.email}</span>
              </div>
              <div class="id-row">
                <span class="id-key">Branch</span>
                <span class="id-val">${u.branch || '—'}</span>
              </div>
              <div class="id-row">
                <span class="id-key">CGPA</span>
                <span class="id-val">${u.cgpa || '—'}</span>
              </div>
              <div class="id-row">
                <span class="id-key">10th %</span>
                <span class="id-val">${u.tenth || '—'}</span>
              </div>
              <div class="id-row">
                <span class="id-key">12th %</span>
                <span class="id-val">${u.twelfth || '—'}</span>
              </div>
              <div class="id-row">
                <span class="id-key">Backlogs</span>
                <span class="id-val">${u.backlogs !== undefined ? u.backlogs : '—'}</span>
              </div>
              <div class="id-row">
                <span class="id-key">Internships</span>
                <span class="id-val">${u.internships !== undefined ? u.internships : '—'}</span>
              </div>
              <div class="id-row">
                <span class="id-key">Projects</span>
                <span class="id-val">${u.projects !== undefined ? u.projects : '—'}</span>
              </div>
              <div class="id-row">
                <span class="id-key">Attendance</span>
                <span class="id-val">${u.attendance ? u.attendance + '%' : '—'}</span>
              </div>
              <div style="margin-top:var(--space-5);">
                <button class="btn btn-primary" style="width:100%;" data-view="predict">
                  Run Prediction →
                </button>
              </div>
            </div>
            <div class="id-card-footer">
              <span>ID: ${u.email.split('@')[0].toUpperCase()}</span>
              <span>GIET · ${new Date().getFullYear()}</span>
            </div>
          </div>

          <!-- Widgets -->
          <div class="widgets-area">
            <!-- Row 1: 4 stat widgets -->
            <div class="widget-row widget-row-4">
              <div class="widget reveal">
                <p class="widget-label">Predicted Outcome</p>
                ${lastResult
                  ? `<div class="widget-value">
                       <span class="pill ${placed ? 'pill-green' : 'pill-red'}" style="font-size:var(--text-sm);">
                         ${placed ? 'Placed ✓' : 'Not Placed ✗'}
                       </span>
                     </div>`
                  : `<p class="widget-value" style="font-size:var(--text-base);color:var(--color-navy-mid);">—</p>
                     <p class="widget-sub">Run a prediction to see result</p>`
                }
              </div>
              <div class="widget reveal" style="transition-delay:0.05s;">
                <p class="widget-label">Model Confidence</p>
                <p class="widget-value" style="color:${lastResult ? (placed ? 'var(--color-stamp-green)':'var(--color-stamp-red)') : 'var(--color-navy-mid)'}">
                  ${confidence !== null ? confidence + '%' : '—'}
                </p>
                <p class="widget-sub">${lastResult ? (placed ? 'High placement likelihood' : 'Low placement likelihood') : 'No evaluation yet'}</p>
              </div>
              <div class="widget reveal" style="transition-delay:0.1s;">
                <p class="widget-label">Overall Skill Score</p>
                <p class="widget-value" style="color:var(--color-gold)">${skillScore !== null ? skillScore + '/100' : '—'}</p>
                <p class="widget-sub">Based on last evaluation</p>
              </div>
              <div class="widget reveal" style="transition-delay:0.15s;">
                <p class="widget-label">Weak Areas Flagged</p>
                <p class="widget-value" style="color:var(--color-stamp-red)">${weakAreas.length || (lastResult ? '0' : '—')}</p>
                <p class="widget-sub">${weakAreas.length ? weakAreas.slice(0,2).join(', ') : (lastResult ? 'No critical weaknesses' : 'Submit a form first')}</p>
              </div>
            </div>

            <!-- Row 2: improvement tips + breakdown -->
            <div class="widget-row widget-row-2">
              <div class="widget reveal">
                <p class="widget-label" style="margin-bottom:var(--space-4);">💡 Improvement Tips</p>
                ${tips.length ? `
                  <div class="tips-list">
                    ${tips.map((t, i) => `
                      <div class="tip-item">
                        <div class="tip-num">${i+1}</div>
                        <p class="tip-text">${t}</p>
                      </div>
                    `).join('')}
                  </div>
                ` : `
                  <div class="empty-state" style="padding:var(--space-8) var(--space-4);">
                    <div class="empty-state-icon">📋</div>
                    <h4>No suggestions yet</h4>
                    <p>Submit the evaluation form to get personalized tips.</p>
                  </div>
                `}
              </div>
              <div class="widget reveal" style="transition-delay:0.1s;">
                <p class="widget-label" style="margin-bottom:var(--space-4);">📈 Recent Predictions</p>
                ${recentPredictions.length ? `
                  <div style="display:flex;flex-direction:column;gap:var(--space-3);">
                    ${recentPredictions.map(r => `
                      <div style="display:flex;justify-content:space-between;align-items:center;padding:var(--space-2) 0;border-bottom:1px dashed var(--color-border-soft);">
                        <div>
                          <p style="font-family:var(--font-mono);font-size:10px;color:var(--color-navy-mid);margin-bottom:2px;">${new Date(r.date).toLocaleDateString()}</p>
                          <p style="font-size:var(--text-sm);font-weight:600;color:var(--color-navy);margin-bottom:0;">CGPA ${r.cgpa}</p>
                        </div>
                        <div style="text-align:right;">
                          <span class="pill ${r.placed ? 'pill-green' : 'pill-red'}">${r.placed ? 'Placed' : 'Not Placed'}</span>
                          <p style="font-family:var(--font-mono);font-size:10px;color:var(--color-navy-mid);margin-top:2px;">${r.confidence}% conf.</p>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                  <button class="btn btn-outline" style="width:100%;margin-top:var(--space-4);" data-view="history">View All →</button>
                ` : `
                  <div class="empty-state" style="padding:var(--space-8) var(--space-4);">
                    <div class="empty-state-icon">📊</div>
                    <h4>No predictions yet</h4>
                    <p>Your evaluation history will appear here.</p>
                    <button class="btn btn-primary" style="margin-top:var(--space-4);" data-view="predict">Start Now →</button>
                  </div>
                `}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  main.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => Router.navigate(btn.dataset.view));
  });
}
