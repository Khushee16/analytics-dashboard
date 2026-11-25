import { money, num, pct } from '../utils.js'

function Delta({ value, suffix = '' }) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return <span className="delta delta-flat">— vs prev. period</span>
  }
  const up = value >= 0
  return (
    <span className={`delta ${up ? 'delta-up' : 'delta-down'}`}>
      {up ? '▲' : '▼'} {Math.abs(value).toFixed(1)}%{suffix} vs prev. period
    </span>
  )
}

export default function KpiCards({ kpis }) {
  const cards = [
    { label: 'Total revenue', value: money(kpis.revenue), delta: <Delta value={kpis.revenueDelta} />, icon: '＄', tone: 'tone-green' },
    { label: 'Orders', value: num(kpis.orders), delta: <Delta value={kpis.ordersDelta} />, icon: '▦', tone: 'tone-blue' },
    { label: 'Visitors', value: num(kpis.visitors), delta: <Delta value={kpis.visitorsDelta} />, icon: '◉', tone: 'tone-purple' },
    { label: 'Conversion rate', value: pct(kpis.conversion), delta: <Delta value={kpis.conversionDelta} suffix=" pts" />, icon: '↗', tone: 'tone-amber' },
  ]
  return (
    <div className="row g-3">
      {cards.map((c) => (
        <div className="col-6 col-xl-3" key={c.label}>
          <div className="card kpi-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <span className="kpi-label">{c.label}</span>
                <span className={`kpi-icon ${c.tone}`}>{c.icon}</span>
              </div>
              <div className="kpi-value">{c.value}</div>
              {c.delta}
            </div>
          </div>
        </div>
      ))}
      <div className="col-12">
        <p className="text-muted small mb-0">
          Average order value: <strong>{money(kpis.avgOrderValue)}</strong> in the selected period. All figures are
          fictional sample data.
        </p>
      </div>
    </div>
  )
}
