(() => {
  "use strict";

  const config = window.DASHBOARD_CONFIG;

  const els = {
    title: document.getElementById("dashboard-title"),
    eyebrow: document.querySelector(".eyebrow"),
    status: document.getElementById("status-panel"),
    grid: document.getElementById("metrics-grid"),
    details: document.getElementById("details-panel"),
    refreshButton: document.getElementById("refresh-button")
  };

  if (!config) {
    renderConfigError("Missing DASHBOARD_CONFIG. Check that config.js is loaded before app.js.");
    return;
  }

  els.title.textContent = config.title || "Survey Results";
  els.eyebrow.textContent = config.subtitle || "Combined survey totals";
  els.refreshButton.addEventListener("click", loadDashboard);

  loadDashboard();

  async function loadDashboard() {
    setLoading();

    // Structural config problems are a hard error (nothing meaningful to show).
    try {
      validateConfig(config);
    } catch (error) {
      renderConfigError(error.message || String(error));
      return;
    }

    // Data problems degrade gracefully: every card falls back to "—".
    let totalsById = {};
    let loadError = null;
    let rowCount = 0;

    const url = totalsUrl(config.source);
    if (!url) {
      loadError = "Totals source is not configured yet — paste the dashboard_totals item GUID into config.js.";
    } else {
      try {
        const parsed = parseCsv(await fetchText(url, config.cacheBust));
        totalsById = indexTotals(parsed);
        rowCount = parsed.rows.length;
      } catch (error) {
        loadError = error.message || String(error);
        console.error(error);
      }
    }

    renderMetrics({ totalsById, loadError, rowCount, loadedAt: new Date() });
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

  function validateConfig(cfg) {
    if (!Array.isArray(cfg.metrics) || cfg.metrics.length === 0) {
      throw new Error("No metrics configured. Add metrics in config.js.");
    }
    for (const metric of cfg.metrics) {
      if (!metric.id || !metric.label) {
        throw new Error("Each metric needs an id and a label in config.js.");
      }
    }
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
      throw new Error(`Failed to fetch totals. HTTP ${response.status} ${response.statusText}`);
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

  // Build a { metric_id: total } lookup from the parsed CSV.
  function indexTotals(parsed) {
    if (!parsed.headers.includes("metric_id") || !parsed.headers.includes("total")) {
      throw new Error(
        `Totals CSV must have 'metric_id' and 'total' columns. Found: ${parsed.headers.join(", ")}`
      );
    }
    const byId = {};
    for (const row of parsed.rows) {
      byId[String(row.metric_id).trim()] = row.total;
    }
    return byId;
  }

  function toNumber(value) {
    if (value === null || value === undefined) return NaN;
    const normalized = String(value).trim().replace(/[$,%\s]/g, "");
    if (normalized === "") return NaN;
    return Number(normalized);
  }

  function setLoading() {
    els.status.className = "status-panel";
    els.status.textContent = "Loading totals…";
    els.details.hidden = true;
    els.grid.innerHTML = config.metrics.map((metric) => `
      <article class="metric-card placeholder">
        <p class="metric-label">${escapeHtml(metric.label)}</p>
        <p class="metric-value">—</p>
      </article>
    `).join("");
  }

  function renderMetrics(meta) {
    const { totalsById, loadError, rowCount, loadedAt } = meta;

    let missing = 0;
    els.grid.innerHTML = config.metrics.map((metric) => {
      const raw = totalsById ? totalsById[metric.id] : undefined;
      const value = toNumber(raw);
      const hasValue = raw !== undefined && Number.isFinite(value);
      if (!hasValue) missing++;
      return `
        <article class="metric-card${hasValue ? "" : " unavailable"}">
          <p class="metric-label">${escapeHtml(metric.label)}</p>
          <p class="metric-value">${hasValue ? formatNumber(value, metric.decimals) : "—"}</p>
          ${hasValue ? "" : `<p class="metric-note">No data found for "${escapeHtml(metric.id)}".</p>`}
        </article>
      `;
    }).join("");

    if (loadError) {
      els.status.className = "status-panel error";
      els.status.textContent = loadError;
    } else {
      els.status.className = "status-panel success";
      els.status.textContent =
        `Updated ${formatDateTime(loadedAt)} from ${rowCount.toLocaleString()} metric row${rowCount === 1 ? "" : "s"}.` +
        (missing ? ` ${missing} metric${missing === 1 ? "" : "s"} unavailable.` : "");
    }

    const url = totalsUrl(config.source);
    const haveUrl = !!url;
    els.details.hidden = false;
    els.details.innerHTML = `
      ${config.footerNote ? `<p>${escapeHtml(config.footerNote)}</p>` : ""}
      <details>
        <summary>Data source</summary>
        <dl class="source-details">
          <div><dt>Source</dt><dd>${haveUrl ? `<a href="${escapeAttribute(url)}" target="_blank" rel="noopener">Open source</a>` : "Not configured"}</dd></div>
          <div><dt>Metric rows</dt><dd>${rowCount.toLocaleString()}</dd></div>
        </dl>
      </details>
    `;
  }

  // Hard config error: render every configured card as "—" plus an explanatory
  // status, so the page still degrades gracefully rather than going blank.
  function renderConfigError(message) {
    els.status.className = "status-panel error";
    els.status.textContent = message;
    els.grid.innerHTML = (Array.isArray(config.metrics) ? config.metrics : []).map((metric) => `
      <article class="metric-card unavailable">
        <p class="metric-label">${escapeHtml(metric.label || metric.id || "Metric")}</p>
        <p class="metric-value">—</p>
      </article>
    `).join("");
    els.details.hidden = false;
    els.details.innerHTML = `<p>Review <code>config.js</code>: the totals source URL and the metric <code>id</code>/<code>label</code> entries.</p>`;
  }

  function formatNumber(value, decimals = 0) {
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  }

  function formatDateTime(date) {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
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

  function escapeAttribute(value) {
    return escapeHtml(value);
  }
})();
