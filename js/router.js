/**
 * HireVision AI — Client-Side Router
 * SPA-style view navigation with history API
 */

const Router = {
  routes: {},

  register(name, handler) {
    this.routes[name] = handler;
  },

  navigate(name, params = {}) {
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(el => {
      el.classList.toggle('active', el.dataset.view === name);
    });
    document.querySelectorAll('.nav-mobile .nav-link').forEach(el => {
      el.classList.toggle('active', el.dataset.view === name);
    });

    // Fade out main
    const main = document.getElementById('app-main');
    if (main) {
      main.style.opacity = '0';
      main.style.transform = 'translateY(8px)';
    }

    // Update URL hash for bookmarking
    history.replaceState({ view: name, params }, '', `#${name}`);

    setTimeout(() => {
      if (this.routes[name]) {
        this.routes[name](params);
      } else {
        this.routes['home']?.();
      }
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Fade in
      if (main) {
        main.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        main.style.opacity = '1';
        main.style.transform = 'translateY(0)';
      }
      // Re-init common behaviors
      initScrollReveal();
      initSliders();
      initFAQ();
      initCounters();
    }, 150);
  },

  init() {
    // Handle back/forward
    window.addEventListener('popstate', (e) => {
      const view = e.state?.view || 'home';
      this.navigate(view, e.state?.params || {});
    });
    // Initial route from hash
    const hash = window.location.hash.replace('#', '') || 'home';
    this.navigate(hash);
  }
};
