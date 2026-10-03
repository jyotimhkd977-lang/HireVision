/**
 * HireVision AI — Prediction Form View
 * Comprehensive evaluation form with API integration
 */

function renderPredictPage() {
  if (!HV.currentUser) {
    showToast('Please log in to access the prediction form.', 'info');
    Router.navigate('auth');
    return;
  }

  const u = HV.currentUser;
  const formId = 'HV-' + Date.now().toString(36).toUpperCase();

  const main = document.getElementById('app-main');
  main.innerHTML = `
    <div class="predict-page">
      <div class="container">
        <div class="predict-page-header">
          <p class="eyebrow">Evaluation Centre</p>
          <h2>Placement Evaluation Form</h2>
          <p style="color:var(--color-navy-mid);font-size:var(--text-sm);">
            Complete all sections accurately. The model reads your file the way a placement officer would.
          </p>
        </div>

        <div class="form-card" aria-label="Placement Evaluation Form">
          <!-- Card Header -->
          <div class="form-card-header">
            <h3>Placement Evaluation Form</h3>
            <span class="form-id">Form ID: ${formId}</span>
          </div>

          <form id="predict-form" novalidate>

            <!-- Global Error -->
            <div class="form-error-global" id="form-error-global" role="alert"></div>

            <!-- PART I: Academics -->
            <div class="form-section">
              <p class="form-section-title">Part I — Academics &amp; Profile</p>
              <div class="form-grid-3">
                <div class="form-group">
                  <label class="form-label" for="f-name">Full Name</label>
                  <input class="form-input" type="text" id="f-name"
                         value="${u.name}" readonly
                         aria-describedby="f-name-help">
                  <span class="form-error" id="f-name-err"></span>
                </div>
                <div class="form-group">
                  <label class="form-label" for="f-age">Age</label>
                  <input class="form-input" type="number" id="f-age"
                         placeholder="21" min="17" max="30" required>
                  <span class="form-error" id="f-age-err"></span>
                </div>
                <div class="form-group">
                  <label class="form-label" for="f-gender">Gender</label>
                  <select class="form-select" id="f-gender" required>
                    <option value="">— Select —</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <span class="form-error" id="f-gender-err"></span>
                </div>
                <div class="form-group">
                  <label class="form-label" for="f-degree">Degree</label>
                  <select class="form-select" id="f-degree" required>
                    <option value="">— Select —</option>
                    <option value="B.Tech" selected>B.Tech</option>
                    <option value="B.Sc">B.Sc</option>
                    <option value="BCA">BCA</option>
                    <option value="MCA">MCA</option>
                    <option value="M.Tech">M.Tech</option>
                  </select>
                  <span class="form-error" id="f-degree-err"></span>
                </div>
                <div class="form-group">
                  <label class="form-label" for="f-branch">Branch</label>
                  <select class="form-select" id="f-branch" required>
                    <option value="">— Select —</option>
                    <option value="CSE" ${u.branch==='CSE'?'selected':''}>CSE</option>
                    <option value="CSE-AIML" ${u.branch==='CSE-AIML'?'selected':''}>CSE-AIML</option>
                    <option value="ECE" ${u.branch==='ECE'?'selected':''}>ECE</option>
                    <option value="EEE" ${u.branch==='EEE'?'selected':''}>EEE</option>
                    <option value="Mechanical" ${u.branch==='Mechanical'?'selected':''}>Mechanical</option>
                    <option value="Civil" ${u.branch==='Civil'?'selected':''}>Civil</option>
                  </select>
                  <span class="form-error" id="f-branch-err"></span>
                </div>
                <div class="form-group">
                  <label class="form-label" for="f-cgpa">CGPA (out of 10)</label>
                  <input class="form-input" type="number" id="f-cgpa"
                         placeholder="8.2" min="0" max="10" step="0.01" required
                         value="${u.cgpa || ''}">
                  <span class="form-error" id="f-cgpa-err"></span>
                </div>
                <div class="form-group">
                  <label class="form-label" for="f-tenth">10th Percentage</label>
                  <input class="form-input" type="number" id="f-tenth"
                         placeholder="85" min="0" max="100" step="0.1" required
                         value="${u.tenth || ''}">
                  <span class="form-error" id="f-tenth-err"></span>
                </div>
                <div class="form-group">
                  <label class="form-label" for="f-twelfth">12th Percentage</label>
                  <input class="form-input" type="number" id="f-twelfth"
                         placeholder="82" min="0" max="100" step="0.1" required
                         value="${u.twelfth || ''}">
                  <span class="form-error" id="f-twelfth-err"></span>
                </div>
                <div class="form-group">
                  <label class="form-label" for="f-backlogs">Active Backlogs</label>
                  <input class="form-input" type="number" id="f-backlogs"
                         placeholder="0" min="0" max="20" required
                         value="${u.backlogs || 0}">
                  <span class="form-error" id="f-backlogs-err"></span>
                </div>
                <div class="form-group">
                  <label class="form-label" for="f-attendance">Attendance Percentage</label>
                  <input class="form-input" type="number" id="f-attendance"
                         placeholder="90" min="0" max="100" step="0.1" required
                         value="${u.attendance || ''}">
                  <span class="form-error" id="f-attendance-err"></span>
                </div>
              </div>
            </div>

            <!-- PART II: Skills & Aptitude -->
            <div class="form-section">
              <p class="form-section-title">Part II — Skills &amp; Aptitude</p>
              <p style="font-family:var(--font-mono);font-size:10px;color:var(--color-navy-mid);margin-bottom:var(--space-6);letter-spacing:0.08em;text-transform:uppercase;">
                Rate each skill on a scale of 1 (low) to 10 (expert)
              </p>

              ${[
                { id:'f-prog',    label:'Programming Skill',        help:'DSA, coding problem-solving ability' },
                { id:'f-apt',     label:'Aptitude Score',           help:'Quantitative, logical reasoning' },
                { id:'f-comm',    label:'Communication Score',      help:'Verbal and written communication' },
                { id:'f-tech',    label:'Technical Interview Score', help:'Domain-specific technical knowledge' },
                { id:'f-mock',    label:'Mock Interview Score',     help:'Practice interview performance' },
                { id:'f-prob',    label:'Problem Solving',          help:'Analytical and critical thinking' },
                { id:'f-english', label:'English Fluency',          help:'Spoken and written English proficiency' },
              ].map(s => `
                <div class="slider-group">
                  <div class="slider-header">
                    <label class="form-label" for="${s.id}">${s.label}</label>
                    <span style="font-family:var(--font-mono);font-size:10px;color:var(--color-navy-mid);">${s.help}</span>
                  </div>
                  <div class="range-wrap">
                    <span style="font-family:var(--font-mono);font-size:10px;color:var(--color-navy-mid);">1</span>
                    <input class="form-range" type="range" id="${s.id}"
                           min="1" max="10" value="5" step="1"
                           aria-valuemin="1" aria-valuemax="10" aria-valuenow="5">
                    <span class="range-value">5</span>
                    <span style="font-family:var(--font-mono);font-size:10px;color:var(--color-navy-mid);">10</span>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- PART III: Experience -->
            <div class="form-section">
              <p class="form-section-title">Part III — Experience &amp; Achievements</p>
              <div class="form-grid-2">
                <div class="form-group">
                  <label class="form-label" for="f-projects">Projects Completed</label>
                  <input class="form-input" type="number" id="f-projects"
                         placeholder="3" min="0" max="50" required
                         value="${u.projects || ''}">
                  <span class="form-error" id="f-projects-err"></span>
                </div>
                <div class="form-group">
                  <label class="form-label" for="f-internships">Internships</label>
                  <input class="form-input" type="number" id="f-internships"
                         placeholder="1" min="0" max="10" required
                         value="${u.internships || ''}">
                  <span class="form-error" id="f-internships-err"></span>
                </div>
                <div class="form-group">
                  <label class="form-label" for="f-certs">Certifications</label>
                  <input class="form-input" type="number" id="f-certs"
                         placeholder="2" min="0" max="30" required>
                  <span class="form-error" id="f-certs-err"></span>
                </div>
                <div class="form-group">
                  <label class="form-label" for="f-hackathons">Hackathons Attended</label>
                  <input class="form-input" type="number" id="f-hackathons"
                         placeholder="1" min="0" max="20" required>
                  <span class="form-error" id="f-hackathons-err"></span>
                </div>
              </div>
            </div>

            <!-- Form Footer -->
            <div class="form-footer">
              <p class="form-footer-note">
                All data is processed locally and via the HireVision AI API · Secure evaluation
              </p>
              <button type="submit" class="btn btn-primary" id="predict-submit" style="font-size:var(--text-sm);padding:var(--space-4) var(--space-8);">
                <span id="submit-text">Submit for evaluation →</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  // Re-init sliders
  initSliders();

  // Form submission
  const form = main.querySelector('#predict-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Collect values
    const get = id => main.querySelector(`#${id}`)?.value;
    const getNum = id => parseFloat(get(id)) || 0;
    const getInt = id => parseInt(get(id)) || 0;

    const age        = getInt('f-age');
    const gender     = get('f-gender');
    const degree     = get('f-degree');
    const branch     = get('f-branch');
    const cgpa       = getNum('f-cgpa');
    const tenth      = getNum('f-tenth');
    const twelfth    = getNum('f-twelfth');
    const backlogs   = getInt('f-backlogs');
    const attendance = getNum('f-attendance');

    const prog    = getInt('f-prog');
    const apt     = getInt('f-apt');
    const comm    = getInt('f-comm');
    const tech    = getInt('f-tech');
    const mock    = getInt('f-mock');
    const prob    = getInt('f-prob');
    const english = getInt('f-english');

    const projects    = getInt('f-projects');
    const internships = getInt('f-internships');
    const certs       = getInt('f-certs');
    const hackathons  = getInt('f-hackathons');

    // Validate required fields
    let valid = true;
    const errGlobal = main.querySelector('#form-error-global');

    const validateField = (id, errId, condition, msg) => {
      const el = main.querySelector(`#${id}`);
      const errEl = main.querySelector(`#${errId}`);
      if (!condition) {
        if (el)    { el.classList.add('error'); }
        if (errEl) { errEl.textContent = msg; errEl.classList.add('visible'); }
        valid = false;
      } else {
        if (el)    { el.classList.remove('error'); }
        if (errEl) { errEl.textContent = ''; errEl.classList.remove('visible'); }
      }
    };

    validateField('f-age',        'f-age-err',        age >= 17 && age <= 30,     'Enter a valid age (17–30).');
    validateField('f-gender',     'f-gender-err',     !!gender,                    'Select your gender.');
    validateField('f-degree',     'f-degree-err',     !!degree,                    'Select your degree.');
    validateField('f-branch',     'f-branch-err',     !!branch,                    'Select your branch.');
    validateField('f-cgpa',       'f-cgpa-err',       cgpa > 0 && cgpa <= 10,     'Enter CGPA between 0 and 10.');
    validateField('f-tenth',      'f-tenth-err',      tenth > 0 && tenth <= 100,  'Enter 10th % (1–100).');
    validateField('f-twelfth',    'f-twelfth-err',    twelfth > 0 && twelfth<=100,'Enter 12th % (1–100).');
    validateField('f-attendance', 'f-attendance-err', attendance >= 0 && attendance<=100,'Enter attendance % (0–100).');
    validateField('f-projects',   'f-projects-err',   projects >= 0,              'Enter number of projects.');
    validateField('f-internships','f-internships-err',internships >= 0,           'Enter number of internships.');
    validateField('f-certs',      'f-certs-err',      certs >= 0,                 'Enter number of certifications.');
    validateField('f-hackathons', 'f-hackathons-err', hackathons >= 0,            'Enter number of hackathons.');

    if (!valid) {
      errGlobal.textContent = 'Please fix the errors above before submitting.';
      errGlobal.classList.add('visible');
      errGlobal.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }
    errGlobal.textContent = '';
    errGlobal.classList.remove('visible');

    // Build payload
    const payload = {
      Age: age,
      Gender: gender,
      Degree: degree,
      Branch: branch,
      CGPA: cgpa,
      '10th_Percentage': tenth,
      '12th_Percentage': twelfth,
      Attendance_Percentage: attendance,
      Active_Backlogs: backlogs,
      Programming_Score: prog,
      Aptitude_Score: apt,
      Communication_Score: comm,
      Technical_Interview_Score: tech,
      Mock_Interview_Score: mock,
      Internships: internships,
      Projects: projects,
      Hackathons: hackathons,
      Certifications: certs,
      Problem_Solving: prob,
      English_Fluency: english,
    };

    // Loading state
    const btn  = main.querySelector('#predict-submit');
    const text = main.querySelector('#submit-text');
    btn.disabled = true;
    text.innerHTML = '<span class="spinner"></span> Evaluating…';

    // Update user profile with latest academics
    HV.currentUser.cgpa       = cgpa;
    HV.currentUser.tenth      = tenth;
    HV.currentUser.twelfth    = twelfth;
    HV.currentUser.backlogs   = backlogs;
    HV.currentUser.internships = internships;
    HV.currentUser.projects   = projects;
    HV.currentUser.attendance = attendance;
    HV.currentUser.branch     = branch;

    let result;
    try {
      const response = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      result = await response.json();
    } catch (err) {
      // Offline fallback: simple logistic heuristic
      console.warn('API unavailable, using heuristic fallback:', err.message);
      const score =
        (cgpa / 10) * 30 +
        (prog + apt + comm + tech + mock) / 5 / 10 * 40 +
        Math.min(1, internships * 0.4 + projects * 0.2 + hackathons * 0.2 + certs * 0.1) * 20 +
        (backlogs === 0 ? 10 : 0);
      const prob = Math.min(0.97, Math.max(0.03, score / 100));
      result = {
        placed: prob >= 0.5,
        prediction: prob >= 0.5 ? 1 : 0,
        probability_placed: parseFloat(prob.toFixed(2)),
        probability_not_placed: parseFloat((1 - prob).toFixed(2)),
        offline: true,
      };
      showToast('API offline — result estimated by local model.', 'info');
    }

    // Attach form data to result
    result.formData = payload;
    result.candidateName = u.name;
    result.timestamp = new Date().toISOString();

    // Store result
    HV.lastResult = result;

    // Append to history (newest first)
    HV.history.unshift({
      date: result.timestamp,
      confidence: Math.round(result.probability_placed * 100),
      placed: result.placed,
      cgpa: cgpa,
      branch: branch,
      topSuggestion: generateRemarks(payload, result.placed)[0] || 'Keep improving.',
    });

    saveSession();
    renderNav();

    btn.disabled = false;
    text.textContent = 'Submit for evaluation →';

    Router.navigate('result');
  });
}
