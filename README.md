# ShopKart Analytics — Demo Dashboard

A data dashboard for **ShopKart, a fictional online store**, built as a
self-directed portfolio piece by **Khushi Khatri** (Glassboro, NJ).

> **This is not client work.** There is no real client, no real store, and no
> real revenue. Every number on the dashboard comes from clearly labelled
> **sample / demo data** (`public/sample-data.json`, 216 fictional orders over
> 30 days). The React and Node.js pieces are learning / expansion pieces —
> they are **not** professional client experience. No fake clients,
> testimonials, stats, or experience claims are made anywhere in this project.

## What it does

- **KPI cards** — revenue, orders, visitors, conversion rate, each with a
  change vs the previous equal-length period, plus average order value.
- **Charts (Chart.js)** — revenue-over-time line chart, revenue-by-category
  bar chart, revenue-by-channel doughnut chart. All charts update with the filters.
- **Filters** — date range (7 / 14 / 30 days), product category, sales channel.
- **Orders table** — sortable by order, date, customer, product and total;
  free-text search; pagination; status badges.
- **CSV export** — downloads the currently filtered table as a CSV, entirely
  in the browser (no server round-trip).
- **Responsive layout** — sidebar + topbar; the sidebar collapses to a
  slide-in menu on mobile.

## Stack

| Piece | Tech |
| --- | --- |
| Frontend | React 18, Vite 5, Chart.js + react-chartjs-2, Bootstrap 5 |
| Backend (optional, local) | Node.js / Express — reads the sample JSON file, no database |
| Data | Fictional sample data in `public/sample-data.json` (+ `public/sample-orders.csv`, first 60 orders) |

## Project layout

```
analytics-dashboard/
├── index.html                 # Vite entry
├── package.json               # frontend deps + scripts
├── vite.config.js             # base '/analytics-dashboard/', build -> docs/
├── public/
│   ├── sample-data.json       # canonical fictional dataset (216 orders)
│   └── sample-orders.csv      # sample CSV (first 60 orders)
├── src/
│   ├── main.jsx  App.jsx  App.css
│   ├── api.js                 # API client; API base URL in ONE place (API_BASE)
│   ├── utils.js               # KPI / chart aggregation, CSV export
│   ├── data/sampleData.js     # embedded copy of the sample data (offline fallback)
│   └── components/            # KpiCards, ChartsSection, OrdersTable
├── server/
│   ├── package.json           # only dependency: express
│   ├── server.js              # GET /api/health, /api/kpis, /api/sales, /api/orders
│   └── README-SERVER.md       # API setup / run / endpoints
├── docs/                      # PRODUCTION BUILD (committed) — served by GitHub Pages
└── README.md
```

## Run locally

```bash
npm install
npm run dev        # frontend at http://localhost:5173 (proxies /api to :3000)
```

With the API (recommended — the dashboard then shows a green "Live API" badge):

```bash
cd server
npm install        # only dependency: express
npm start          # API on http://localhost:3000; also serves the built site at /
```

Build the production site:

```bash
npm run build      # writes the static site to docs/
npm run preview    # preview the production build locally
```

### API or sample data?

The frontend tries the Express API first (base URL in one place:
`API_BASE` in `src/api.js`, default same-origin `/api`, overridable with
`VITE_API_URL`). If the API is not running — which is always the case on the
static GitHub Pages demo — the dashboard falls back to the embedded sample
data in `src/data/sampleData.js` and shows an amber **"Sample data — API
offline"** badge in the topbar. The fallback is labelled honestly in the code
(`src/api.js`, `src/App.jsx`) and here; the demo never pretends to be live.

## GitHub Pages — how the live demo is laid out

The Vite build is configured for a **project site** at
`https://khushee16.github.io/analytics-dashboard/`:

- `vite.config.js` sets `base: '/analytics-dashboard/'` (so asset URLs work
  under that path) and `build.outDir: 'docs'`.
- `npm run build` therefore writes `docs/index.html` + `docs/assets/*` at the
  project root, and **that `docs/` folder is committed to the repo** alongside
  the source (`src/`, `package.json`, `vite.config.js`).
- GitHub Pages serves the site from that folder — no separate branch or
  deploy step is needed beyond pushing the repo.

**Manual step Khushi must do once (in the GitHub repo settings):**

1. Create the GitHub repo `analytics-dashboard` and push this project
   (including the `docs/` folder).
2. Repo → **Settings → Pages → Build and deployment → Source: "Deploy from
   a branch"**, Branch: `main`, Folder: **`/docs`** → Save.
3. The demo then serves at `https://khushee16.github.io/analytics-dashboard/`.

### What works on the live Pages demo vs code-only

| Feature | Live Pages demo | Locally with `npm start` (API) |
| --- | --- | --- |
| KPI cards, charts, filters, table, search/sort, CSV export | ✅ works (embedded sample data) | ✅ works (API data) |
| "Sample data — API offline" badge | ✅ shown | — (shows "Live API" instead) |
| Express API endpoints (`/api/*`) | ❌ Pages is static hosting — no Node server runs there | ✅ works on `localhost:3000` |
| `server/` code | Code-only (read it in the repo) | ✅ runs |

Rebuilding after a change: run `npm run build` again and commit the
regenerated `docs/` folder, then push.

## Data note

`public/sample-data.json` is the canonical dataset; `src/data/sampleData.js`
is a generated copy of the same file for the offline fallback. If you change
the data, regenerate the copy (or edit both) and rebuild.
