import { useEffect, useMemo, useState } from 'react'
import { api } from './api.js'
import { sampleData } from './data/sampleData.js'
import { CATEGORIES, CHANNELS, RANGES, computeKpis, dailySeries, filterOrders, groupBy } from './utils.js'
import KpiCards from './components/KpiCards.jsx'
import ChartsSection from './components/ChartsSection.jsx'
import OrdersTable from './components/OrdersTable.jsx'

export default function App() {
  const [range, setRange] = useState('30')
  const [category, setCategory] = useState('All')
  const [channel, setChannel] = useState('All')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // Data source: 'api' when the Express server answers, otherwise the
  // embedded sample data. The badge below says which one is in use.
  const [source, setSource] = useState('sample')
  const [apiData, setApiData] = useState(null)

  const filters = { range: Number(range), category, channel }

  useEffect(() => {
    let cancelled = false
    // Try the API first; fall back silently to embedded sample data.
    api
      .health()
      .then(() => api.orders({ range: 30 }))
      .then((res) => {
        if (cancelled) return
        // The API returns { orders, visitorsDaily, ... }; keep it if it looks sane.
        if (res && Array.isArray(res.orders) && res.orders.length > 0) {
          setApiData(res)
          setSource('api')
        }
      })
      .catch(() => {
        // API not running (expected on GitHub Pages) — embedded sample data is used.
        if (!cancelled) setSource('sample')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const data = useMemo(() => {
    if (apiData) return { orders: apiData.orders, visitorsDaily: apiData.visitorsDaily || sampleData.visitorsDaily }
    return sampleData
  }, [apiData])

  const kpis = useMemo(() => computeKpis(data, filters), [data, filters])
  const daily = useMemo(() => dailySeries(data, filters), [data, filters])
  const filteredOrders = useMemo(() => filterOrders(data.orders, filters), [data, filters])
  const byCategory = useMemo(() => groupBy(filteredOrders, 'category'), [filteredOrders])
  const byChannel = useMemo(() => groupBy(filteredOrders, 'channel'), [filteredOrders])

  const nav = ['Overview', 'Orders', 'Products', 'Customers', 'Reports', 'Settings']
  const [activeNav, setActiveNav] = useState('Overview')

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-mark">SK</span>
          <span>
            <strong>ShopKart</strong>
            <small>Analytics</small>
          </span>
        </div>
        <nav className="sidebar-nav" aria-label="Dashboard sections">
          {nav.map((item) => (
            <button
              key={item}
              type="button"
              className={`nav-item ${activeNav === item ? 'active' : ''}`}
              onClick={() => {
                setActiveNav(item)
                setSidebarOpen(false)
              }}
            >
              {item}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <p className="small mb-1">Demo dashboard</p>
          <p className="text-muted small mb-0">Fictional store · sample data only. Not a real business.</p>
        </div>
      </aside>
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      <div className="main">
        <header className="topbar">
          <button className="btn btn-outline-secondary btn-sm menu-btn" type="button" onClick={() => setSidebarOpen((v) => !v)} aria-label="Toggle menu">
            ☰
          </button>
          <div>
            <h1 className="h5 mb-0">Overview</h1>
            <p className="text-muted small mb-0">ShopKart — fictional online store · 26 Oct – 24 Nov 2026</p>
          </div>
          <span className={`ms-auto badge ${source === 'api' ? 'bg-success' : 'bg-warning text-dark'}`} title={source === 'api' ? 'Data is coming from the Express API on this machine.' : 'The Express API is not running, so the dashboard is using the embedded sample data.'}>
            {source === 'api' ? '● Live API' : '● Sample data — API offline'}
          </span>
        </header>

        <main className="content">
          <section className="filters card mb-3" aria-label="Filters">
            <div className="card-body d-flex flex-wrap gap-3 align-items-end">
              <div>
                <label className="form-label" htmlFor="range">Date range</label>
                <select id="range" className="form-select" value={range} onChange={(e) => setRange(e.target.value)}>
                  {RANGES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label" htmlFor="category">Category</label>
                <select id="category" className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label" htmlFor="channel">Channel</label>
                <select id="channel" className="form-select" value={channel} onChange={(e) => setChannel(e.target.value)}>
                  {CHANNELS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => {
                  setRange('30')
                  setCategory('All')
                  setChannel('All')
                }}
              >
                Reset filters
              </button>
              <p className="text-muted small mb-0 ms-auto">
                Showing {filteredOrders.length} orders · {source === 'api' ? 'served by the Express API' : 'embedded sample data (API offline)'}
              </p>
            </div>
          </section>

          <KpiCards kpis={kpis} />

          <div className="mt-3">
            <ChartsSection daily={daily} byCategory={byCategory} byChannel={byChannel} />
          </div>

          <div className="mt-3">
            <OrdersTable orders={filteredOrders} filters={filters} />
          </div>

          <footer className="text-center text-muted small py-4">
            ShopKart Analytics — self-directed portfolio demo by Khushi Khatri. All data is fictional sample data;
            ShopKart is not a real store and there is no real client. Built with React, Vite, Chart.js, Bootstrap
            and Node.js/Express.
          </footer>
        </main>
      </div>
    </div>
  )
}
