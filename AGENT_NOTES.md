# Notes — BWF-Stats-Dashboard

Public **GitHub Pages deploy** of the BrightWater stats dashboard. This repo holds only the
clean static site; development, history, and security notes live in the private `bwf-dashboard`
repo.

## Purpose

Public GitHub Pages deployment of the BrightWater stats dashboard.

## Current Branch / Base Branch

- Current local branch: `agent/pages`
- Configured base branch: `main`

## How To Test

- Static site; open `index.html` or serve locally.
- Verify public deploy at `https://jackmanj1337.github.io/BWF-Stats-Dashboard/`.

## Important Data / External Services

- Reads public aggregate ArcGIS CSV item `e6d545d8ec4540a29bd34d598c84e28e`.
- Deployed by GitHub Pages from `agent/pages` root.

## Protected or Dangerous Areas

- Keep this repo clean and public-safe.
- Do not add security findings, private history, secrets, or per-SWE data source IDs.

## Current Open Work

- None. The dashboard project is **closed as of 2026-06-18**.
- If work resumes: mirror static widget changes from `bwf-dashboard` when the public deploy should change.

## Last Known Good State

- GitHub Pages was verified live on 2026-06-17.
- Project closed 2026-06-18 with Pages live and the dashboard showing real aggregate totals.

## 2026-06-16 — created

- Seeded with the static widget (`index.html`, `app.js`, `config.js`, `styles.css`, `.nojekyll`)
  on branch `agent/pages` (the repo's default branch).
- `config.js` reads the public aggregate totals item (`metric_id,total`); it shows `0`s until
  the upstream pipeline writes real numbers, and `—` if the data can't be loaded.
- **To publish:** Settings → Pages → Deploy from a branch → `agent/pages` / root.
- To update content, mirror the static files from `bwf-dashboard` (e.g. a config/itemId change).
