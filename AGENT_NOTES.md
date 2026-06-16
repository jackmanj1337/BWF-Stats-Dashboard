# Notes — BWF-Stats-Dashboard

Public **GitHub Pages deploy** of the BrightWater stats dashboard. This repo holds only the
clean static site; development, history, and security notes live in the private `bwf-dashboard`
repo.

## 2026-06-16 — created

- Seeded with the static widget (`index.html`, `app.js`, `config.js`, `styles.css`, `.nojekyll`)
  on branch `agent/pages` (the repo's default branch).
- `config.js` reads the public aggregate totals item (`metric_id,total`); it shows `0`s until
  the upstream pipeline writes real numbers, and `—` if the data can't be loaded.
- **To publish:** Settings → Pages → Deploy from a branch → `agent/pages` / root.
- To update content, mirror the static files from `bwf-dashboard` (e.g. a config/itemId change).
