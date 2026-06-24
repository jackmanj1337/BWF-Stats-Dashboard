(() => {
  "use strict";

  const config = window.DASHBOARD_CONFIG;
  const grid = document.getElementById("indicators");

  // Black silhouette icons matching the original ArcGIS dashboard. They inherit
  // the surrounding text color via `fill="currentColor"`.
  const ICONS = {
    // Group of people under a roof — "Adults taught Safe Water".
    people: `<svg viewBox="0 0 40 30" fill="currentColor" aria-hidden="true" focusable="false">
        <path d="M20 1 2 10h36L20 1z"/>
        <circle cx="20" cy="15" r="3.6"/>
        <path d="M20 19.5c-3.4 0-5.6 2.3-5.6 5.6V29h11.2v-3.9c0-3.3-2.2-5.6-5.6-5.6z"/>
        <circle cx="8.5" cy="17.5" r="2.9"/>
        <path d="M8.5 21.4c-2.7 0-4.5 1.9-4.5 4.6V29h9v-3c0-2.7-1.8-4.6-4.5-4.6z"/>
        <circle cx="31.5" cy="17.5" r="2.9"/>
        <path d="M31.5 21.4c-2.7 0-4.5 1.9-4.5 4.6V29h9v-3c0-2.7-1.8-4.6-4.5-4.6z"/>
      </svg>`,
    // Tapered bucket with handle — "Veronica Buckets Distributed".
    bucket: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
        <path d="M5 4a7 3 0 0 1 14 0" fill="none" stroke="currentColor" stroke-width="1.8"/>
        <path d="M3.6 6.2h16.8l-1.7 13.5A2.6 2.6 0 0 1 16.1 22H7.9a2.6 2.6 0 0 1-2.6-2.3L3.6 6.2z"/>
      </svg>`,
    // Water droplet — "Chlorine Tablets Distributed".
    drop: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
        <path d="M12 2S4 11 4 16a8 8 0 0 0 16 0C20 11 12 2 12 2z"/>
      </svg>`
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
