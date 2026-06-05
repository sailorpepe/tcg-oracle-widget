/**
 * TCG Oracle Widget — <undsr-card>
 *
 * Embeddable trading card price widget with live oracle data,
 * graded premiums, sparkline charts, and on-chain verification.
 *
 * Usage:
 *   <script async src="https://oracle.the-undesirables.com/static/widget.js"></script>
 *   <undsr-card product-id="84198" theme="dark"></undsr-card>
 *
 * Themes: dark | light | neon | holographic
 *
 * @author  SailorPepe — The Undesirables LLC
 * @license BUSL-1.1
 * @version 1.0.0
 */
(function () {
  "use strict";

  const API = "https://oracle.the-undesirables.com";

  /* ══════════════════════════════════════════════════════════════════
     THEME DEFINITIONS
     ══════════════════════════════════════════════════════════════════ */
  const THEMES = {
    dark: {
      bg: "#0d1117",
      bgCard: "#161b22",
      border: "#30363d",
      text: "#e6edf3",
      textDim: "#8b949e",
      accent: "#58a6ff",
      accentAlt: "#3fb950",
      negative: "#f85149",
      sparkline: "#58a6ff",
      divider: "#21262d",
      badge: "rgba(56,139,253,0.15)",
      badgeText: "#58a6ff",
      glow: "none",
      headerBg: "linear-gradient(135deg, #161b22 0%, #1c2333 100%)",
      font: "'Inter','Segoe UI',system-ui,-apple-system,sans-serif",
    },
    light: {
      bg: "#ffffff",
      bgCard: "#f6f8fa",
      border: "#d0d7de",
      text: "#1f2328",
      textDim: "#656d76",
      accent: "#0969da",
      accentAlt: "#1a7f37",
      negative: "#cf222e",
      sparkline: "#0969da",
      divider: "#d8dee4",
      badge: "rgba(9,105,218,0.1)",
      badgeText: "#0969da",
      glow: "none",
      headerBg: "linear-gradient(135deg, #f6f8fa 0%, #eef1f5 100%)",
      font: "'Inter','Segoe UI',system-ui,-apple-system,sans-serif",
    },
    neon: {
      bg: "#0a0a0f",
      bgCard: "#0f0f1a",
      border: "#00ff8840",
      text: "#e0ffe0",
      textDim: "#5a8a5a",
      accent: "#00ff88",
      accentAlt: "#00ff88",
      negative: "#ff0055",
      sparkline: "#00ff88",
      divider: "#00ff8820",
      badge: "rgba(0,255,136,0.1)",
      badgeText: "#00ff88",
      glow: "0 0 20px rgba(0,255,136,0.15), inset 0 0 20px rgba(0,255,136,0.05)",
      headerBg: "linear-gradient(135deg, #0f0f1a 0%, #0a1a0f 100%)",
      font: "'JetBrains Mono','Fira Code','Courier New',monospace",
    },
    holographic: {
      bg: "#0c0c1d",
      bgCard: "#12122a",
      border: "transparent",
      text: "#f0f0ff",
      textDim: "#9090b0",
      accent: "#c084fc",
      accentAlt: "#22d3ee",
      negative: "#fb7185",
      sparkline: "#c084fc",
      divider: "rgba(192,132,252,0.15)",
      badge: "rgba(192,132,252,0.12)",
      badgeText: "#c084fc",
      glow: "none",
      headerBg: "linear-gradient(135deg, #1a1a3e 0%, #12122a 50%, #1a2a3e 100%)",
      font: "'Inter','Segoe UI',system-ui,-apple-system,sans-serif",
    },
  };

  /* ══════════════════════════════════════════════════════════════════
     SPARKLINE SVG GENERATOR
     ══════════════════════════════════════════════════════════════════ */
  function sparklineSVG(prices, color, w = 200, h = 40) {
    if (!prices || prices.length < 2) return "";
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    const step = w / (prices.length - 1);
    const pts = prices.map((p, i) => {
      const x = i * step;
      const y = h - ((p - min) / range) * (h - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    const gradId = `sg${Math.random().toString(36).slice(2, 8)}`;
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${gradId}" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="M${pts.join("L")}L${w},${h}L0,${h}Z" fill="url(#${gradId})" />
      <polyline points="${pts.join(" ")}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${pts[pts.length - 1].split(",")[0]}" cy="${pts[pts.length - 1].split(",")[1]}" r="2.5" fill="${color}"/>
    </svg>`;
  }

  /* ══════════════════════════════════════════════════════════════════
     STYLES GENERATOR
     ══════════════════════════════════════════════════════════════════ */
  function buildStyles(t, isHolo) {
    const holoOverlay = isHolo
      ? `
      .card::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: 12px;
        padding: 1.5px;
        background: linear-gradient(
          135deg,
          #ff6b6b, #feca57, #48dbfb, #ff9ff3, #54a0ff, #5f27cd, #ff6b6b
        );
        background-size: 300% 300%;
        animation: holo-shift 6s ease infinite;
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
        z-index: 1;
      }
      @keyframes holo-shift {
        0%, 100% { background-position: 0% 50%; }
        25% { background-position: 100% 0%; }
        50% { background-position: 100% 100%; }
        75% { background-position: 0% 100%; }
      }`
      : "";

    return `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

      :host {
        display: block;
        width: 320px;
        font-family: ${t.font};
        font-size: 13px;
        color: ${t.text};
        line-height: 1.5;
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }

      .card {
        position: relative;
        background: ${t.bgCard};
        border: 1px solid ${t.border};
        border-radius: 12px;
        overflow: hidden;
        box-shadow: ${t.glow}, 0 4px 24px rgba(0,0,0,0.2);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .card:hover {
        transform: translateY(-2px);
        box-shadow: ${t.glow}, 0 8px 32px rgba(0,0,0,0.3);
      }
      ${holoOverlay}

      .header {
        background: ${t.headerBg};
        padding: 14px 16px 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid ${t.divider};
      }
      .header-left { display: flex; align-items: center; gap: 8px; }
      .header-icon { font-size: 18px; }
      .header-title {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        color: ${t.textDim};
      }
      .theme-btn {
        background: none;
        border: 1px solid ${t.divider};
        border-radius: 6px;
        color: ${t.textDim};
        font-size: 11px;
        padding: 3px 8px;
        cursor: pointer;
        font-family: inherit;
        transition: all 0.15s ease;
      }
      .theme-btn:hover {
        border-color: ${t.accent};
        color: ${t.accent};
      }

      .product-name {
        padding: 12px 16px 4px;
        font-size: 14px;
        font-weight: 700;
        color: ${t.text};
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .product-meta {
        padding: 0 16px 12px;
        font-size: 11px;
        color: ${t.textDim};
      }

      .section {
        padding: 0 16px;
        margin-bottom: 12px;
      }
      .section-divider {
        height: 1px;
        background: ${t.divider};
        margin: 0 16px 12px;
      }

      .price-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 0;
      }
      .price-label {
        font-size: 12px;
        color: ${t.textDim};
        font-weight: 500;
      }
      .price-value {
        font-size: 20px;
        font-weight: 700;
        color: ${t.text};
        font-variant-numeric: tabular-nums;
      }
      .price-change {
        font-size: 12px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 4px;
      }
      .price-change.up {
        color: ${t.accentAlt};
        background: rgba(63,185,80,0.12);
      }
      .price-change.down {
        color: ${t.negative};
        background: rgba(248,81,73,0.12);
      }

      .grade-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
      }
      .grade-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 10px;
        background: ${t.bg};
        border-radius: 6px;
        border: 1px solid ${t.divider};
      }
      .grade-label {
        font-size: 11px;
        font-weight: 600;
        color: ${t.textDim};
      }
      .grade-price {
        font-size: 12px;
        font-weight: 700;
        color: ${t.text};
        font-variant-numeric: tabular-nums;
      }
      .grade-pct {
        font-size: 10px;
        color: ${t.accentAlt};
        margin-left: 4px;
      }

      .section-label {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        color: ${t.textDim};
        margin-bottom: 8px;
      }

      .sparkline-wrap {
        border-radius: 6px;
        overflow: hidden;
        background: ${t.bg};
        border: 1px solid ${t.divider};
        padding: 8px 4px 4px;
      }

      .merkle-badge {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: ${t.badge};
        border-radius: 8px;
        border: 1px solid ${t.divider};
      }
      .merkle-icon { font-size: 16px; }
      .merkle-text {
        font-size: 11px;
        font-weight: 600;
        color: ${t.badgeText};
      }
      .merkle-hash {
        font-size: 10px;
        font-family: 'JetBrains Mono','Fira Code',monospace;
        color: ${t.textDim};
      }

      .footer {
        padding: 10px 16px;
        border-top: 1px solid ${t.divider};
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .footer-link {
        font-size: 10px;
        color: ${t.textDim};
        text-decoration: none;
        transition: color 0.15s;
      }
      .footer-link:hover { color: ${t.accent}; }
      .footer-dot {
        width: 6px; height: 6px;
        border-radius: 50%;
        background: ${t.accentAlt};
        animation: pulse 2s infinite;
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }

      .loading {
        padding: 48px 16px;
        text-align: center;
        color: ${t.textDim};
        font-size: 12px;
      }
      .loading-spinner {
        display: inline-block;
        width: 24px; height: 24px;
        border: 2px solid ${t.divider};
        border-top-color: ${t.accent};
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin-bottom: 8px;
      }
      @keyframes spin { to { transform: rotate(360deg); } }

      .error {
        padding: 32px 16px;
        text-align: center;
        color: ${t.negative};
        font-size: 12px;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .content { animation: fadeIn 0.4s ease; }
    `;
  }

  /* ══════════════════════════════════════════════════════════════════
     FORMAT HELPERS
     ══════════════════════════════════════════════════════════════════ */
  function fmtUSD(n) {
    if (n == null) return "—";
    return n >= 1000
      ? "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : "$" + n.toFixed(2);
  }
  function fmtPct(n) {
    if (n == null) return "";
    const sign = n >= 0 ? "+" : "";
    return `${sign}${n.toFixed(1)}%`;
  }

  /* ══════════════════════════════════════════════════════════════════
     WEB COMPONENT: <undsr-card>
     ══════════════════════════════════════════════════════════════════ */
  class UndsrCard extends HTMLElement {
    static get observedAttributes() {
      return ["product-id", "theme"];
    }

    constructor() {
      super();
      this._shadow = this.attachShadow({ mode: "open" });
      this._themeNames = ["dark", "light", "neon", "holographic"];
      this._data = null;
    }

    connectedCallback() {
      this._render();
      this._fetchData();
    }

    attributeChangedCallback(name) {
      if (name === "theme") this._render();
      if (name === "product-id") this._fetchData();
    }

    get _theme() {
      return this.getAttribute("theme") || "dark";
    }

    get _productId() {
      return this.getAttribute("product-id");
    }

    _cycleTheme() {
      const i = this._themeNames.indexOf(this._theme);
      const next = this._themeNames[(i + 1) % this._themeNames.length];
      this.setAttribute("theme", next);
      if (this._data) this._renderData(this._data);
    }

    _render() {
      const t = THEMES[this._theme] || THEMES.dark;
      this._shadow.innerHTML = `
        <style>${buildStyles(t, this._theme === "holographic")}</style>
        <div class="card">
          <div class="loading">
            <div class="loading-spinner"></div>
            <div>Loading oracle data...</div>
          </div>
        </div>
      `;
    }

    async _fetchData() {
      const pid = this._productId;
      if (!pid) return this._renderError("No product-id specified");

      try {
        const [priceRes, gradedRes] = await Promise.all([
          fetch(`${API}/api/v1/price?product_id=${pid}&days=30`).then((r) => r.json()),
          fetch(`${API}/api/v1/graded?product_id=${pid}`).then((r) => r.json()).catch(() => null),
        ]);

        let merkle = null;
        try {
          merkle = await fetch(`${API}/api/v1/merkle/proof?product_id=${pid}`).then((r) => r.json());
        } catch (_) {}

        this._data = { price: priceRes, graded: gradedRes, merkle };
        this._renderData(this._data);
      } catch (err) {
        this._renderError("Failed to load data");
      }
    }

    _renderError(msg) {
      const t = THEMES[this._theme] || THEMES.dark;
      this._shadow.innerHTML = `
        <style>${buildStyles(t, this._theme === "holographic")}</style>
        <div class="card"><div class="error">⚠️ ${msg}</div></div>
      `;
    }

    _renderData(d) {
      const t = THEMES[this._theme] || THEMES.dark;
      const p = d.price;

      // Extract price info
      const name = p?.card_name || p?.name || "Unknown Card";
      const category = p?.game_name || p?.category || "";
      const currentPrice = p?.market_price ?? p?.price ?? null;

      // Price history for sparkline + change calc
      const history = p?.history || p?.price_history || [];
      const prices = history.map((h) => h.market_price || h.mid_price || h.price).filter(Boolean);
      let changePct = null;
      if (prices.length >= 2) {
        const oldest = prices[0];
        const newest = prices[prices.length - 1];
        if (oldest > 0) changePct = ((newest - oldest) / oldest) * 100;
      }

      // Graded premiums
      const grades = d.graded?.grades || d.graded?.data || [];
      const topGrades = grades.slice(0, 4);

      // Merkle verification
      const hasMerkle = d.merkle && d.merkle.proof && d.merkle.proof.length > 0;
      const merkleRoot = d.merkle?.root ? d.merkle.root.slice(0, 10) + "..." : null;

      // Sparkline
      const spark = sparklineSVG(prices, t.sparkline);

      // Build HTML
      const changeClass = changePct >= 0 ? "up" : "down";
      const changeArrow = changePct >= 0 ? "▲" : "▼";

      let gradesHTML = "";
      if (topGrades.length > 0) {
        const items = topGrades
          .map((g) => {
            const prem =
              currentPrice && g.median_price
                ? ((g.median_price / currentPrice - 1) * 100).toFixed(0)
                : null;
            return `
              <div class="grade-item">
                <span class="grade-label">${g.grade || g.grading_label || "—"}</span>
                <span>
                  <span class="grade-price">${fmtUSD(g.median_price || g.price)}</span>
                  ${prem ? `<span class="grade-pct">+${prem}%</span>` : ""}
                </span>
              </div>`;
          })
          .join("");
        gradesHTML = `
          <div class="section-divider"></div>
          <div class="section">
            <div class="section-label">Graded Premiums</div>
            <div class="grade-grid">${items}</div>
          </div>`;
      }

      let sparkHTML = "";
      if (spark) {
        sparkHTML = `
          <div class="section-divider"></div>
          <div class="section">
            <div class="section-label">30-Day Trend</div>
            <div class="sparkline-wrap">${spark}</div>
          </div>`;
      }

      let merkleHTML = "";
      if (hasMerkle) {
        merkleHTML = `
          <div class="section-divider"></div>
          <div class="section">
            <div class="merkle-badge">
              <span class="merkle-icon">⛓️</span>
              <div>
                <div class="merkle-text">On-Chain Verified</div>
                <div class="merkle-hash">Merkle Root: ${merkleRoot}</div>
              </div>
            </div>
          </div>`;
      }

      this._shadow.innerHTML = `
        <style>${buildStyles(t, this._theme === "holographic")}</style>
        <div class="card">
          <div class="content">
            <div class="header">
              <div class="header-left">
                <span class="header-icon">🔮</span>
                <span class="header-title">TCG Oracle</span>
              </div>
              <button class="theme-btn" id="themeToggle">${this._theme}</button>
            </div>

            <div class="product-name">${name}</div>
            <div class="product-meta">${category}</div>

            <div class="section">
              <div class="price-row">
                <span class="price-label">Market Price</span>
                <div style="display:flex;align-items:center;gap:8px;">
                  <span class="price-value">${fmtUSD(currentPrice)}</span>
                  ${changePct !== null ? `<span class="price-change ${changeClass}">${changeArrow} ${Math.abs(changePct).toFixed(1)}%</span>` : ""}
                </div>
              </div>
            </div>

            ${gradesHTML}
            ${sparkHTML}
            ${merkleHTML}

            <div class="footer">
              <a class="footer-link" href="https://oracle.the-undesirables.com" target="_blank" rel="noopener">
                Powered by TCG Oracle
              </a>
              <div class="footer-dot" title="Live data"></div>
            </div>
          </div>
        </div>
      `;

      this._shadow.getElementById("themeToggle")?.addEventListener("click", () => this._cycleTheme());
    }
  }

  if (!customElements.get("undsr-card")) {
    customElements.define("undsr-card", UndsrCard);
  }
})();
