/**
 * TCG Oracle Widget — <undsr-card>
 *
 * Embeddable trading card price widget with live oracle data,
 * graded premiums, sparkline charts, and on-chain verification.
 *
 * Usage:
 *   <script async src="https://oracle.the-undesirables.com/static/widget.js"></script>
 *
 *   <!-- Specific card -->
 *   <undsr-card product-id="84198" theme="chrome"></undsr-card>
 *
 *   <!-- Interactive search mode -->
 *   <undsr-card search theme="chrome"></undsr-card>
 *
 * Themes: dark | light | neon | chrome
 *
 * @author  SailorPepe — The Undesirables LLC
 * @license BUSL-1.1
 * @version 1.1.0
 */
(function () {
  "use strict";

  const API = "https://oracle.the-undesirables.com";
  const MERKLE_CONTRACT = "0x96B124f50156589274ADF8F674509374752170Cd";
  const EXPLORER = "https://liteforge.explorer.caldera.xyz/address/";

  /* ══════════════════════════════════════════════════════════════════
     THEME DEFINITIONS
     ══════════════════════════════════════════════════════════════════ */
  const THEMES = {
    dark: {
      bg: "#0d1117", bgCard: "#161b22", border: "#30363d",
      text: "#e6edf3", textDim: "#8b949e",
      accent: "#58a6ff", accentAlt: "#3fb950", negative: "#f85149",
      sparkline: "#58a6ff", divider: "#21262d",
      badge: "rgba(56,139,253,0.15)", badgeText: "#58a6ff",
      glow: "none",
      headerBg: "linear-gradient(135deg, #161b22 0%, #1c2333 100%)",
      borderStyle: "1px solid #30363d",
      inputBg: "#0d1117",
    },
    light: {
      bg: "#ffffff", bgCard: "#ffffff", border: "#d0d7de",
      text: "#1f2328", textDim: "#656d76",
      accent: "#0969da", accentAlt: "#1a7f37", negative: "#cf222e",
      sparkline: "#0969da", divider: "#d8dee4",
      badge: "rgba(9,105,218,0.08)", badgeText: "#0969da",
      glow: "none",
      headerBg: "linear-gradient(135deg, #f6f8fa 0%, #eaeef2 100%)",
      borderStyle: "1px solid #d0d7de",
      inputBg: "#f6f8fa",
    },
    neon: {
      bg: "#0a0a0f", bgCard: "#0f0f1a", border: "#00ff8840",
      text: "#e0ffe0", textDim: "#5a8a5a",
      accent: "#00ff88", accentAlt: "#00ff88", negative: "#ff0055",
      sparkline: "#00ff88", divider: "#00ff8820",
      badge: "rgba(0,255,136,0.1)", badgeText: "#00ff88",
      glow: "0 0 20px rgba(0,255,136,0.15), inset 0 0 20px rgba(0,255,136,0.05)",
      headerBg: "linear-gradient(135deg, #0f0f1a 0%, #0a1a0f 100%)",
      borderStyle: "1px solid rgba(0,255,136,0.25)",
      inputBg: "#0a0a0f",
    },
    chrome: {
      bg: "#0c0e14", bgCard: "#12151e", border: "#2a3040",
      text: "#d4dae4", textDim: "#6b7a90",
      accent: "#22d3ee", accentAlt: "#34d399", negative: "#fb7185",
      sparkline: "#22d3ee", divider: "#1e2230",
      badge: "rgba(34,211,238,0.1)", badgeText: "#22d3ee",
      glow: "none",
      headerBg: "linear-gradient(135deg, #181c28 0%, #12151e 50%, #181c28 100%)",
      borderStyle: "1px solid #2a3040",
      inputBg: "#0c0e14",
    },
  };

  /* ══════════════════════════════════════════════════════════════════
     SPARKLINE SVG
     ══════════════════════════════════════════════════════════════════ */
  function sparklineSVG(prices, color, w = 200, h = 40) {
    if (!prices || prices.length < 2) return "";
    const min = Math.min(...prices), max = Math.max(...prices);
    const range = max - min || 1;
    const step = w / (prices.length - 1);
    const pts = prices.map((p, i) => {
      const x = i * step;
      const y = h - ((p - min) / range) * (h - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    const gid = `sg${Math.random().toString(36).slice(2, 8)}`;
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="${gid}" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
      </linearGradient></defs>
      <path d="M${pts.join("L")}L${w},${h}L0,${h}Z" fill="url(#${gid})" />
      <polyline points="${pts.join(" ")}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${pts[pts.length - 1].split(",")[0]}" cy="${pts[pts.length - 1].split(",")[1]}" r="2.5" fill="${color}"/>
    </svg>`;
  }

  function fmtUSD(n) {
    if (n == null) return "—";
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /* ══════════════════════════════════════════════════════════════════
     STYLES
     ══════════════════════════════════════════════════════════════════ */
  function buildStyles(t, themeName) {
    const chromeAccent = themeName === "chrome"
      ? `.card::before {
          content:""; position:absolute; inset:0; border-radius:12px; padding:1.5px;
          background:linear-gradient(135deg,#22d3ee,#0ea5e9,#6366f1,#0ea5e9,#22d3ee);
          background-size:400% 400%; animation:chrome-shift 8s ease infinite;
          -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
          -webkit-mask-composite:xor; mask-composite:exclude;
          pointer-events:none; z-index:1;
        }
        @keyframes chrome-shift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }` : "";

    return `
      :host { display:block; width:var(--undsr-width, 320px); font-family:'Inter','Segoe UI',system-ui,-apple-system,sans-serif; font-size:13px; color:${t.text}; line-height:1.5; }
      * { box-sizing:border-box; margin:0; padding:0; }
      .card { position:relative; background:${t.bgCard}; border:${t.borderStyle}; border-radius:12px; overflow:hidden; box-shadow:${t.glow},0 4px 24px rgba(0,0,0,0.25); transition:transform 0.2s,box-shadow 0.2s; }
      .card:hover { transform:translateY(-2px); box-shadow:${t.glow},0 8px 32px rgba(0,0,0,0.35); }
      ${chromeAccent}
      .header { background:${t.headerBg}; padding:12px 16px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid ${t.divider}; }
      .header-left { display:flex; align-items:center; gap:8px; }
      .header-logo { font-size:11px; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; color:${t.accent}; }
      .theme-btn,.search-back { background:none; border:1px solid ${t.divider}; border-radius:6px; color:${t.textDim}; font-size:10px; padding:3px 8px; cursor:pointer; font-family:inherit; transition:all 0.15s; text-transform:uppercase; letter-spacing:0.5px; }
      .theme-btn:hover,.search-back:hover { border-color:${t.accent}; color:${t.accent}; }
      .header-actions { display:flex; gap:6px; align-items:center; }
      .product-name { padding:14px 16px 2px; font-size:15px; font-weight:700; color:${t.text}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .product-meta { padding:0 16px 12px; font-size:11px; color:${t.textDim}; }
      .product-row { display:flex; gap:14px; padding:10px 16px 8px; }
      .card-img { width:64px; height:88px; border-radius:6px; object-fit:cover; border:1px solid ${t.divider}; flex-shrink:0; opacity:0; transition:opacity 0.3s; }
      .card-img.loaded { opacity:1; }
      .card-img.hidden { display:none; }
      .product-info { flex:1; min-width:0; }
      .product-info .product-name { padding:0; font-size:15px; }
      .product-info .product-meta { padding:0; margin-top:2px; }
      .section { padding:0 16px; margin-bottom:12px; }
      .divider { height:1px; background:${t.divider}; margin:0 16px 12px; }
      .price-row { display:flex; justify-content:space-between; align-items:center; }
      .price-label { font-size:12px; color:${t.textDim}; font-weight:500; }
      .price-value { font-size:22px; font-weight:700; color:${t.text}; font-variant-numeric:tabular-nums; }
      .price-change { font-size:11px; font-weight:600; padding:2px 8px; border-radius:4px; margin-left:8px; }
      .up { color:${t.accentAlt}; background:rgba(52,211,153,0.12); }
      .down { color:${t.negative}; background:rgba(248,81,73,0.12); }
      .grade-grid { display:grid; grid-template-columns:1fr; gap:6px; }
      .grade-item { padding:8px 10px; background:${t.bg}; border-radius:6px; border:1px solid ${t.divider}; }
      .grade-top { display:flex; justify-content:space-between; align-items:center; }
      .grade-label { font-size:11px; font-weight:600; color:${t.textDim}; }
      .grade-price { font-size:13px; font-weight:700; color:${t.text}; font-variant-numeric:tabular-nums; }
      .grade-mult { font-size:10px; color:${t.accentAlt}; margin-left:4px; }
      .grade-range { display:flex; gap:10px; margin-top:4px; }
      .grade-range a { font-size:10px; color:${t.textDim}; text-decoration:none; transition:color 0.15s; }
      .grade-range a:hover { color:${t.accent}; text-decoration:underline; }
      .section-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; color:${t.textDim}; margin-bottom:8px; }
      .sparkline-wrap { border-radius:6px; overflow:hidden; background:${t.bg}; border:1px solid ${t.divider}; padding:8px 4px 4px; }
      .merkle-badge { display:flex; align-items:center; gap:8px; padding:8px 12px; background:${t.badge}; border-radius:8px; border:1px solid ${t.divider}; text-decoration:none; cursor:pointer; transition:all 0.2s; }
      .merkle-badge:hover { border-color:${t.badgeText}40; transform:translateX(2px); }
      .merkle-icon { font-size:14px; }
      .merkle-text { font-size:11px; font-weight:600; color:${t.badgeText}; }
      .merkle-hash { font-size:10px; font-family:'SF Mono','Fira Code','Courier New',monospace; color:${t.textDim}; }
      .source-link { display:block; font-size:10px; color:${t.textDim}; text-decoration:none; margin-top:6px; transition:color 0.15s; }
      .source-link:hover { color:${t.accent}; text-decoration:underline; }
      .merkle-arrow { font-size:10px; color:${t.textDim}; margin-left:auto; transition:transform 0.2s; }
      .merkle-badge:hover .merkle-arrow { transform:translateX(3px); color:${t.badgeText}; }
      .footer { padding:10px 16px; border-top:1px solid ${t.divider}; display:flex; justify-content:space-between; align-items:center; }
      .footer-link { font-size:10px; color:${t.textDim}; text-decoration:none; transition:color 0.15s; }
      .footer-link:hover { color:${t.accent}; }
      .live-dot { width:6px; height:6px; border-radius:50%; background:${t.accentAlt}; animation:pulse 2s infinite; }
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      .loading { padding:52px 16px; text-align:center; color:${t.textDim}; font-size:12px; }
      .spinner { display:inline-block; width:22px; height:22px; border:2px solid ${t.divider}; border-top-color:${t.accent}; border-radius:50%; animation:spin 0.7s linear infinite; margin-bottom:10px; }
      @keyframes spin { to{transform:rotate(360deg)} }
      .error { padding:36px 16px; text-align:center; color:${t.negative}; font-size:12px; }
      @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      .content { animation:fadeIn 0.35s ease; }

      /* ═══ SEARCH MODE ═══ */
      .search-body { padding:16px; }
      .search-input {
        width:100%; padding:11px 14px; background:${t.inputBg}; border:1px solid ${t.divider};
        border-radius:8px; color:${t.text}; font-size:13px; font-family:inherit; outline:none;
        transition:border-color 0.2s;
      }
      .search-input:focus { border-color:${t.accent}; box-shadow:0 0 0 3px ${t.accent}18; }
      .search-input::placeholder { color:${t.textDim}; }
      .search-list { margin-top:8px; max-height:360px; overflow-y:auto; }
      .search-item {
        padding:10px 12px; border-radius:6px; cursor:pointer;
        transition:background 0.12s; display:flex; justify-content:space-between; align-items:center;
      }
      .search-item:hover { background:${t.bg}; }
      .search-item-name { font-size:13px; font-weight:600; color:${t.text}; }
      .search-item-id { font-size:10px; color:${t.textDim}; font-family:'SF Mono',monospace; }
      .search-item-arrow { font-size:10px; color:${t.divider}; transition:all 0.15s; }
      .search-item:hover .search-item-arrow { color:${t.accent}; transform:translateX(3px); }
      .search-empty { padding:24px 12px; text-align:center; color:${t.textDim}; font-size:12px; }
      .search-prompt { padding:32px 12px; text-align:center; }
      .search-prompt-icon { font-size:28px; margin-bottom:8px; }
      .search-prompt-text { color:${t.textDim}; font-size:12px; line-height:1.6; }
      .search-prompt-text strong { color:${t.text}; }
      .search-count { font-size:10px; color:${t.textDim}; text-align:center; margin-top:8px; }
      .game-filter { display:flex; gap:6px; margin-bottom:6px; align-items:center; }
      .game-select { flex:1; padding:6px 10px; border-radius:6px; border:1px solid ${t.divider}; background:${t.bg}; color:${t.text}; font-size:11px; font-family:inherit; cursor:pointer; appearance:auto; outline:none; }
      .game-select:focus { border-color:${t.accent}; }
      .grade-tabs { display:flex; gap:4px; margin-bottom:8px; }
      .grade-tab { flex:1; padding:5px 4px; border-radius:6px; border:1px solid ${t.divider}; background:transparent; color:${t.textDim}; font-size:11px; font-weight:600; font-family:inherit; cursor:pointer; transition:all 0.15s; text-align:center; }
      .grade-tab:hover { border-color:${t.accent}; color:${t.text}; }
      .grade-tab.active { background:${t.accent}; border-color:${t.accent}; color:#fff; }
      .graded-item { display:flex; gap:10px; align-items:center; padding:8px 10px; border-radius:6px; cursor:pointer; transition:background 0.12s; }
      .graded-item:hover { background:${t.bg}; }
      .graded-img { width:36px; height:50px; border-radius:4px; object-fit:cover; background:${t.divider}; flex-shrink:0; }
      .graded-info { flex:1; min-width:0; }
      .graded-name { font-size:12px; font-weight:600; color:${t.text}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .graded-meta { font-size:10px; color:${t.textDim}; margin-top:2px; }
      .graded-right { text-align:right; flex-shrink:0; }
      .graded-price { font-size:13px; font-weight:700; color:${t.accent}; font-variant-numeric:tabular-nums; }
      .graded-mult { font-size:10px; color:${t.accentAlt}; }
      .search-divider { height:1px; background:${t.divider}; margin:8px 0; }
      .search-list::-webkit-scrollbar { width:4px; }
      .search-list::-webkit-scrollbar-track { background:transparent; }
      .search-list::-webkit-scrollbar-thumb { background:${t.divider}; border-radius:2px; }
    `;
  }

  const GAMES = [
    [null, "🎴 All Games"],
    ["pokemon", "⚡ Pokémon"], ["magic", "🧙 Magic: The Gathering"],
    ["yu-gi-oh", "👁️ Yu-Gi-Oh!"], ["one piece", "🏴‍☠️ One Piece"],
    ["lorcana", "✨ Disney Lorcana"], ["flesh and blood", "⚔️ Flesh & Blood"],
    ["digimon", "🦎 Digimon"], ["star wars", "⭐ Star Wars Unlimited"],
    ["dragon ball", "🔥 Dragon Ball"], ["union arena", "🎮 Union Arena"],
    ["pokemon japan", "🇯🇵 Pokémon Japan"], ["gundam", "🤖 Gundam"],
  ];

  /* ══════════════════════════════════════════════════════════════════
     WEB COMPONENT
     ══════════════════════════════════════════════════════════════════ */
  class UndsrCard extends HTMLElement {
    static get observedAttributes() { return ["product-id", "theme", "search"]; }

    constructor() {
      super();
      this._shadow = this.attachShadow({ mode: "open" });
      this._themes = ["dark", "light", "neon", "chrome"];
      this._data = null;
      this._searchTimer = null;
      this._gameFilter = null;  // null = All Games
      this._gradeFilter = "PSA 10"; // default grade tab
    }

    connectedCallback() {
      if (this.hasAttribute("search") && !this._pid) {
        this._renderSearch();
        this._loadGraded(); // Auto-load top graded cards on open
      } else {
        this._renderLoading();
        this._fetchData();
      }
    }

    attributeChangedCallback(name) {
      if (name === "theme") {
        if (this._data) this._renderData(this._data);
        else if (this.hasAttribute("search") && !this._pid) this._renderSearch();
      }
      if (name === "product-id" && this._pid) { this._renderLoading(); this._fetchData(); }
    }

    get _theme() { return this.getAttribute("theme") || "dark"; }
    get _pid() { return this.getAttribute("product-id"); }
    get _isSearch() { return this.hasAttribute("search"); }

    _cycleTheme() {
      const i = this._themes.indexOf(this._theme);
      this.setAttribute("theme", this._themes[(i + 1) % this._themes.length]);
    }

    /* ─── SEARCH MODE ─── */
    _renderSearch(query = "", results = null, graded = null) {
      const t = THEMES[this._theme] || THEMES.dark;
      const GRADES = ["PSA 10", "PSA 9", "PSA 8", "PSA 7", "PSA 6"];
      const activeGrade = this._gradeFilter || "PSA 10";

      let bodyHTML;
      if (query && results && results.length > 0) {
        // Search results mode
        const items = results.map(c =>
          `<div class="graded-item" data-pid="${c.product_id}">
            <div>
              <div class="graded-name">${c.name || c.card_name}</div>
              <div class="graded-meta">${c.game || 'TCG'} · ${c.product_id}</div>
            </div>
            <span class="search-item-arrow">→</span>
          </div>`
        ).join("");
        bodyHTML = `<div class="search-list">${items}</div>
          <div class="search-count">${results.length} results</div>`;
      } else if (query && results && results.length === 0) {
        bodyHTML = `<div class="search-empty">No cards found for "${query}"</div>`;
      } else if (graded && graded.length > 0) {
        // Graded bluechips — default landing
        const imgBase = 'https://product-images.tcgplayer.com/fit-in/200x279/';
        const items = graded.map(c =>
          `<div class="graded-item" data-pid="${c.product_id}">
            <img class="graded-img" src="${imgBase}${c.product_id}.jpg" alt="" loading="lazy" onerror="this.style.display='none'">
            <div class="graded-info">
              <div class="graded-name" title="${c.card_name}">${c.card_name}</div>
              <div class="graded-meta">${c.game || 'TCG'} · ${c.listings || '?'} sold</div>
            </div>
            <div class="graded-right">
              <div class="graded-price">${fmtUSD(c.graded_price)}</div>
              <div class="graded-mult">${c.premium_x}x raw</div>
            </div>
          </div>`
        ).join("");
        bodyHTML = `<div class="search-list">${items}</div>
          <div class="search-count">${graded.length} graded cards · On-chain verified</div>`;
      } else {
        bodyHTML = `<div class="search-prompt">
          <div class="search-prompt-icon">⚡</div>
          <div class="search-prompt-text">Loading graded cards...</div>
        </div>`;
      }

      const gameOptions = GAMES.map(([key, label]) =>
        `<option value="${key ?? ''}"${this._gameFilter === key ? ' selected' : ''}>${label}</option>`
      ).join("");

      const gradeTabs = GRADES.map(g =>
        `<button class="grade-tab${g === activeGrade ? ' active' : ''}" data-grade="${g}">${g.replace('PSA ', '')}</button>`
      ).join("");

      this._shadow.innerHTML = `
        <style>${buildStyles(t, this._theme)}</style>
        <div class="card"><div class="content">
          <div class="header">
            <div class="header-left"><span class="header-logo">TCG Oracle</span></div>
            <div class="header-actions">
              <button class="theme-btn" id="tb">${this._theme}</button>
            </div>
          </div>
          <div class="search-body">
            <div class="grade-tabs">${gradeTabs}</div>
            ${bodyHTML}
            <div class="search-divider"></div>
            <div class="game-filter">
              <select class="game-select" id="gs">${gameOptions}</select>
            </div>
            <input class="search-input" id="si" type="text" placeholder="🔍 Search 432K+ cards..." value="${query}" autocomplete="off">
          </div>
          <div class="footer">
            <a class="footer-link" href="https://oracle.the-undesirables.com" target="_blank" rel="noopener">Powered by TCG Oracle</a>
            <div class="live-dot" title="Live data"></div>
          </div>
        </div></div>`;

      // Wire events
      this._shadow.getElementById("tb")?.addEventListener("click", () => this._cycleTheme());

      // Wire search
      const input = this._shadow.getElementById("si");
      if (input) {
        input.addEventListener("input", (e) => {
          clearTimeout(this._searchTimer);
          const q = e.target.value.trim();
          if (q.length < 2) {
            if (!query) return; // already showing graded, don't reload
            this._loadGraded();
            return;
          }
          this._searchTimer = setTimeout(() => this._doSearch(q), 300);
        });
        if (query) {
          input.focus();
          input.setSelectionRange(query.length, query.length);
        }
      }

      // Click on any card item
      this._shadow.querySelectorAll(".graded-item").forEach(el => {
        el.addEventListener("click", () => {
          this.setAttribute("product-id", el.dataset.pid);
        });
      });

      // Game dropdown
      this._shadow.getElementById("gs")?.addEventListener("change", (e) => {
        this._gameFilter = e.target.value || null;
        const curQuery = this._shadow.getElementById("si")?.value?.trim() || "";
        if (curQuery.length >= 2) {
          this._doSearch(curQuery);
        } else {
          this._loadGraded();
        }
      });

      // Grade tabs
      this._shadow.querySelectorAll(".grade-tab").forEach(tab => {
        tab.addEventListener("click", () => {
          this._gradeFilter = tab.dataset.grade;
          this._loadGraded();
        });
      });
    }

    async _loadGraded() {
      try {
        const grade = this._gradeFilter || "PSA 10";
        let url = `${API}/api/v1/graded-bluechips?grade=${encodeURIComponent(grade)}`;
        if (this._gameFilter) url += `&game=${encodeURIComponent(this._gameFilter)}`;
        const res = await fetch(url);
        const json = await res.json();
        const cards = json?.data?.cards || [];
        this._renderSearch("", null, cards);
      } catch (_) {
        this._renderSearch("", null, []);
      }
    }

    async _doSearch(query) {
      try {
        let url = `${API}/api/v1/search?query=${encodeURIComponent(query)}&limit=8&source=widget`;
        if (this._gameFilter) url += `&game=${encodeURIComponent(this._gameFilter)}`;
        const res = await fetch(url);
        const json = await res.json();
        const items = json?.data?.results || [];
        this._renderSearch(query, items);
      } catch (_) {
        this._renderSearch(query, []);
      }
    }

    /* ─── LOADING / ERROR ─── */
    _renderLoading() {
      const t = THEMES[this._theme] || THEMES.dark;
      this._shadow.innerHTML = `
        <style>${buildStyles(t, this._theme)}</style>
        <div class="card"><div class="loading"><div class="spinner"></div><div>Loading oracle data...</div></div></div>`;
    }

    _renderError(msg) {
      const t = THEMES[this._theme] || THEMES.dark;
      this._shadow.innerHTML = `
        <style>${buildStyles(t, this._theme)}</style>
        <div class="card"><div class="error">${msg}</div></div>`;
    }

    /* ─── DATA FETCH ─── */
    async _fetchData() {
      const pid = this._pid;
      if (!pid) return this._isSearch ? this._renderSearch() : this._renderError("No product-id set");
      try {
        const [priceRes, gradedRes] = await Promise.all([
          fetch(`${API}/api/v1/price?product_id=${pid}&days=30`).then(r => r.json()),
          fetch(`${API}/api/v1/graded?product_id=${pid}`).then(r => r.json()).catch(() => null),
        ]);
        let merkle = null;
        try { merkle = await fetch(`${API}/api/v1/merkle/proof?product_id=${pid}`).then(r => r.json()); } catch (_) {}

        this._data = {
          price: priceRes?.data || priceRes,
          graded: gradedRes?.data || gradedRes,
          merkle: merkle?.data || merkle,
        };
        this._renderData(this._data);
      } catch (err) {
        this._renderError("Failed to load data");
      }
    }

    /* ─── RENDER CARD DATA ─── */
    _renderData(d) {
      const t = THEMES[this._theme] || THEMES.dark;
      const p = d.price;
      const name = p?.name || p?.card_name || "Unknown Card";
      const category = p?.game || "";
      const currentPrice = p?.market_price ?? null;

      const history = p?.price_history || [];
      const prices = history.map(h => h.market_price).filter(Boolean);
      let changePct = null;
      if (prices.length >= 2) {
        const old = prices[0], now = prices[prices.length - 1];
        if (old > 0) changePct = ((now - old) / old) * 100;
      }

      const grades = (d.graded?.grades || []).slice(0, 4);
      const ebayLink = d.graded?.ebay_sold_link || null;
      const hasMerkle = d.merkle?.proof && d.merkle.proof.length > 0;
      const merkleRoot = d.merkle?.root ? d.merkle.root.slice(0, 10) + "..." : null;
      const spark = sparklineSVG(prices, t.sparkline);

      const arrow = changePct >= 0 ? "▲" : "▼";
      const changeClass = changePct >= 0 ? "up" : "down";

      let gradesHTML = "";
      if (grades.length > 0) {
        const cardName = encodeURIComponent(name);
        const game = encodeURIComponent(category || '');
        const items = grades.map(g => {
          const mult = g.premium || (currentPrice && g.median_price ? (g.median_price / currentPrice).toFixed(1) + "x" : null);
          const gradeEnc = encodeURIComponent(g.grade);
          // Grade-specific eBay sold search — includes card name + grade
          const ebayUrl = `https://www.ebay.com/sch/i.html?_nkw=${cardName}+${gradeEnc}&LH_Complete=1&LH_Sold=1&_sop=16`;
          return `<div class="grade-item">
            <div class="grade-top">
              <span class="grade-label">${g.grade} <span style="color:${t.textDim};font-weight:400;font-size:10px">(${g.listings || '?'} sold)</span></span>
              <span><span class="grade-price">${fmtUSD(g.median_price)}</span>${mult ? `<span class="grade-mult">${mult}</span>` : ""}</span>
            </div>
            <div class="grade-range">
              <span style="color:${t.textDim};font-size:10px">Low: ${fmtUSD(g.low)} · High: ${fmtUSD(g.high)}</span>
              <a href="${ebayUrl}" target="_blank" rel="noopener" style="font-size:10px">eBay Comps ↗</a>
            </div>
          </div>`;
        }).join("");
        gradesHTML = `<div class="divider"></div><div class="section"><div class="section-label">Graded Premiums (Median)</div><div class="grade-grid">${items}</div></div>`;
      }

      const sparkHTML = spark ? `<div class="divider"></div><div class="section"><div class="section-label">30-Day Trend</div><div class="sparkline-wrap">${spark}</div></div>` : "";

      const merkleHTML = hasMerkle ? `<div class="divider"></div><div class="section">
        <a class="merkle-badge" href="${EXPLORER}${MERKLE_CONTRACT}" target="_blank" rel="noopener">
          <span class="merkle-icon">⛓</span>
          <div><div class="merkle-text">On-Chain Verified</div><div class="merkle-hash">Root: ${merkleRoot}</div></div>
          <span class="merkle-arrow">→</span>
        </a></div>` : "";

      // Search back button if in search mode
      const searchBtn = this._isSearch
        ? `<button class="search-back" id="sb">⌕ SEARCH</button>` : "";

      this._shadow.innerHTML = `
        <style>${buildStyles(t, this._theme)}</style>
        <div class="card"><div class="content">
          <div class="header">
            <div class="header-left"><span class="header-logo">TCG Oracle</span></div>
            <div class="header-actions">
              ${searchBtn}
              <button class="theme-btn" id="tb">${this._theme}</button>
            </div>
          </div>
          <div class="product-row">
            <img class="card-img" id="cimg" src="https://product-images.tcgplayer.com/fit-in/200x279/${this._pid}.jpg" alt="${name}" loading="lazy">
            <div class="product-info">
              <div class="product-name" title="${name}">${name}</div>
              <div class="product-meta">${category}${currentPrice ? ` · ID ${this._pid}` : ""}</div>
            </div>
          </div>
          <div class="section">
            <div class="price-row">
              <span class="price-label">Market Price</span>
              <div style="display:flex;align-items:center;">
                <span class="price-value">${fmtUSD(currentPrice)}</span>
                ${changePct !== null ? `<span class="price-change ${changeClass}">${arrow} ${Math.abs(changePct).toFixed(1)}%</span>` : ""}
              </div>
            </div>
            <a class="source-link" href="https://www.tcgplayer.com/product/${this._pid}" target="_blank" rel="noopener">📈 Source: TCGplayer Market Data →</a>
          </div>
          ${gradesHTML}${sparkHTML}${merkleHTML}
          <div class="footer">
            <a class="footer-link" href="https://oracle.the-undesirables.com" target="_blank" rel="noopener">Powered by TCG Oracle</a>
            <div class="live-dot" title="Live data"></div>
          </div>
        </div></div>`;

      this._shadow.getElementById("tb")?.addEventListener("click", () => this._cycleTheme());
      const img = this._shadow.getElementById("cimg");
      if (img) {
        img.onload = () => img.classList.add("loaded");
        img.onerror = () => img.classList.add("hidden");
      }
      this._shadow.getElementById("sb")?.addEventListener("click", () => {
        this.removeAttribute("product-id");
        this._data = null;
        this._renderSearch();
      });
    }
  }

  if (!customElements.get("undsr-card")) {
    customElements.define("undsr-card", UndsrCard);
  }
})();
