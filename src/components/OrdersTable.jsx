import { useMemo, useState } from 'react'
import { downloadCsv, money2 } from '../utils.js'

const STATUS_CLASS = {
  Delivered: 'badge bg-success',
  Shipped: 'badge bg-primary',
  Processing: 'badge bg-warning text-dark',
  Cancelled: 'badge bg-secondary',
}

export default function OrdersTable({ orders, filters }) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('date')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let rows = orders
    if (q) {
      rows = rows.filter((o) =>
        [o.id, o.customer, o.product, o.category, o.channel, o.status].some((v) => String(v).toLowerCase().includes(q)),
      )
    }
    const sorted = [...rows].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv))
      return sortDir === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [orders, search, sortKey, sortDir])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pages)
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir(key === 'total' ? 'desc' : 'asc')
    }
    setPage(1)
  }
  const sortArrow = (key) => (sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '')

  return (
    <div className="card table-card">
      <div className="card-body">
        <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
          <div>
            <h2 className="card-title h6 mb-0">Orders</h2>
            <p className="card-subtitle text-muted small mb-0">
              {filtered.length} order{filtered.length === 1 ? '' : 's'} match the current filters · sample data
            </p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <input
              className="form-control table-search"
              type="search"
              placeholder="Search order, customer, product…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              aria-label="Search orders"
            />
            <button
              className="btn btn-outline-primary btn-sm"
              type="button"
              onClick={() => downloadCsv(filtered, `shopkart-orders-${filters.range}d.csv`)}
            >
              ⬇ Export CSV ({filtered.length})
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th scope="col" aria-sort={sortKey === 'id' ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}><button className="th-btn" type="button" onClick={() => toggleSort('id')}>Order{sortArrow('id')}</button></th>
                <th scope="col" aria-sort={sortKey === 'date' ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}><button className="th-btn" type="button" onClick={() => toggleSort('date')}>Date{sortArrow('date')}</button></th>
                <th scope="col" aria-sort={sortKey === 'customer' ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}><button className="th-btn" type="button" onClick={() => toggleSort('customer')}>Customer{sortArrow('customer')}</button></th>
                <th scope="col" aria-sort={sortKey === 'product' ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}><button className="th-btn" type="button" onClick={() => toggleSort('product')}>Product{sortArrow('product')}</button></th>
                <th scope="col">Category</th>
                <th scope="col">Channel</th>
                <th scope="col" aria-sort={sortKey === 'total' ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}><button className="th-btn" type="button" onClick={() => toggleSort('total')}>Total{sortArrow('total')}</button></th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((o) => (
                <tr key={o.id}>
                  <td className="fw-semibold">{o.id}</td>
                  <td>{o.date}</td>
                  <td>{o.customer}</td>
                  <td>{o.product}</td>
                  <td>{o.category}</td>
                  <td>{o.channel}</td>
                  <td className="fw-semibold">{money2(o.total)}</td>
                  <td><span className={STATUS_CLASS[o.status] || 'badge bg-secondary'}>{o.status}</span></td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-4">
                    No orders match these filters. Try a wider date range or a different search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <span className="text-muted small">
            Page {safePage} of {pages}
          </span>
          <div className="btn-group btn-group-sm">
            <button className="btn btn-outline-secondary" type="button" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>
              ← Previous
            </button>
            <button className="btn btn-outline-secondary" type="button" disabled={safePage >= pages} onClick={() => setPage(safePage + 1)}>
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
