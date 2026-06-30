import React, { useEffect, useState } from 'react'
import { analyticsApi } from '../api'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, Title, Tooltip, Legend,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend)

const PALETTE = ['#2563a8', '#059669', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2', '#be185d', '#84cc16', '#ea580c', '#6366f1']

function fmt(n) {
  if (!n) return '¥0'
  if (n >= 1e8) return `¥${(n / 1e8).toFixed(1)}億`
  return `¥${(n / 1e4).toFixed(0)}万`
}

export default function ReportPage() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [monthly, setMonthly] = useState(null)
  const [typeData, setTypeData] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    Promise.all([analyticsApi.monthlyRevenue(year), analyticsApi.typeBreakdown()])
      .then(([mR, tR]) => { setMonthly(mR.data); setTypeData(tR.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [year])

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>

  const months = monthly?.months || []
  const totalAmount = months.reduce((s, m) => s + m.amount, 0)
  const totalCount = months.reduce((s, m) => s + m.count, 0)
  const peakMonth = months.reduce((best, m) => m.amount > best.amount ? m : best, months[0])
  const cumulative = months.reduce((acc, m) => {
    acc.push((acc[acc.length - 1] || 0) + m.amount)
    return acc
  }, [])

  const barData = {
    labels: months.map(m => m.label),
    datasets: [{
      label: '受注金額（万円）',
      data: months.map(m => Math.round(m.amount / 10000)),
      backgroundColor: months.map((m, i) => {
        if (m.month === peakMonth?.month) return '#f59e0b'
        return 'rgba(37, 99, 168, 0.7)'
      }),
      borderRadius: 4,
    }],
  }

  const lineData = {
    labels: months.map(m => m.label),
    datasets: [{
      label: '累計受注金額（万円）',
      data: cumulative.map(v => Math.round(v / 10000)),
      borderColor: '#059669',
      backgroundColor: 'rgba(5, 150, 105, 0.1)',
      fill: true,
      tension: 0.3,
      pointRadius: 4,
    }],
  }

  const doughnutData = {
    labels: typeData.map(t => t.type),
    datasets: [{
      data: typeData.map(t => t.amount),
      backgroundColor: PALETTE.slice(0, typeData.length),
      borderWidth: 2,
    }],
  }

  const countDoughnutData = {
    labels: typeData.map(t => t.type),
    datasets: [{
      data: typeData.map(t => t.count),
      backgroundColor: PALETTE.slice(0, typeData.length),
      borderWidth: 2,
    }],
  }

  const chartOpts = (title) => ({
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: title, font: { size: 13 } },
      tooltip: { callbacks: { label: (ctx) => `${(ctx.raw * 10000).toLocaleString()}円` } },
    },
    scales: { y: { beginAtZero: true } },
  })

  const doughnutOpts = (title) => ({
    responsive: true,
    plugins: {
      legend: { position: 'right', labels: { font: { size: 11 } } },
      title: { display: true, text: title, font: { size: 13 } },
      tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${fmt(ctx.raw)} (${ctx.dataset.label === 'count' ? ctx.raw + '件' : fmt(ctx.raw)})` } },
    },
  })

  return (
    <div className="container-fluid py-4 px-3 px-md-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0"><i className="bi bi-bar-chart me-2 text-primary"></i>売上・受注分析</h4>
        <div className="d-flex align-items-center gap-2">
          <label className="form-label mb-0 small fw-semibold">年度:</label>
          <select className="form-select form-select-sm" style={{ width: 100 }}
            value={year} onChange={e => setYear(Number(e.target.value))}>
            {[currentYear - 1, currentYear, currentYear + 1].map(y => (
              <option key={y} value={y}>{y}年</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body py-3">
              <div className="text-muted small">{year}年 総受注金額</div>
              <div className="fs-3 fw-bold text-primary">{fmt(totalAmount)}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body py-3">
              <div className="text-muted small">{year}年 受注件数</div>
              <div className="fs-3 fw-bold text-success">{totalCount}<span className="fs-6 ms-1 text-muted">件</span></div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body py-3">
              <div className="text-muted small">月平均受注額</div>
              <div className="fs-3 fw-bold text-warning">{fmt(totalAmount / 12)}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body py-3">
              <div className="text-muted small">最高月</div>
              <div className="fs-3 fw-bold text-danger">{peakMonth?.label || '-'}</div>
              <div className="small text-muted">{fmt(peakMonth?.amount)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <Bar data={barData} options={chartOpts(`${year}年 月別受注金額`)} />
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <Line data={lineData} options={{
                ...chartOpts(`${year}年 累計受注金額`),
                plugins: {
                  ...chartOpts(`${year}年 累計受注金額`).plugins,
                  legend: { display: true, position: 'top' },
                },
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <Doughnut data={doughnutData} options={doughnutOpts('業務種別 受注金額構成')} />
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <Doughnut data={countDoughnutData} options={doughnutOpts('業務種別 件数構成')} />
            </div>
          </div>
        </div>
      </div>

      {/* Type breakdown table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white fw-bold border-bottom">
          <i className="bi bi-table me-2 text-primary"></i>業務種別 明細
        </div>
        <div className="card-body p-0">
          <table className="table table-sm mb-0 small">
            <thead className="table-dark">
              <tr>
                <th>業務種別</th>
                <th className="text-end">件数</th>
                <th className="text-end">受注金額合計</th>
                <th className="text-end">構成比</th>
                <th style={{ width: 200 }}>構成比バー</th>
              </tr>
            </thead>
            <tbody>
              {typeData.map((t, i) => (
                <tr key={t.type}>
                  <td>
                    <span className="d-inline-block rounded-circle me-2" style={{ width: 10, height: 10, background: PALETTE[i] }}></span>
                    {t.type}
                  </td>
                  <td className="text-end">{t.count}件</td>
                  <td className="text-end fw-bold">{fmt(t.amount)}</td>
                  <td className="text-end">
                    {totalAmount > 0 ? `${((t.amount / totalAmount) * 100).toFixed(1)}%` : '0%'}
                  </td>
                  <td>
                    <div className="progress" style={{ height: 10 }}>
                      <div className="progress-bar" style={{ width: `${totalAmount > 0 ? (t.amount / totalAmount) * 100 : 0}%`, background: PALETTE[i] }} />
                    </div>
                  </td>
                </tr>
              ))}
              <tr className="table-light fw-bold">
                <td>合計</td>
                <td className="text-end">{typeData.reduce((s, t) => s + t.count, 0)}件</td>
                <td className="text-end">{fmt(typeData.reduce((s, t) => s + t.amount, 0))}</td>
                <td className="text-end">100%</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
