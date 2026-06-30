import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { analyticsApi } from '../api'
import { differenceInDays, parseISO, format } from 'date-fns'

const ROLE_COLOR = { '担当': 'primary', '主任技術者': 'success', '照査技術者': 'warning' }

function WorkloadBar({ count }) {
  const max = 8
  const pct = Math.min((count / max) * 100, 100)
  const color = count >= 6 ? 'bg-danger' : count >= 4 ? 'bg-warning' : 'bg-success'
  return (
    <div className="d-flex align-items-center gap-2">
      <div className="progress flex-grow-1" style={{ height: 18 }}>
        <div className={`progress-bar ${color} fw-bold`} style={{ width: `${pct}%`, fontSize: '0.75rem' }}>
          {count >= 2 ? `${count}件` : ''}
        </div>
      </div>
      <span className="small fw-bold" style={{ minWidth: 28 }}>{count}件</span>
    </div>
  )
}

export default function EngineerPage() {
  const [workload, setWorkload] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({})

  useEffect(() => {
    analyticsApi.engineerWorkload()
      .then(r => setWorkload(r.data.sort((a, b) => b.count - a.count)))
      .finally(() => setLoading(false))
  }, [])

  const toggle = (name) => setExpanded(e => ({ ...e, [name]: !e[name] }))

  const totalActive = workload.reduce((s, e) => s + e.count, 0)
  const mostBusy = workload[0]

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>

  return (
    <div className="container-fluid py-4 px-3 px-md-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0"><i className="bi bi-people me-2 text-primary"></i>担当技術者 稼働状況</h4>
        <span className="text-muted small">進行中案件のみ表示</span>
      </div>

      {/* Summary cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body py-3">
              <div className="text-muted small">関与技術者数</div>
              <div className="fs-2 fw-bold text-primary">{workload.length}<span className="fs-6 ms-1 text-muted">名</span></div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body py-3">
              <div className="text-muted small">案件関与延べ件数</div>
              <div className="fs-2 fw-bold text-success">{totalActive}<span className="fs-6 ms-1 text-muted">件</span></div>
              <div style={{ fontSize: '0.72rem', color: '#888' }}>（担当・主任・照査の合計）</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body py-3">
              <div className="text-muted small">最多担当者</div>
              <div className="fs-5 fw-bold text-warning">{mostBusy?.name || '-'}</div>
              <div style={{ fontSize: '0.8rem', color: '#888' }}>{mostBusy?.count}件関与</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body py-3">
              <div className="text-muted small">平均関与件数</div>
              <div className="fs-2 fw-bold text-info">
                {workload.length > 0 ? (totalActive / workload.length).toFixed(1) : 0}
                <span className="fs-6 ms-1 text-muted">件/人</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {workload.length === 0 ? (
        <div className="text-center text-muted py-5">
          <i className="bi bi-people fs-1 d-block mb-2"></i>進行中案件がありません
        </div>
      ) : (
        <div className="row g-3">
          {workload.map(eng => {
            const avgProgress = eng.count > 0 ? Math.round(eng.total_progress / eng.count) : 0
            const overdue = eng.projects.filter(p => p.end_date && differenceInDays(parseISO(p.end_date), new Date()) < 0)
            const isOpen = expanded[eng.name]
            return (
              <div className="col-12 col-lg-6" key={eng.name}>
                <div className={`card border-0 shadow-sm ${eng.count >= 6 ? 'border-danger' : eng.count >= 4 ? 'border-warning' : ''}`}
                  style={{ borderLeft: `4px solid ${eng.count >= 6 ? '#dc2626' : eng.count >= 4 ? '#f59e0b' : '#059669'}` }}>
                  <div className="card-body pb-2">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 className="fw-bold mb-0">{eng.name}</h6>
                        <div className="small text-muted">{eng.count}件関与 / 平均進捗 {avgProgress}%</div>
                      </div>
                      <div className="d-flex gap-1 align-items-center">
                        {overdue.length > 0 && (
                          <span className="badge bg-danger">{overdue.length}件超過</span>
                        )}
                        {eng.count >= 6 && <span className="badge bg-danger">高負荷</span>}
                        {eng.count >= 4 && eng.count < 6 && <span className="badge bg-warning text-dark">やや多</span>}
                        {eng.count < 4 && <span className="badge bg-success">余裕あり</span>}
                      </div>
                    </div>

                    <WorkloadBar count={eng.count} />

                    <div className="mt-2 mb-1">
                      <div className="d-flex justify-content-between small text-muted mb-1">
                        <span>案件進捗 平均</span><span>{avgProgress}%</span>
                      </div>
                      <div className="progress" style={{ height: 8 }}>
                        <div className={`progress-bar ${avgProgress >= 70 ? 'bg-success' : 'bg-primary'}`} style={{ width: `${avgProgress}%` }} />
                      </div>
                    </div>

                    <button className="btn btn-sm btn-link text-decoration-none p-0 mt-1"
                      onClick={() => toggle(eng.name)}>
                      <i className={`bi bi-chevron-${isOpen ? 'up' : 'down'} me-1`}></i>
                      案件一覧 ({eng.count}件)
                    </button>

                    {isOpen && (
                      <div className="mt-2">
                        <table className="table table-sm mb-0 small">
                          <thead className="table-light">
                            <tr>
                              <th>業務No.</th>
                              <th>案件名</th>
                              <th style={{ width: 70 }}>役割</th>
                              <th style={{ width: 60 }}>進捗</th>
                              <th style={{ width: 75 }}>工期終了</th>
                            </tr>
                          </thead>
                          <tbody>
                            {eng.projects.map(p => {
                              const days = p.end_date ? differenceInDays(parseISO(p.end_date), new Date()) : null
                              return (
                                <tr key={`${p.id}-${p.role}`} className={days !== null && days < 0 ? 'table-danger' : days !== null && days <= 30 ? 'table-warning' : ''}>
                                  <td className="text-primary fw-bold">
                                    <Link to={`/projects/${p.id}`} className="text-primary">{p.business_number}</Link>
                                  </td>
                                  <td className="text-truncate" style={{ maxWidth: 150 }}>
                                    <Link to={`/projects/${p.id}`} className="text-decoration-none text-dark">{p.project_name}</Link>
                                  </td>
                                  <td>
                                    <span className={`badge bg-${ROLE_COLOR[p.role] || 'secondary'} text-white`} style={{ fontSize: '0.65rem' }}>
                                      {p.role}
                                    </span>
                                  </td>
                                  <td>
                                    <div className="d-flex align-items-center gap-1">
                                      <div className="progress flex-grow-1" style={{ height: 6 }}>
                                        <div className="progress-bar bg-primary" style={{ width: `${p.progress_rate}%` }} />
                                      </div>
                                      <span style={{ minWidth: 28, fontSize: '0.7rem' }}>{p.progress_rate}%</span>
                                    </div>
                                  </td>
                                  <td className={days !== null && days < 0 ? 'text-danger fw-bold' : ''}>
                                    {p.end_date ? format(parseISO(p.end_date), 'yy/MM/dd') : '-'}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
