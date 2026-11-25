# ShopKart Analytics — API server

Node.js / Express API for the analytics dashboard. No database — it reads the
fictional sample data in `../public/sample-data.json` (216 sample orders,
30 days, 26 Oct – 24 Nov 2026). ShopKart is a fictional demo store; there is
no real client and no real data.

## Run

```bash
cd server
npm install   # only dependency: express
npm start     # listens on http://localhost:3000
```

## Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/health` | `{ status: "ok", ... }` health check |
| GET | `/api/kpis` | Revenue, orders, visitors, conversion, avg order value for the filters |
| GET | `/api/sales` | Daily revenue/orders series + revenue by category and by channel |
| GET | `/api/orders` | Filtered order rows (plus `visitorsDaily` and `meta`) |

All three data endpoints accept the same query filters:

- `range` — `7`, `14` or `30` (days; default `30`, clamped to 1–30)
- `category` — e.g. `Electronics`, `Fashion` (default `All`)
- `channel` — e.g. `Website`, `Mobile App` (default `All`)
- `/api/orders` also accepts `q` — free-text search across order, customer, product, category, channel, status

Examples:

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/kpis
curl "http://localhost:3000/api/sales?range=7&category=Electronics"
curl "http://localhost:3000/api/orders?range=14&channel=Website"
```

## Serving the built frontend

After `npm run build` in the project root, a `docs/` folder exists with the
production build. This server serves it statically, so with the API running,
`http://localhost:3000/` shows the dashboard **with live API data** (the
topbar badge reads "Live API"). Without the API, the same build falls back
to the embedded sample data and the badge reads "Sample data — API offline".
