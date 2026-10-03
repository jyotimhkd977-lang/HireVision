/*
 * Runtime configuration for the static frontend.
 *
 * For local file usage leave apiBase empty; the app will try localhost:8000.
 * After creating the Render service, set apiBase to its public HTTPS URL.
 */
window.HIREVISION_CONFIG = Object.freeze({
  apiBase: window.HIREVISION_API_BASE || ''
});
