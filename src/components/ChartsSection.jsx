import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { money } from '../utils.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

const palette = ['#4f46e5', '#06b6d4', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6']

export default function ChartsSection({ daily, byCategory, byChannel }) {
  const labels = daily.map((d) => d.date.slice(5))
  const lineData = {
    labels,
    datasets: [
      {
        label: 'Revenue ($)',
        data: daily.map((d) => d.revenue),
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.12)',
        fill: true,
        tension: 0.35,
        pointRadius: 2,
      },
    ],
  }
  const barData = {
    labels: byCategory.map((c) => c.name),
    datasets: [
      {
        label: 'Revenue ($)',
        data: byCategory.map((c) => Math.round(c.revenue)),
        backgroundColor: palette,
        borderRadius: 6,
      },
    ],
  }
  const doughnutData = {
    labels: byChannel.map((c) => c.name),
    datasets: [
      {
        label: 'Revenue ($)',
        data: byChannel.map((c) => Math.round(c.revenue)),
        backgroundColor: palette,
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  }
  const moneyTicks = { ticks: { callback: (v) => `$${Number(v).toLocaleString()}` } }
  return (
    <div className="row g-3">
      <div className="col-12 col-xl-8">
        <div className="card chart-card h-100">
          <div className="card-body">
            <h2 className="card-title h6">Revenue over time</h2>
            <p className="card-subtitle text-muted small">Daily revenue in the selected period (sample data)</p>
            <div className="chart-wrap">
              <Line
                data={lineData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${money(c.parsed.y)}` } } },
                  scales: { y: moneyTicks },
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="col-12 col-md-6 col-xl-4">
        <div className="card chart-card h-100">
          <div className="card-body">
            <h2 className="card-title h6">Revenue by channel</h2>
            <p className="card-subtitle text-muted small">Share of revenue by sales channel</p>
            <div className="chart-wrap">
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: '62%',
                  plugins: { legend: { position: 'bottom' }, tooltip: { callbacks: { label: (c) => ` ${c.label}: ${money(c.parsed)}` } } },
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="col-12">
        <div className="card chart-card">
          <div className="card-body">
            <h2 className="card-title h6">Revenue by category</h2>
            <p className="card-subtitle text-muted small">Which product categories bring in the most revenue</p>
            <div className="chart-wrap chart-wrap-short">
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${money(c.parsed.y)}` } } },
                  scales: { y: moneyTicks },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
