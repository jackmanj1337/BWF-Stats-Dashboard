# BrightWater Demo Dashboard

This folder is a demo-only GitHub Pages dashboard for nontechnical review.

- Production remains at the repository root.
- Demo review URL: `https://jackmanj1337.github.io/BWF-Stats-Dashboard/demo/`
- Demo data lives in `data/` and is aggregate-only.
- Change `config.js` to try different CSV files, labels, icons, and metric lists.

Expected CSV columns:

```csv
metric_id,total,recent_change,change_period,change_period_start,change_period_days
adults_taught,51900,382,last_n_days,2026-05-25,90
```

The pipeline should calculate `total` and `recent_change`. The dashboard formats
the final note from `recent_change` plus the period columns. If any of those
recent-change fields are missing or malformed for a metric, the dashboard hides
that metric's recent-change note and still shows the main total.

`change_period` controls the wording of the note:

| `change_period` | uses | renders |
| --- | --- | --- |
| `last_n_days` | `change_period_days` | `in the last <N> days` (N read from the CSV) |
| `last_30_days` | `change_period_start` (must be valid) | `in the last 30 days` |
| `since_date` | `change_period_start` | `since <Mon D, YYYY>` |
| `current_year` | `change_period_start` | `since start of <YYYY>` |

For `last_n_days`, set the window length in the `change_period_days` column —
e.g. `90` renders "in the last 90 days". `change_period_start` is not required
for that period. The other periods ignore `change_period_days`.

To preview a different data set, update `source.url` in `config.js`, for example:

```js
source: { url: "./data/demo-expanded.csv" }
```
