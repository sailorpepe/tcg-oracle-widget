<div align="center">

# 🔮 TCG Oracle Widget

**Embeddable trading card price intelligence for any website.**

Live oracle data · Graded premiums · 30-day sparklines · On-chain verification · 4 premium skins

[![Oracle](https://img.shields.io/badge/Oracle-Live-00C853)](https://oracle.the-undesirables.com)
[![LitVM](https://img.shields.io/badge/LitVM-LiteForge-FF6F00)](https://liteforge.explorer.caldera.xyz)
[![License](https://img.shields.io/badge/License-BUSL--1.1-blue)](LICENSE)

</div>

---

## 🔌 Connect over MCP — one URL, no install

```
https://mcp.the-undesirables.com
```

No install, no account, no API key. **10 tools** over streamable HTTP (MCP protocol
`2025-06-18`; legacy SSE also served). Free tools answer immediately. Paid tools return an
x402 `payment_required` carrying amount, network, and `payTo` — an agent with a funded
wallet can settle and retry in the same session. Settlement only occurs on a successful
response; failed calls are never charged.

**Claude Desktop / Perplexity** — add it as a custom remote connector (Perplexity:
Settings → Connectors → + Custom Connector → Remote).

**Cursor / Windsurf / VS Code** — clients that take a URL in config:

```json
{
  "mcpServers": {
    "tcg-oracle": { "url": "https://mcp.the-undesirables.com" }
  }
}
```

Tools: `search_tcg_products`, `market_snapshot`, `grade_card`, `grade_or_not`,
`simulate_price`, `card_forecast`, `trending_cards`, `optimize_portfolio`,
`recommend_workflow`, `check_accuracy`.

Search is set-aware — `search_tcg_products("Base Set Charizard")` separates Base Set,
Base Set 2, and Shadowless rather than returning every Charizard printing. Every result
carries a `set` field and a `product_id` you can pass straight to the other tools.

---

## Quick Start

Add two lines to any HTML page:

```html
<script async src="https://oracle.the-undesirables.com/static/widget.js"></script>

<undsr-card product-id="84198" theme="dark"></undsr-card>
```

That's it. The widget renders with live oracle data — no API keys, no build tools, no dependencies.

---

## Themes

Click the theme button on any widget to cycle through all 4 skins.

### 🌑 Dark
Clean, professional dark mode. Default theme.
```html
<undsr-card product-id="84198" theme="dark"></undsr-card>
```

### ☀️ Light
Clean white mode for light-themed sites.
```html
<undsr-card product-id="84198" theme="light"></undsr-card>
```

### ⚡ Neon
Cyberpunk aesthetic with monospace font and green glow.
```html
<undsr-card product-id="84198" theme="neon"></undsr-card>
```

### ✨ Holographic
Animated rainbow border — like a holographic trading card.
```html
<undsr-card product-id="84198" theme="holographic"></undsr-card>
```

---

## Attributes

| Attribute | Required | Description | Example |
|-----------|----------|-------------|---------|
| `product-id` | ✅ | TCG product ID | `84198` (Charizard Base Set) |
| `theme` | ❌ | Widget skin | `dark` \| `light` \| `neon` \| `holographic` |

### Finding Product IDs

Search for any card on the oracle API:
```
https://oracle.the-undesirables.com/api/v1/search?query=charizard+base+set
```

Popular product IDs:
| Card | Product ID |
|------|-----------|
| Charizard (Base Set) | `84198` |
| Black Lotus (Alpha) | `1196` |
| Blue-Eyes White Dragon (LOB) | `82498` |
| Pikachu (Base Set) | `84055` |

---

## What the Widget Shows

| Section | Data Source | Cost |
|---------|-----------|------|
| **Market Price** | Current price + 30-day % change | Free |
| **Graded Premiums** | PSA 10, PSA 9, BGS 9.5, CGC 9.5 | Free |
| **30-Day Sparkline** | Daily price history chart | Free |
| **On-Chain Verified** | Merkle proof badge (LitVM LiteForge) | Free |

All data is pulled from `oracle.the-undesirables.com` free endpoints. Rate limit: 60 requests/minute.

---

## Architecture

```
  Your Website                        TCG Oracle Server
┌─────────────────┐                ┌──────────────────────┐
│  <undsr-card>    │  ──fetch()──→ │ oracle.the-undes...   │
│  Shadow DOM      │               │                      │
│  CSS isolated    │  ←─ JSON ──  │ /api/v1/price        │
│  Self-contained  │               │ /api/v1/graded       │
└─────────────────┘               │ /api/v1/merkle/proof │
                                  └──────────┬───────────┘
                                             │
                                  ┌──────────▼───────────┐
                                  │ LitVM LiteForge      │
                                  │ Chain 4441            │
                                  │ 5 smart contracts     │
                                  └──────────────────────┘
```

---

## Self-Hosting

Download `widget.js` and serve it from your own domain:

```bash
curl -o widget.js https://oracle.the-undesirables.com/static/widget.js
```

```html
<script async src="/widget.js"></script>
<undsr-card product-id="84198"></undsr-card>
```

---

## Browser Support

| Browser | Supported |
|---------|-----------|
| Chrome 67+ | ✅ |
| Firefox 63+ | ✅ |
| Safari 13.1+ | ✅ |
| Edge 79+ | ✅ |
| Mobile browsers | ✅ |

Web Components and Shadow DOM are supported in all modern browsers.

---

## Other Integration Methods

| Method | Package | Best For |
|--------|---------|----------|
| **Widget** (this repo) | `<script>` tag | Any website |
| **WebMCP** | [`tcg-oracle-webmcp`](https://github.com/sailorpepe/tcg-oracle-webmcp) | AI agents in browsers |
| **MCP Server** | [`pip install undesirables-mcp-server`](https://pypi.org/project/undesirables-mcp-server/) | Claude, Cursor, VS Code |
| **ElizaOS Plugin** | [`npm i plugin-undesirables`](https://www.npmjs.com/package/plugin-undesirables) | Autonomous AI agents |
| **REST API** | [`oracle.the-undesirables.com`](https://oracle.the-undesirables.com) | Direct HTTP integration |
| **x402 Paid API** | USDC micropayments on Base | Premium data (risk forecasts, AI grading) |

---

## License

BUSL-1.1 — You can embed, fork, and self-host this freely. The one restriction: you cannot launch a competing TCG price oracle service.

---

<div align="center">

**Built by [SailorPepe](https://github.com/sailorpepe) · [The Undesirables LLC](https://the-undesirables.com)**

*The world's only on-chain trading card price oracle.*

</div>
