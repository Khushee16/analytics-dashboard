// Pure helpers shared by the API fallback path and the table.
// All figures come from the fictional sample data — nothing here is real.
export const CATEGORIES = ['All', 'Electronics', 'Home & Kitchen', 'Fashion', 'Beauty', 'Sports']
export const CHANNELS = ['All', 'Website', 'Mobile App', 'Instagram Shop', 'Marketplace']
export const RANGES = [
  { value: '7', label: 'Last 7 days' },
  { value: '14', label: 'Last 14 days' },
  { value: '30', label: 'Last 30 days' },
]

export function money(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}
export function money2(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}
export function num(n) {
  return new Intl.NumberFormat('en-US').format(n)
}
export function pct(n) {
  return `${n.toFixed(1)}%`
}

// Dates in the sample set run 2026-10-26 .. 2026-11-24.
export function maxDate(orders) {
  return orders.reduce((m, o) => (o.date > m ? o.date : m), orders[0]?.date || '2026-11-24')
}

function inRange(dateStr, endStr, days) {
  const end = new Date(`${endStr}T00:00:00`)
  const start = new Date(end)
  start.setDate(end.getDate() - (days - 1))
  const d = new Date(`${dateStr}T00:00:00`)
  return d >= start && d <= end
}

export function filterOrders(orders, { range = 30, category = 'All', channel = 'All' } = {}) {
  const end = maxDate(orders)
  return orders.filter(
    (o) =>
      inRange(o.date, end, range) &&
      (category === 'All' || o.category === category) &&
      (channel === 'All' || o.channel === channel),
  )
}

function sumTotals(list) {
  return list.reduce((s, o) => s + o.total, 0)
}

// KPIs for a filtered slice, with a delta vs the previous equal-length window.
export function computeKpis(data, filters) {
  const { orders, visitorsDaily } = data
  const range = Number(filters.range || 30)
  const end = maxDate(orders)
  const current = filterOrders(orders, { ...filters, range })
  // Previous window: the `range` days immediately before the current window.
  const prevEnd = new Date(`${end}T00:00:00`)
  prevEnd.setDate(prevEnd.getDate() - range)
  const prevEndStr = prevEnd.toISOString().slice(0, 10)
  const prev = orders.filter(
    (o) =>
      inRange(o.date, prevEndStr, range) &&
      (filters.category === 'All' || o.category === filters.category) &&
      (filters.channel === 'All' || o.channel === filters.channel),
  )
  const visitorsFor = (list) => {
    const dates = new Set(list.map((o) => o.date))
    return visitorsDaily.filter((v) => dates.has(v.date)).reduce((s, v) => s + v.visitors, 0)
  }
  const curVisitors = visitorsFor(current)
  const prevVisitors = visitorsFor(prev)
  const curRevenue = sumTotals(current)
  const prevRevenue = sumTotals(prev)
  const curOrders = current.length
  const prevOrders = prev.length
  const conv = curVisitors ? (curOrders / curVisitors) * 100 : 0
  const prevConv = prevVisitors ? (prevOrders / prevVisitors) * 100 : 0
  const delta = (cur, prev) => (prev ? ((cur - prev) / prev) * 100 : null)
  return {
    revenue: curRevenue,
    revenueDelta: delta(curRevenue, prevRevenue),
    orders: curOrders,
    ordersDelta: delta(curOrders, prevOrders),
    visitors: curVisitors,
    visitorsDelta: delta(curVisitors, prevVisitors),
    conversion: conv,
    conversionDelta: prevConv ? conv - prevConv : null,
    avgOrderValue: curOrders ? curRevenue / curOrders : 0,
  }
}

// Daily revenue/orders series for the line + bar charts.
export function dailySeries(data, filters) {
  const range = Number(filters.range || 30)
  const end = maxDate(data.orders)
  const start = new Date(`${end}T00:00:00`)
  start.setDate(start.getDate() - (range - 1))
  const days = []
  for (let i = 0; i < range; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push(d.toISOString().slice(0, 10))
  }
  const filtered = filterOrders(data.orders, { ...filters, range })
  const byDay = Object.fromEntries(days.map((d) => [d, { revenue: 0, orders: 0 }]))
  for (const o of filtered) {
    if (byDay[o.date]) {
      byDay[o.date].revenue += o.total
      byDay[o.date].orders += 1
    }
  }
  return days.map((d) => ({ date: d, revenue: Math.round(byDay[d].revenue * 100) / 100, orders: byDay[d].orders }))
}

export function groupBy(list, key) {
  const map = new Map()
  for (const o of list) {
    const k = o[key]
    const row = map.get(k) || { name: k, revenue: 0, orders: 0 }
    row.revenue += o.total
    row.orders += 1
    map.set(k, row)
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue)
}

export function toCsv(rows) {
  const header = ['Order', 'Date', 'Customer', 'Product', 'Category', 'Channel', 'Items', 'Total (USD)', 'Status']
  const esc = (v) => `"${String(v).replaceAll('"', '""')}"`
  const lines = [header.map(esc).join(',')]
  for (const o of rows) {
    lines.push([o.id, o.date, o.customer, o.product, o.category, o.channel, o.items, o.total.toFixed(2), o.status].map(esc).join(','))
  }
  return lines.join('\n')
}

export function downloadCsv(rows, filename) {
  const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
