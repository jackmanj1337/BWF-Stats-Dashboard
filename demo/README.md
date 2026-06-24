# BrightWater Demo Dashboard

This folder is a demo-only GitHub Pages dashboard for nontechnical review.

- Production remains at the repository root.
- Demo review URL: `https://jackmanj1337.github.io/BWF-Stats-Dashboard/demo/`
- Demo data lives in `data/` and is aggregate-only.
- Change `config.js` to try different CSV files, labels, icons, and metric lists.

Expected CSV columns:

```csv
metric_id,total,recent_change,change_period,change_period_start
adults_taught,51900,382,last_30_days,2026-05-25
```

The pipeline should calculate `total` and `recent_change`. The dashboard formats
the final note from `recent_change`, `change_period`, and `change_period_start`.

To preview a different data set, update `source.url` in `config.js`, for example:

```js
source: { url: "./data/demo-expanded.csv" }
```
