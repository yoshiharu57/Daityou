import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { projectsApi } from '../api'
import { differenceInDays, parseISO, format } from 'date-fns'

function daysRemaining(endDate) {
  if (!endDate) return null
  return differenceInDays(parseISO(endDate), new Date())
}

function ProgressBar({ value }) {
  const color = value >= 100 ? 'bg-success' : value >= 60 ? 'bg-primary' : value >= 30 ? 'bg-warning' : 'bg-danger'
  return (
    <div className="d-flex align-items-center gap-2">
      <div className="progress flex-grow-1" style={{ height: 8 }}>
        <div className={`progress-bar ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <span className="small fw-bold" style={{ minWidth: 32 }}>{value}%</span>
    </div>
  )
}

export default function ProjectListPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [engineerFilter, setEngineerFilter] = useState('')
  const [sortKey, setSortKey] = useState('end_date')
  const [sortAsc, setSortAsc] = useState(true)

  const load = () => {
    setLoading(true)
    projectsApi.list({ search, status: statusFilter }).then(r => {
      setProjects(r.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [search, statusFilter])

  const types = [...new Set(projects.map(p => p.project_type).filter(Boolean))]
  const engineers = [...new Set([
    ...projects.map(p => p.person_in_charge),
    ...projects.map(p => p.chief_engineer),
    ...projects.map(p => p.review_engineer),
  ].filter(Boolean))]

  const filtered = projects
    .filter(p => !typeFilter || p.project_type === typeFilter)
    .filter(p => !engineerFilter || [p.person_in_charge, p.chief_engineer, p.review_engineer].includes(engineerFilter))
    .sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey]
      if (va == null) return 1
      if (vb == null) return -1
      if (typeof va === 'string') va = va.toLowerCase()
      if (typeof vb === 'string') vb = vb.toLowerCase()
      return sortAsc ? (va < vb ? -1 : 1) : (va > vb ? -1 : 1)
    })

  const handleSort = (key) => {
    if (sortKey === key) setSortAsc(a => !a)
    else { setSortKey(key); setSortAsc(true) }
  }

  const SortTh = ({ label, k, style }) => (
    <th style={style} onClick={() => handleSort(k)} className="cursor-pointer user-select-none" role="button">
      {label} {sortKey === k ? (sortAsc ? '▲' : '▼') : ''}
    </th>
  )

  const exportCsv = () => {
    const headers = ['業務No.', '案件名', '発注機関', '担当者', '契約日', '工期開始', '工期終了', '担当', '主任技術者', '照査技術者', '進捗率', 'ステータス', '受注金額']
    const rows = filtered.map(p => [
      p.business_number, p.project_name, p.client_organization, p.client_contact,
      p.contract_date, p.start_date, p.end_date,
      p.person_in_charge, p.chief_engineer, p.review_engineer,
      p.progress_rate + '%', p.status,
      p.contract_amount ? p.contract_amount.toLocaleString() : 0
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v ?? ''}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = '案件一覧.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container-fluid py-4 px-3 px-md-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0"><i className="bi bi-table me-2 text-primary"></i>案件一覧</h4>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={exportCsv}>
            <i className="bi bi-download me-1"></i>CSV出力
          </button>
          <Link to="/projects/new" className="btn btn-success btn-sm">
            <i className="bi bi-plus-circle me-1"></i>案件登録
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-2">
          <div className="row g-2">
            <div className="col-12 col-md-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input className="form-control" placeholder="案件名・No.・発注機関で検索"
                  value={search} onChange={e => setSearch(e.target.value)} />
                {search && <button className="btn btn-outline-secondary" onClick={() => setSearch('')}>×</button>}
              </div>
            </div>
            <div className="col-6 col-md-2">
              <select className="form-select form-select-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">全ステータス</option>
                <option>進行中</option>
                <option>完了</option>
                <option>中断</option>
              </select>
            </div>
            <div className="col-6 col-md-2">
              <select className="form-select form-select-sm" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                <option value="">全業務種別</option>
                {types.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-6 col-md-2">
              <select className="form-select form-select-sm" value={engineerFilter} onChange={e => setEngineerFilter(e.target.value)}>
                <option value="">全担当技術者</option>
                {engineers.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div className="col-6 col-md-2 text-end text-muted small d-flex align-items-center justify-content-end">
              {filtered.length}件
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 small">
                <thead className="table-dark">
                  <tr>
                    <SortTh label="業務No." k="business_number" style={{ width: 95 }} />
                    <SortTh label="案件名" k="project_name" />
                    <th style={{ width: 120 }}>発注機関</th>
                    <th style={{ width: 85 }}>相手先担当</th>
                    <SortTh label="契約日" k="contract_date" style={{ width: 90 }} />
                    <SortTh label="工期開始" k="start_date" style={{ width: 90 }} />
                    <SortTh label="工期終了" k="end_date" style={{ width: 90 }} />
                    <th style={{ width: 65 }}>残日数</th>
                    <th style={{ width: 75 }}>担当</th>
                    <th style={{ width: 75 }}>主任</th>
                    <th style={{ width: 75 }}>照査</th>
                    <th style={{ width: 140 }}>進捗</th>
                    <th style={{ width: 85 }}>受注金額</th>
                    <th style={{ width: 75 }}>状況</th>
                    <th style={{ width: 80 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={15} className="text-center text-muted py-5">案件が見つかりません</td></tr>
                  )}
                  {filtered.map(p => {
                    const days = daysRemaining(p.end_date)
                    let rowCls = ''
                    if (p.status === '完了') rowCls = 'table-light'
                    else if (p.status === '中断') rowCls = 'table-secondary'
                    else if (days !== null && days < 0) rowCls = 'table-danger'
                    else if (days !== null && days <= 30) rowCls = 'table-warning'
                    const amount = p.contract_amount
                    const amountStr = amount >= 1e6 ? `${(amount / 1e4).toFixed(0)}万` : amount ? amount.toLocaleString() : '-'
                    return (
                      <tr key={p.id} className={rowCls}>
                        <td className="fw-bold text-primary">{p.business_number}</td>
                        <td style={{ maxWidth: 200 }}>
                          <Link to={`/projects/${p.id}`} className="text-decoration-none text-dark fw-semibold">
                            {p.project_name}
                          </Link>
                          {p.project_type && <span className="badge bg-light text-secondary ms-1">{p.project_type}</span>}
                        </td>
                        <td className="text-truncate" style={{ maxWidth: 120 }}>{p.client_organization || '-'}</td>
                        <td>{p.client_contact || '-'}</td>
                        <td>{p.contract_date ? format(parseISO(p.contract_date), 'yy/MM/dd') : '-'}</td>
                        <td>{p.start_date ? format(parseISO(p.start_date), 'yy/MM/dd') : '-'}</td>
                        <td>{p.end_date ? format(parseISO(p.end_date), 'yy/MM/dd') : '-'}</td>
                        <td className={days !== null && days < 0 ? 'text-danger fw-bold' : days !== null && days <= 30 ? 'text-warning fw-bold' : ''}>
                          {days !== null ? (days < 0 ? `${Math.abs(days)}超` : `${days}日`) : '-'}
                        </td>
                        <td>{p.person_in_charge || '-'}</td>
                        <td>{p.chief_engineer || '-'}</td>
                        <td>{p.review_engineer || '-'}</td>
                        <td><ProgressBar value={p.progress_rate || 0} /></td>
                        <td className="text-end">{amountStr}</td>
                        <td>
                          {p.status === '完了' ? <span className="badge bg-success">完了</span>
                            : p.status === '中断' ? <span className="badge bg-secondary">中断</span>
                            : days !== null && days < 0 ? <span className="badge bg-danger">超過</span>
                            : days !== null && days <= 30 ? <span className="badge bg-warning text-dark">間近</span>
                            : <span className="badge bg-primary">進行中</span>}
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Link to={`/projects/${p.id}`} className="btn btn-outline-primary btn-sm py-0 px-1">詳細</Link>
                            <Link to={`/projects/${p.id}/edit`} className="btn btn-outline-secondary btn-sm py-0 px-1">編集</Link>
                          </div>
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
}
