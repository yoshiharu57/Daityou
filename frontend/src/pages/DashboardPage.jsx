import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { projectsApi } from '../api'
import { differenceInDays, parseISO, format } from 'date-fns'

function daysRemaining(endDate) {
  if (!endDate) return null
  return differenceInDays(parseISO(endDate), new Date())
}

function statusBadge(project) {
  if (project.status === '完了') return <span className="badge bg-success">完了</span>
  if (project.status === '中断') return <span className="badge bg-secondary">中断</span>
  const days = daysRemaining(project.end_date)
  if (days === null) return <span className="badge bg-primary">進行中</span>
  if (days < 0) return <span className="badge bg-danger">期限超過</span>
  if (days <= 30) return <span className="badge bg-warning text-dark">残{days}日</span>
  return <span className="badge bg-primary">進行中</span>
}

function rowClass(project) {
  if (project.status === '完了') return 'table-light'
  if (project.status === '中断') return 'table-secondary'
  const days = daysRemaining(project.end_date)
  if (days !== null && days < 0) return 'table-danger'
  if (days !== null && days <= 30) return 'table-warning'
  return ''
}

function ProgressBar({ value }) {
  const color = value >= 100 ? 'bg-success' : value >= 60 ? 'bg-primary' : value >= 30 ? 'bg-warning' : 'bg-danger'
  return (
    <div className="d-flex align-items-center gap-2">
      <div className="progress flex-grow-1" style={{ height: 10 }}>
        <div className={`progress-bar ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <span className="small fw-bold" style={{ minWidth: 34 }}>{value}%</span>
    </div>
  )
}

function StatCard({ label, value, icon, color, sub }) {
  return (
    <div className="col-6 col-md-3">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body d-flex align-items-center gap-3 py-3">
          <div className={`rounded-circle d-flex align-items-center justify-content-center text-white`}
            style={{ width: 50, height: 50, background: color, flexShrink: 0 }}>
            <i className={`bi ${icon} fs-5`}></i>
          </div>
          <div>
            <div className="fs-3 fw-bold lh-1">{value}</div>
            <div className="text-muted small">{label}</div>
            {sub && <div className="text-muted" style={{ fontSize: '0.72rem' }}>{sub}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [projects, setProjects] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('active')

  useEffect(() => {
    Promise.all([projectsApi.list(), projectsApi.stats()])
      .then(([pRes, sRes]) => {
        setProjects(pRes.data)
        setStats(sRes.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = projects.filter(p => {
    if (filter === 'active') return p.status === '進行中'
    if (filter === 'overdue') {
      const d = daysRemaining(p.end_date)
      return p.status === '進行中' && d !== null && d < 0
    }
    if (filter === 'near') {
      const d = daysRemaining(p.end_date)
      return p.status === '進行中' && d !== null && d >= 0 && d <= 30
    }
    if (filter === 'completed') return p.status === '完了'
    return true
  })

  const totalAmount = stats.total_amount || 0
  const amountStr = totalAmount >= 1e8
    ? `${(totalAmount / 1e8).toFixed(1)}億円`
    : `${(totalAmount / 1e4).toFixed(0)}万円`

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
      <div className="spinner-border text-primary" />
    </div>
  )

  return (
    <div className="container-fluid py-4 px-3 px-md-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0"><i className="bi bi-speedometer2 me-2 text-primary"></i>ダッシュボード</h4>
        <span className="text-muted small">{format(new Date(), 'yyyy年MM月dd日')} 現在</span>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <StatCard label="総案件数" value={stats.total || 0} icon="bi-folder2-open" color="#2563a8" />
        <StatCard label="進行中" value={stats.active || 0} icon="bi-play-circle-fill" color="#059669" />
        <StatCard label="期限超過" value={stats.overdue || 0} icon="bi-exclamation-triangle-fill" color="#dc2626" />
        <StatCard label="受注金額合計" value={amountStr} icon="bi-currency-yen" color="#7c3aed" sub="進行中＋完了" />
      </div>

      {/* Alert banner */}
      {stats.overdue > 0 && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4 py-2">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <strong>期限超過案件が{stats.overdue}件あります。</strong>
          <button className="btn btn-sm btn-outline-danger ms-auto" onClick={() => setFilter('overdue')}>確認する</button>
        </div>
      )}
      {stats.near_deadline > 0 && (
        <div className="alert alert-warning d-flex align-items-center gap-2 mb-4 py-2">
          <i className="bi bi-clock-fill"></i>
          <strong>30日以内に工期終了を迎える案件が{stats.near_deadline}件あります。</strong>
          <button className="btn btn-sm btn-outline-warning ms-auto" onClick={() => setFilter('near')}>確認する</button>
        </div>
      )}

      {/* Filter tabs */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2 py-2">
          <div className="btn-group btn-group-sm">
            {[
              { key: 'active', label: '進行中', count: stats.active },
              { key: 'near', label: '期限間近(30日)', count: stats.near_deadline },
              { key: 'overdue', label: '期限超過', count: stats.overdue },
              { key: 'completed', label: '完了', count: stats.completed },
              { key: 'all', label: 'すべて', count: stats.total },
            ].map(t => (
              <button
                key={t.key}
                className={`btn ${filter === t.key ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setFilter(t.key)}
              >
                {t.label} <span className="badge bg-light text-dark ms-1">{t.count || 0}</span>
              </button>
            ))}
          </div>
          <Link to="/projects/new" className="btn btn-sm btn-success">
            <i className="bi bi-plus-circle me-1"></i>案件登録
          </Link>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 small">
              <thead className="table-dark">
                <tr>
                  <th style={{ width: 90 }}>業務No.</th>
                  <th>案件名</th>
                  <th style={{ width: 120 }}>発注機関</th>
                  <th style={{ width: 90 }}>担当者</th>
                  <th style={{ width: 90 }}>工期終了</th>
                  <th style={{ width: 70 }}>残日数</th>
                  <th style={{ width: 80 }}>担当技術者</th>
                  <th style={{ width: 140 }}>進捗</th>
                  <th style={{ width: 80 }}>状況</th>
                  <th style={{ width: 60 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={10} className="text-center text-muted py-4">該当する案件がありません</td></tr>
                )}
                {filtered.map(p => {
                  const days = daysRemaining(p.end_date)
                  return (
                    <tr key={p.id} className={rowClass(p)}>
                      <td className="fw-bold text-primary">{p.business_number}</td>
                      <td>
                        <Link to={`/projects/${p.id}`} className="text-decoration-none text-dark fw-semibold">
                          {p.project_name}
                        </Link>
                      </td>
                      <td className="text-truncate" style={{ maxWidth: 120 }}>{p.client_organization}</td>
                      <td>{p.client_contact}</td>
                      <td>{p.end_date ? format(parseISO(p.end_date), 'yyyy/MM/dd') : '-'}</td>
                      <td className={days !== null && days < 0 ? 'text-danger fw-bold' : days !== null && days <= 30 ? 'text-warning fw-bold' : ''}>
                        {days !== null ? (days < 0 ? `${Math.abs(days)}日超過` : `${days}日`) : '-'}
                      </td>
                      <td>{p.person_in_charge}</td>
                      <td><ProgressBar value={p.progress_rate} /></td>
                      <td>{statusBadge(p)}</td>
                      <td>
                        <Link to={`/projects/${p.id}`} className="btn btn-outline-primary btn-sm py-0 px-2">詳細</Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
