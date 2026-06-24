/*
  Demo-only dashboard configuration.

  This page is intentionally isolated from the production dashboard data source.
  Change `source.url`, `metrics`, labels, icons, or styles in this /demo folder
  without affecting the production root dashboard.
*/
window.DASHBOARD_CONFIG = {
  title: "BrightWater Demo Dashboard",

  source: {
    url: "./data/demo-totals.csv"
  },

  metrics: [
    { id: "adults_taught",    label: "Adults taught Safe Water",     icon: "people", compact: true },
    { id: "veronica_buckets", label: "Veronica Buckets Distributed", icon: "bucket", compact: true },
    { id: "tablets",          label: "Chlorine Tablets Distributed", icon: "drop",   compact: true }
  ],

  cacheBust: true
};
