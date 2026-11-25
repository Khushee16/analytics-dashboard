// ShopKart Analytics API — Node.js / Express.
// No database: every endpoint reads the fictional sample data in
// ../public/sample-data.json (216 sample orders, 30 days, Oct 26 – Nov 24 2026).
// ShopKart is a fictional demo store; there is no real client or real data.
const express = require('express')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3000
const DATA_PATH = path.join(__dirname, '..', 'public', 'sample-data.json')

function loadData() {
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'))
}

function parseFilters(req) {
  const range = Math.min(Math.max(parseInt(req.query.range, 10) || 30, 1), 30)
  return {
    range,
    category: req.query.category || 'All',
    channel: req.query.channel || 'All',
  }
}

function maxDate(orders) {
  return orders.reduce((m, o) => (o.date > m ? o.date : m), orders[0].date)
}

function filterOrders(orders, { range, category, channel }) {
  const end = new Date(`${maxDate(orders)}T00:00:00`)
  const start = new Date(end)
  start.setDate(end.getDate() - (range - 1))
  return orders.filter((o) => {
    const d = new Date(`${o.date}T00:00:00`)
    return (
      d >= start &&
      d <= end &&
      (category === 'All' || o.category === category) &&
      (channel === 'All' || o.channel === channel)
    )
  })
}

function groupBy(list, key) {
  const map = new Map()
  for (const o of list) {
    const row = map.get(o[key]) || { name: o[key], revenue: 0, orders: 0 }
    row.revenue = Math.round((row.revenue + o.total) * 100) / 100
    row.orders += 1
    map.set(o[key], row)
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue)
}

function dailySeries(orders, visitorsDaily, range) {
  const end = new Date(`${maxDate(orders)}T00:00:00`)
  const start = new Date(end)
  start.setDate(end.getDate() - (range - 1))
  const days = []
  for (let i = 0; i < range; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push(d.toISOString().slice(0, 10))
  }
  const byDay = Object.fromEntries(days.map((d) => [d, { revenue: 0, orders: 0 }]))
  for (const o of orders) {
    if (byDay[o.date]) {
      byDay[o.date].revenue = Math.round((byDay[o.date].revenue + o.total) * 100) / 100
      byDay[o.date].orders += 1
    }
  }
  return days.map((d) => ({ date: d, ...byDay[d] }))
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'analytics-dashboard-api', sampleData: true })
})

app.get('/api/kpis', (req, res) => {
  const data = loadData()
  const filters = parseFilters(req)
  const orders = filterOrders(data.orders, filters)
  const dates = new Set(orders.map((o) => o.date))
  const visitors = data.visitorsDaily.filter((v) => dates.has(v.date)).reduce((s, v) => s + v.visitors, 0)
  const revenue = Math.round(orders.reduce((s, o) => s + o.total, 0) * 100) / 100
  res.json({
    revenue,
    orders: orders.length,
    visitors,
    conversion: visitors ? Math.round((orders.length / visitors) * 10000) / 100 : 0,
    avgOrderValue: orders.length ? Math.round((revenue / orders.length) * 100) / 100 : 0,
    filters,
  })
})

app.get('/api/sales', (req, res) => {
  const data = loadData()
  const filters = parseFilters(req)
  const orders = filterOrders(data.orders, filters)
  res.json({
    filters,
    daily: dailySeries(orders, data.visitorsDaily, filters.range),
    byCategory: groupBy(orders, 'category'),
    byChannel: groupBy(orders, 'channel'),
  })
})

app.get('/api/orders', (req, res) => {
  const data = loadData()
  const filters = parseFilters(req)
  const orders = filterOrders(data.orders, filters)
  const q = (req.query.q || '').toLowerCase()
  const rows = q
    ? orders.filter((o) =>
        [o.id, o.customer, o.product, o.category, o.channel, o.status].some((v) => String(v).toLowerCase().includes(q)),
      )
    : orders
  res.json({ filters, count: rows.length, orders: rows, visitorsDaily: data.visitorsDaily, meta: data.meta })
})

// Optional: serve the built frontend (docs/) from the API server too,
// so `npm start` + http://localhost:3000 shows the dashboard with live API data.
const docsDir = path.join(__dirname, '..', 'docs')
if (fs.existsSync(path.join(docsDir, 'index.html'))) {
  app.use(express.static(docsDir))
  app.get('/', (req, res) => res.sendFile(path.join(docsDir, 'index.html')))
}

app.listen(PORT, () => {
  console.log(`ShopKart Analytics API listening on http://localhost:${PORT}`)
  console.log(`  GET /api/health  GET /api/kpis  GET /api/sales  GET /api/orders`)
})
