/*
  Dashboard configuration.

  The widget reads ONE aggregate CSV produced by the activity_and_compensation
  pipeline (function write_dashboard_totals). That CSV has two columns:

      metric_id,total

  Each entry below maps a `metric_id` (must match the CSV) to a display `label`,
  an `icon` (one of the built-in keys in app.js: "people", "bucket", "drop"),
  and `compact` formatting (51,900 -> "51.9k", matching the old dashboard).
  No field math happens in the browser — the totals are precomputed server-side
  (legacy + current, with excluded BWIDs already removed).

  SETUP: `source.itemId` is the public "dashboard_totals" ArcGIS item GUID. The
  widget builds the /data URL from it. Until a real total exists, each card
  renders "—".
*/
window.DASHBOARD_CONFIG = {
  // Used only for the browser tab title; no on-page header is rendered so the
  // bar swaps cleanly into the website / ArcGIS dashboard.
  title: "BrightWater Program Totals",

  source: {
    // The 32-char public "dashboard_totals" item id (metric_id,total CSV).
    itemId: "e6d545d8ec4540a29bd34d598c84e28e"
    // Advanced: set `url:` instead to point at a full /data URL directly.
  },

  // metric_id must match the CSV; label/icon/compact control the display.
  metrics: [
    { id: "adults_taught",    label: "Adults taught Safe Water",     icon: "people", compact: true },
    { id: "veronica_buckets", label: "Veronica Buckets Distributed", icon: "bucket", compact: true },
    { id: "tablets",          label: "Chlorine Tablets Distributed", icon: "drop",   compact: true }
  ],

  // Adds a timestamp query string to avoid stale browser/CDN cache.
  cacheBust: true
};
