/*
  Dashboard configuration.

  The widget reads ONE aggregate CSV produced by the activity_and_compensation
  pipeline (function write_dashboard_totals). That CSV has two columns:

      metric_id,total

  Each card below maps a `metric_id` (must match the CSV) to a display `label`.
  No field math happens in the browser any more — the totals are precomputed
  (legacy + current, with excluded BWIDs already removed) server-side.

  SETUP: paste the dashboard_totals item GUID into `source.url` once the pipeline
  has created the public item on its first run. Until then the widget renders
  every card as "—" with a "not configured" note.
*/
window.DASHBOARD_CONFIG = {
  title: "BrightWater Program Totals",
  subtitle: "Combined survey totals",

  source: {
    // ⬇️ PASTE THE GUID HERE (just the 32-char item id, nothing else) once the
    // pipeline's first run creates the public "dashboard_totals" item.
    itemId: "e6d545d8ec4540a29bd34d598c84e28e"
    // Advanced: set `url:` instead to point at a full /data URL directly.
  },

  // metric_id must match the CSV's metric_id column; label is the display text.
  metrics: [
    { id: "adults_taught", label: "Adults Taught", decimals: 0 },
    { id: "veronica_buckets", label: "Veronica Buckets", decimals: 0 },
    { id: "tablets", label: "Tablets (Given + Sold)", decimals: 0 }
  ],

  // Adds a timestamp query string to avoid stale browser/CDN cache.
  cacheBust: true,

  // Optional note rendered below the metric cards.
  footerNote: "Combined legacy + current totals from BrightWater survey data."
};
