# BWF Stats Dashboard

Static **GitHub Pages** site showing BrightWater program totals. It reads one public,
aggregate-only ArcGIS CSV (`metric_id,total`) and renders three metric cards — no build step,
no dependencies, no per-person data.

- `index.html` / `styles.css` — page + styling
- `config.js` — the totals item id and card labels
- `app.js` — fetch / parse / render (graceful `—` when data is unavailable)

Development, history, and security notes live in the private `bwf-dashboard` repo; this repo
is the deployed static site only.
