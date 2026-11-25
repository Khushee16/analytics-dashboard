// API client — single place where the API base URL is configured.
// Default is same-origin '/api' (works in local dev via the Vite proxy in
// vite.config.js, and when the Express server serves the built frontend).
// Override with VITE_API_URL, e.g. VITE_API_URL=http://localhost:3000/api
// npm run dev
//
// HONEST FALLBACK: on the static GitHub Pages demo there is no Node server,
// so every /api request fails/404s. App.jsx catches that and falls back to
// the embedded sample data in src/data/sampleData.js, and shows a
// "Sample data — API offline" badge so the demo never pretends to be live.
export const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function get(path) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`API ${res.status} on ${path}`)
  return res.json()
}

export const api = {
  health: () => get('/health'),
  kpis: (params = {}) => get(`/kpis${toQuery(params)}`),
  sales: (params = {}) => get(`/sales${toQuery(params)}`),
  orders: (params = {}) => get(`/orders${toQuery(params)}`),
}

function toQuery(params) {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '' && v !== 'All') q.set(k, v)
  }
  const s = q.toString()
  return s ? `?${s}` : ''
}
