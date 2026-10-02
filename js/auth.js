/**
 * HireVision AI — Authentication Page
 * Login + Register tabs with validation
 */

function renderAuthPage() {
  if (HV.currentUser) { Router.navigate('dashboard'); return; }

  const main = document.getElementById('app-main');
  main.innerHTML = `
    <div class="auth-page">
      <div class="auth-box">
        <div class="auth-header">
          <p class="auth-eyebrow">Registration Desk</p>
          <div class="brand-seal" style="margin-inline:auto;margin-bottom:var(--space-4);color:var(--color-navy);width:48px;height:48px;font-size:var(--text-md);">HV</div>
          <h2>HireVision AI</h2>
          <p>Access your placement readiness dashboard</p>
        </div>

        <!-- Tabs -->
        <div class="auth-tabs" role="tablist">
          <button class="auth-tab active" id="tab-login" role="tab" aria-selected="true" aria-controls="form-login">
            Login
          </button>
          <button class="auth-tab" id="tab-register" role="tab" aria-selected="false" aria-controls="form-register">
            Register
          </button>
        </div>

        <!-- Login Form -->
        <div class="auth-card">
          <form class="auth-form active" id="form-login" role="tabpanel" aria-labelledby="tab-login" novalidate>
            <div class="form-group">
              <label class="form-label" for="login-email">College Email</label>
              <input class="form-input" type="email" id="login-email" name="email"
                     placeholder="yourname@giet.edu" autocomplete="email" required>
              <span class="form-error" id="login-email-err" role="alert"></span>
            </div>
            <div class="form-group">
              <label class="form-label" for="login-password">Password</label>
              <input class="form-input" type="password" id="login-password" name="password"
                     placeholder="Enter password" autocomplete="current-password" required>
              <span class="form-error" id="login-password-err" role="alert"></span>
            </div>
            <div class="form-group">
              <span class="form-error" id="login-global-err" role="alert" style="display:block;"></span>
            </div>
            <button type="submit" class="btn btn-primary auth-submit" id="login-submit">
              <span class="btn-text">Sign In →</span>
            </button>
          </form>

          <!-- Register Form -->
          <form class="auth-form" id="form-register" role="tabpanel" aria-labelledby="tab-register" novalidate>
            <div class="form-group">
              <label class="form-label" for="reg-name">Full Name</label>
              <input class="form-input" type="text" id="reg-name" name="name"
                     placeholder="Jyotiranjan Mohakud" autocomplete="name" required>
              <span class="form-error" id="reg-name-err" role="alert"></span>
            </div>
            <div class="form-group">
              <label class="form-label" for="reg-email">College Email</label>
              <input class="form-input" type="email" id="reg-email" name="email"
                     placeholder="yourname@giet.edu" autocomplete="email" required>
              <span class="form-error" id="reg-email-err" role="alert"></span>
            </div>
            <div class="form-group">
              <label class="form-label" for="reg-branch">Branch</label>
              <select class="form-select" id="reg-branch" name="branch" required>
                <option value="">— Select Branch —</option>
                <option value="CSE">CSE</option>
                <option value="CSE-AIML">CSE-AIML</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
              </select>
              <span class="form-error" id="reg-branch-err" role="alert"></span>
            </div>
            <div class="form-group">
              <label class="form-label" for="reg-password">Password</label>
              <input class="form-input" type="password" id="reg-password" name="password"
                     placeholder="Minimum 6 characters" autocomplete="new-password" required minlength="6">
              <span class="form-error" id="reg-password-err" role="alert"></span>
            </div>
            <div class="form-group">
              <span class="form-error" id="reg-global-err" role="alert" style="display:block;"></span>
            </div>
            <button type="submit" class="btn btn-primary auth-submit" id="reg-submit">
              <span class="btn-text">Create Account →</span>
            </button>
          </form>
        </div>

        <p class="auth-notice">
          🔒 Session-based prototype authentication · GIET University Internal Tool
        </p>
      </div>
    </div>
  `;

  // Tab switching
  const tabLogin    = main.querySelector('#tab-login');
  const tabReg      = main.querySelector('#tab-register');
  const formLogin   = main.querySelector('#form-login');
  const formReg     = main.querySelector('#form-register');

  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');    tabLogin.setAttribute('aria-selected', 'true');
    tabReg.classList.remove('active');   tabReg.setAttribute('aria-selected', 'false');
    formLogin.classList.add('active');
    formReg.classList.remove('active');
  });
  tabReg.addEventListener('click', () => {
    tabReg.classList.add('active');      tabReg.setAttribute('aria-selected', 'true');
    tabLogin.classList.remove('active'); tabLogin.setAttribute('aria-selected', 'false');
    formReg.classList.add('active');
    formLogin.classList.remove('active');
  });

  // Real-time validation
  function liveValidate(input, errId, validate) {
    input.addEventListener('blur', () => {
      const result = validate(input.value);
      const errEl = main.querySelector(`#${errId}`);
      if (result) { input.classList.add('error'); if(errEl) { errEl.textContent = result; errEl.classList.add('visible'); } }
      else         { input.classList.remove('error'); if(errEl) { errEl.textContent = ''; errEl.classList.remove('visible'); } }
    });
  }

  liveValidate(main.querySelector('#login-email'), 'login-email-err', v => v ? (!validateEmail(v) ? 'Enter a valid email address.' : '') : 'Email is required.');
  liveValidate(main.querySelector('#login-password'), 'login-password-err', v => v ? '' : 'Password is required.');
  liveValidate(main.querySelector('#reg-name'), 'reg-name-err', v => v.trim().length < 2 ? 'Please enter your full name.' : '');
  liveValidate(main.querySelector('#reg-email'), 'reg-email-err', v => !validateEmail(v) ? 'Enter a valid email address.' : '');
  liveValidate(main.querySelector('#reg-branch'), 'reg-branch-err', v => !v ? 'Please select your branch.' : '');
  liveValidate(main.querySelector('#reg-password'), 'reg-password-err', v => v.length < 6 ? 'Password must be at least 6 characters.' : '');

  // Login submit
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = main.querySelector('#login-email').value.trim();
    const pass  = main.querySelector('#login-password').value;
    const globalErr = main.querySelector('#login-global-err');

    let valid = true;
    if (!validateEmail(email)) {
      setError(main.querySelector('#login-email'), 'Enter a valid email.');
      valid = false;
    }
    if (!pass) {
      setError(main.querySelector('#login-password'), 'Password is required.');
      valid = false;
    }
    if (!valid) return;

    // Simulate loading
    const btn = main.querySelector('#login-submit');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Signing in…';

    await new Promise(r => setTimeout(r, 800));

    // Check if user is attempting to login with Admin credentials on Student portal
    if (email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase()) {
      btn.disabled = false;
      btn.innerHTML = '<span class="btn-text">Sign In →</span>';
      globalErr.innerHTML = `🛡️ <strong>Admin Account Detected:</strong> Please sign in via the <a href="#admin-login" style="color:var(--color-navy);text-decoration:underline;font-weight:600;">Secure Admin Portal</a>.`;
      globalErr.classList.add('visible');
      return;
    }

    // Check registered users
    const users = Store.load('users', []);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);

    btn.disabled = false;
    btn.innerHTML = '<span class="btn-text">Sign In →</span>';

    if (!user) {
      globalErr.textContent = 'Invalid email or password. Please try again or register.';
      globalErr.classList.add('visible');
      return;
    }

    globalErr.textContent = '';
    globalErr.classList.remove('visible');
    HV.currentUser = user;
    saveSession();
    renderNav();
    showToast(`Welcome back, ${user.name.split(' ')[0]}! 👋`, 'success');
    Router.navigate('dashboard');
  });

  // Register submit
  formReg.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name   = main.querySelector('#reg-name').value.trim();
    const email  = main.querySelector('#reg-email').value.trim();
    const branch = main.querySelector('#reg-branch').value;
    const pass   = main.querySelector('#reg-password').value;
    const globalErr = main.querySelector('#reg-global-err');

    let valid = true;
    if (name.length < 2)     { setError(main.querySelector('#reg-name'),     'Enter your full name.'); valid = false; }
    if (!validateEmail(email)){ setError(main.querySelector('#reg-email'),    'Enter a valid email.'); valid = false; }
    if (!branch)              { setError(main.querySelector('#reg-branch'),   'Select your branch.'); valid = false; }
    if (pass.length < 6)     { setError(main.querySelector('#reg-password'), 'Minimum 6 characters.'); valid = false; }
    if (!valid) return;

    // Strict security check: prevent registration with the reserved admin email
    if (email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase()) {
      setError(main.querySelector('#reg-email'), 'Reserved Administrator Email. Cannot be registered as a student.');
      globalErr.textContent = 'Restricted: This email is strictly reserved for the single authorized system administrator.';
      globalErr.classList.add('visible');
      return;
    }

    const btn = main.querySelector('#reg-submit');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Creating account…';

    await new Promise(r => setTimeout(r, 900));

    const users = Store.load('users', []);
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      btn.disabled = false;
      btn.innerHTML = '<span class="btn-text">Create Account →</span>';
      globalErr.textContent = 'This email is already registered. Please log in.';
      globalErr.classList.add('visible');
      return;
    }

    const newUser = {
      name,
      email: email.toLowerCase(),
      branch,
      password: pass,
      role: 'student', // strictly student role
      cgpa: '', tenth: '', twelfth: '', backlogs: 0,
      internships: 0, projects: 0, attendance: 0,
      registeredAt: new Date().toISOString(),
    };
    users.push(newUser);
    Store.save('users', users);

    HV.currentUser = newUser;
    saveSession();
    renderNav();

    btn.disabled = false;
    btn.innerHTML = '<span class="btn-text">Create Account →</span>';

    showToast(`Account created! Welcome, ${name.split(' ')[0]} 🎉`, 'success');
    Router.navigate('dashboard');
  });
}
