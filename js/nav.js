/**
 * HireVision AI — Navigation Component
 */

function renderNav() {
  const nav = document.getElementById('app-nav');
  const loggedIn = !!HV.currentUser || HV.isAdminLoggedIn;
  const isAdmin  = HV.isAdminLoggedIn;
  const isStudent = !!HV.currentUser;

  const links = [
    { view: 'home',      label: 'Home',      always: true },
    { view: 'auth',      label: 'Login / Register', hideWhenLoggedIn: true },
    { view: 'dashboard', label: 'Dashboard', requireStudent: true },
    { view: 'predict',   label: 'Predict',   always: true },
    { view: 'history',   label: 'History',   requireStudent: true },
  ];

  const visibleLinks = links.filter(l => {
    if (l.hideWhenLoggedIn && loggedIn) return false;
    if (l.requireStudent && !isStudent)  return false;
    return true;
  });

  const currentView = window.location.hash.replace('#', '') || 'home';

  const linkHTML = visibleLinks.map(l => `
    <button class="nav-link ${currentView === l.view ? 'active' : ''}"
            data-view="${l.view}"
            aria-label="Navigate to ${l.label}">
      ${l.label}
    </button>
  `).join('');

  nav.innerHTML = `
    <nav class="nav" aria-label="Main navigation">
      <div class="container nav-inner">
        <!-- Brand -->
        <button class="nav-brand" data-view="home" aria-label="HireVision AI Home">
          <div class="brand-seal" aria-hidden="true">HV</div>
          <div class="nav-brand-text">
            <span class="nav-brand-eyebrow">Est. 2026</span>
            <span class="nav-brand-name">HireVision AI</span>
          </div>
        </button>

        <!-- Desktop links -->
        <div class="nav-links" role="menubar">
          ${linkHTML}
        </div>

        <!-- Right controls -->
        <div class="nav-right">
          ${loggedIn ? `
            <span style="font-family:var(--font-mono);font-size:var(--text-xs);color:var(--color-navy-mid);display:flex;align-items:center;gap:var(--space-2);">
              ${isAdmin ? `
                <span class="pill pill-gold" style="font-size:10px;padding:2px 8px;letter-spacing:0.05em;border-color:var(--color-stamp-red);color:var(--color-stamp-red);background:rgba(140,47,57,0.06);">
                  🛡️ Admin (${HV.adminUser?.name?.split(' ')[0] || 'Omm'})
                </span>
              ` : `
                <span>👤 ${HV.currentUser?.name?.split(' ')[0] || 'Student'}</span>
              `}
            </span>
          ` : ''}
          <button class="nav-logout ${loggedIn ? 'visible' : ''}"
                  id="nav-logout-btn"
                  aria-label="Logout">
            Logout
          </button>
          <!-- Hamburger -->
          <button class="nav-hamburger" id="nav-hamburger" aria-label="Toggle menu" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Mobile nav -->
    <div class="nav-mobile" id="nav-mobile" role="menu">
      ${linkHTML}
      ${loggedIn ? `<button class="nav-link" style="color:var(--color-stamp-red)" id="mobile-logout-btn">Logout</button>` : ''}
    </div>
  `;

  // Bind events
  nav.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      closeMenu();
      Router.navigate(view);
    });
  });

  const logoutBtn = nav.querySelector('#nav-logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  const mobileLogout = nav.querySelector('#mobile-logout-btn');
  if (mobileLogout) mobileLogout.addEventListener('click', () => { closeMenu(); logout(); });

  // Hamburger toggle
  const hamburger = nav.querySelector('#nav-hamburger');
  const mobileNav = nav.querySelector('#nav-mobile');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function closeMenu() {
    const mn = nav.querySelector('#nav-mobile');
    const hb = nav.querySelector('#nav-hamburger');
    if (mn) mn.classList.remove('open');
    if (hb) { hb.classList.remove('open'); hb.setAttribute('aria-expanded', 'false'); }
  }
}

// Re-render nav whenever auth state changes
HV.onAuthChange = renderNav;
