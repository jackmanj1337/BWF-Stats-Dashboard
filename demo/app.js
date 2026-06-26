(() => {
  "use strict";

  const config = window.DASHBOARD_CONFIG;
  const grid = document.getElementById("indicators");

  // Black silhouette icons matching the original ArcGIS dashboard. They inherit
  // the surrounding text color via `fill="currentColor"`.
  const ICONS = {
    // Group of people under a roof — "Adults taught Safe Water".
    people: `<svg viewBox="0 0 38.775467 34.456299" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  <g transform="translate(-5.7508 -196.78915)">
    <path fill="currentColor" d="M 25.138539,201.48443 10.758032,212.97391 H 5.7508049 l 19.3877341,-16.18476 19.387734,16.18476 h -5.007227 z" />
    <circle fill="currentColor" cx="12.010562" cy="217.9059" r="3.9120116" />
    <path fill="currentColor" d="m 6.7639751,231.24545 v -2.19064 c -1.8e-6,-2.89761 2.3489757,-5.24659 5.2465869,-5.24659 2.897611,0 5.246589,2.34898 5.246587,5.24659 v 2.19064 z" />
    <circle fill="currentColor" cx="25.404842" cy="213.39261" r="3.9120116" />
    <path fill="currentColor" d="m 20.158256,231.24545 v -6.70393 c -2e-6,-2.89761 2.348975,-5.24659 5.246586,-5.24659 2.897611,0 5.246589,2.34898 5.246587,5.24659 v 6.70393 z" />
    <circle fill="currentColor" cx="38.507942" cy="217.95442" r="3.9120116" />
    <path fill="currentColor" d="m 33.261355,231.24545 v -2.14212 c 4e-6,-2.89761 2.34898,-5.24658 5.246587,-5.24658 2.897607,0 5.246583,2.34897 5.246587,5.24658 v 2.14212 z" />
  </g>
</svg>`,
    // Tapered bucket with handle — "Veronica Buckets Distributed".
    bucket: `<svg viewBox="-1.5 -1.5 37.024281 41.290207" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  <g transform="translate(-380.83415 -304.1894)">
    <path fill="currentColor" d="m 397.11275,304.18945 a 10.82896,7.255235 0 0 0 -5.45291,0.97203 10.82896,7.255235 0 0 0 -5.40276,5.94382 h -5.42293 l 5.84822,31.37431 h 20.36929 l 1.22576,-6.5753 h 0.43823 c 2.03883,-0.082 2.574,0.43527 2.574,2.43602 v 0.84077 h 3.56878 v -3.27679 c 0,-1.97104 -1.59776,-3.56878 -3.56878,-3.56878 h -2.34714 l 3.95687,-21.23023 h -5.00796 a 10.82896,7.255235 0 0 0 -5.40279,-5.94382 10.82896,7.255235 0 0 0 -5.37588,-0.97203 z m -0.009,2.96054 a 7.6017151,3.9309301 0 0 1 3.77135,0.52658 7.6017151,3.9309301 0 0 1 3.80079,3.40444 h -7.60161 -7.60211 a 7.6017151,3.9309301 0 0 1 3.80132,-3.40444 7.6017151,3.9309301 0 0 1 3.83026,-0.52658 z" />
  </g>
</svg>`,
    // Water droplet — "Chlorine Tablets Distributed".
    drop: `<svg viewBox="0 0 29.305786 26.291726" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  <g transform="translate(-445.66048 -314.676)">
    <path
      fill="currentColor"
      d="m 474.96627,340.73618 c -3.61961,0.65191 -6.43294,-1.28167 -7.68676,-3.50022 0,0 -1.75622,3.65465 -6.67445,3.65465 -4.91823,0 -6.67445,-3.65465 -6.67445,-3.65465 -1.63016,2.21223 -3.57563,4.14624 -8.27013,3.65465 v -3.0198 c 4.6945,0.49159 6.63997,-1.44242 8.27013,-3.65465 0,0 1.75622,3.65465 6.67445,3.65465 4.91823,0 6.67445,-3.65465 6.67445,-3.65465 1.25382,2.21855 4.06715,4.15213 7.68676,3.50022 z" />
    <circle
      fill="none"
      stroke="currentColor"
      stroke-width="1.80737"
      stroke-linecap="round"
      cx="237.06622"
      cy="510.55258"
      r="8.0416098"
      transform="rotate(-30)" />
    <path
      fill="currentColor"
      stroke="currentColor"
      stroke-width="0.16"
      d="m 235.98859,518.52166 a 8.0416098,8.0416098 0 0 1 -6.96398,-7.97393 8.0416098,8.0416098 0 0 1 6.9736,-7.96552"
      transform="rotate(-30)" />
    <path
      fill="currentColor"
      stroke="currentColor"
      stroke-width="0.16"
      d="m -238.14385,518.52233 a 8.0416098,8.0416098 0 0 1 -6.96398,-7.97393 8.0416098,8.0416098 0 0 1 6.97359,-7.96552"
      transform="matrix(-0.8660254,0.5,0.5,0.8660254,0,0)" />
  </g>
</svg>
`
  };

  if (!config || !Array.isArray(config.metrics) || config.metrics.length === 0) {
    // Nothing meaningful to render; leave the static fallback markup in place.
    console.error("BWF dashboard: missing DASHBOARD_CONFIG or metrics in config.js.");
    return;
  }

  if (config.title) {
    document.title = config.title;
  }

  loadDashboard();

  async function loadDashboard() {
    let metricsById = {};

    const url = totalsUrl(config.source);
    if (url) {
      try {
        metricsById = indexMetrics(parseCsv(await fetchText(url, config.cacheBust)));
      } catch (error) {
        console.error("BWF dashboard: failed to load totals —", error);
      }
    } else {
      console.warn("BWF dashboard: totals source is not configured (config.js source.itemId/url).");
    }

    render(metricsById);
  }

  // Resolve the totals CSV URL: prefer an explicit `url`, otherwise build it
  // from a bare `itemId`. Returns null while either is still a TODO placeholder.
  function totalsUrl(source) {
    if (!source) return null;
    if (source.url && !source.url.includes("TODO_")) return source.url;
    if (source.itemId && !source.itemId.includes("TODO_")) {
      return `https://bwf.maps.arcgis.com/sharing/rest/content/items/${encodeURIComponent(source.itemId)}/data`;
    }
    return null;
  }

  async function fetchText(url, cacheBust) {
    const targetUrl = new URL(url, window.location.href);
    if (cacheBust) {
      targetUrl.searchParams.set("_ts", Date.now().toString());
    }

    const response = await fetch(targetUrl.toString(), {
      method: "GET",
      credentials: "omit",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    return response.text();
  }

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const next = text[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        row.push(field);
        field = "";
      } else if ((char === "\n" || char === "\r") && !inQuotes) {
        if (char === "\r" && next === "\n") i++;
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else {
        field += char;
      }
    }

    if (field.length || row.length) {
      row.push(field);
      rows.push(row);
    }

    const nonEmptyRows = rows.filter((r) => r.some((cell) => String(cell).trim() !== ""));
    if (nonEmptyRows.length < 1) {
      throw new Error("Totals CSV is empty or could not be parsed.");
    }

    const headers = nonEmptyRows[0].map((h) => String(h).trim());
    const records = nonEmptyRows.slice(1).map((cells) => {
      const record = {};
      headers.forEach((header, index) => {
        record[header] = cells[index] ?? "";
      });
      return record;
    });

    return { headers, rows: records };
  }

  // Build a { metric_id: row } lookup from the parsed CSV.
  function indexMetrics(parsed) {
    if (!parsed.headers.includes("metric_id") || !parsed.headers.includes("total")) {
      throw new Error(
        `Totals CSV must have 'metric_id' and 'total' columns. Found: ${parsed.headers.join(", ")}`
      );
    }
    const byId = {};
    for (const row of parsed.rows) {
      byId[String(row.metric_id).trim()] = row;
    }
    return byId;
  }

  function toNumber(value) {
    if (value === null || value === undefined) return NaN;
    const normalized = String(value).trim().replace(/[$,%\s]/g, "");
    if (normalized === "") return NaN;
    return Number(normalized);
  }

  function render(metricsById) {
    grid.innerHTML = config.metrics.map((metric) => {
      const row = metricsById ? metricsById[metric.id] : undefined;
      const value = toNumber(row && row.total);
      const hasValue = row !== undefined && Number.isFinite(value);
      const display = hasValue ? formatValue(value, metric) : "—";
      const note = row ? formatChangeNote(row) : "";
      const icon = ICONS[metric.icon] || "";

      return `
        <article class="indicator${hasValue ? "" : " unavailable"}">
          <p class="indicator-label">${escapeHtml(metric.label)}</p>
          <p class="indicator-figure">
            ${icon ? `<span class="indicator-icon">${icon}</span>` : ""}
            <span class="indicator-value">${escapeHtml(display)}</span>
          </p>
          ${note ? `<p class="indicator-note">${escapeHtml(note)}</p>` : ""}
        </article>
      `;
    }).join("");
  }

  // Compact notation to mirror the old dashboard (51,900 -> "51.9k", 633,000 ->
  // "633k"). Lowercases the magnitude suffix to match the original's "k".
  function formatValue(value, metric) {
    if (metric.compact) {
      const compact = new Intl.NumberFormat(undefined, {
        notation: "compact",
        maximumFractionDigits: 1
      }).format(value);
      return compact.replace(/K\b/, "k");
    }
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: metric.decimals || 0,
      maximumFractionDigits: metric.decimals || 0
    }).format(value);
  }

  function formatChangeNote(row) {
    const change = toNumber(row.recent_change);
    if (!Number.isFinite(change)) return "";

    const prefix = change > 0 ? "+ " : change < 0 ? "- " : "";
    const magnitude = formatValue(Math.abs(change), { compact: true });
    const period = formatPeriod(row);
    if (!period) return "";

    return `${prefix}${magnitude} ${period}`;
  }

  function formatPeriod(row) {
    const period = String(row.change_period || "").trim();
    const startText = String(row.change_period_start || "").trim();
    if (!period || !startText) return "";

    const start = parseDate(startText);
    if (!start) return "";

    if (period === "last_30_days") {
      return "in the last 30 days";
    }

    if (period === "since_date" && start) {
      return `since ${formatDate(start)}`;
    }

    if (period === "current_year" && start) {
      return `since start of ${start.getUTCFullYear()}`;
    }

    return "";
  }

  function parseDate(value) {
    const text = String(value || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
    const date = new Date(`${text}T00:00:00Z`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function formatDate(date) {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC"
    }).format(date);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
})();
