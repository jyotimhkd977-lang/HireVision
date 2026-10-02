/**
 * HireVision AI — Main Application Entry Point
 * Registers all routes and initializes the SPA
 */

document.addEventListener('DOMContentLoaded', () => {

  // Load persisted session
  loadSession();

  // Initial nav render
  renderNav();

  // Register all routes
  Router.register('home',         renderLandingPage);
  Router.register('auth',         renderAuthPage);
  Router.register('dashboard',    renderDashboardPage);
  Router.register('predict',      renderPredictPage);
  Router.register('result',       renderResultPage);
  Router.register('history',      renderHistoryPage);
  Router.register('admin-login',  renderAdminLoginPage);
  Router.register('admin-portal', renderAdminLoginPage);
  Router.register('admin',        () => {
    if (HV.isAdminLoggedIn && HV.adminUser?.email === ADMIN_CREDENTIALS.email) {
      renderAdminDashboard();
    } else {
      renderAdminLoginPage();
    }
  });

  // Init SPA router (reads URL hash)
  Router.init();
});
