import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { bridgeApi, HEALTH_LABELS, formatDate, formatDateFull, googleMapsUrl } from '../api'

export default function BridgeListPage() {
  const [bridges, setBridges] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const load = useCallback(async (q) => {
    setLoading(true)
    try {
      const res = await bridgeApi.list(q || undefined)
      setBridges(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleSearch = (e) => {
    e.preventDefault()
    load(search)
  }

  const healthCounts = bridges.reduce((acc, b) => {
    const r = b.last_health_rating || '未判定'
    acc[r] = (acc[r] || 0) + 1
    return acc
  }, {})

  return (
    <div>
      <div className="page-header">
        <div className="container-fluid px-4">
          <h4 className="mb-0 d-flex align-items-center gap-2">
            <i className="bi bi-building-fill-gear"></i>
            橋梁台帳一覧
          </h4>
          <div className="text-white-50 mt-1" style={{ fontSize: '0.85rem' }}>
            管理橋梁数: <strong className="text-white">{bridges.length}</strong> 件
          </div>
        </div>
      </div>

      <div className="container-fluid px-4">
        {/* 統計カード */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="stat-card" style={{ background: 'linear-gradient(135deg,#1a4f8a,#2563aa)' }}>
              <i className="bi bi-columns-gap stat-icon"></i>
              <div>
                <div className="stat-value">{bridges.length}</div>
                <div className="stat-label">管理橋梁数</div>
              </div>
            </div>
          </div>
          {[
            { key: 'I', label: '健全 (I)', bg: 'linear-gradient(135deg,#198754,#28a745)' },
            { key: 'II', label: '予防保全 (II)', bg: 'linear-gradient(135deg,#0891b2,#0dcaf0)' },
            { key: 'III', label: '早期措置 (III)', bg: 'linear-gradient(135deg,#d97706,#ffc107)' },
            { key: 'IV', label: '緊急措置 (IV)', bg: 'linear-gradient(135deg,#dc2626,#dc3545)' },
          ].map(s => (
            <div className="col-6 col-md-3" key={s.key}>
              <div className="stat-card" style={{ background: s.bg }}>
                <i className="bi bi-shield-check stat-icon"></i>
                <div>
                  <div className="stat-value">{healthCounts[s.key] || 0}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 検索 */}
        <div className="card mb-3">
          <div className="card-body py-2">
            <form onSubmit={handleSearch} className="d-flex gap-2">
              <div className="input-group">
                <span className="input-group-text border-0 bg-light">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-0 bg-light"
                  placeholder="橋梁名・管理番号・場所で検索..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button type="button" className="btn btn-light border-0" onClick={() => { setSearch(''); load() }}>
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
              <button type="submit" className="btn btn-primary px-4">
                <i className="bi bi-search me-1"></i>検索
              </button>
              <button
                type="button"
                className="btn btn-success px-3"
                onClick={() => navigate('/bridges/new')}
              >
                <i className="bi bi-plus-lg me-1"></i>新規登録
              </button>
            </form>
          </div>
        </div>

        {/* テーブル */}
        <div className="card">
          <div className="card-body p-0">
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner-border text-primary"></div>
              </div>
            ) : bridges.length === 0 ? (
              <div className="empty-state">
                <i className="bi bi-building d-block"></i>
                <p className="mb-2">橋梁データが登録されていません</p>
                <button className="btn btn-primary" onClick={() => navigate('/bridges/new')}>
                  <i className="bi bi-plus-lg me-1"></i>最初の橋梁を登録する
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: '120px' }}>管理番号</th>
                      <th>橋梁名</th>
                      <th>路線名</th>
                      <th>所在地</th>
                      <th style={{ width: '80px' }} className="text-center">地図</th>
                      <th style={{ width: '110px' }} className="text-center">前回点検</th>
                      <th style={{ width: '110px' }} className="text-center">次回点検予定</th>
                      <th style={{ width: '90px' }} className="text-center">健全性</th>
                      <th style={{ width: '70px' }} className="text-center">点検数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bridges.map((b) => {
                      const mapsUrl = googleMapsUrl(b.latitude, b.longitude, b.bridge_name)
                      const health = HEALTH_LABELS[b.last_health_rating] || HEALTH_LABELS['未判定']
                      return (
                        <tr key={b.id} onClick={() => navigate(`/bridges/${b.id}`)}>
                          <td className="align-middle">
                            <code style={{ fontSize: '0.85rem' }}>{b.management_number}</code>
                          </td>
                          <td className="align-middle">
                            <span className="bridge-name-link">
                              <i className="bi bi-building me-1 text-primary"></i>
                              {b.bridge_name}
                            </span>
                          </td>
                          <td className="align-middle text-muted" style={{ fontSize: '0.88rem' }}>
                            {b.road_name || '—'}
                          </td>
                          <td className="align-middle" style={{ fontSize: '0.88rem' }}>
                            {b.location || '—'}
                          </td>
                          <td className="align-middle text-center">
                            {mapsUrl ? (
                              <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="maps-link"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <i className="bi bi-geo-alt-fill text-danger"></i>
                                <span className="d-none d-md-inline ms-1">地図</span>
                              </a>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                          <td className="align-middle text-center" style={{ fontSize: '0.88rem' }}>
                            {b.last_inspection_date
                              ? <><i className="bi bi-calendar3 me-1 text-muted"></i>{formatDate(b.last_inspection_date)}</>
                              : <span className="text-muted">未点検</span>
                            }
                          </td>
                          <td className="align-middle text-center" style={{ fontSize: '0.88rem' }}>
                            {b.next_inspection_date
                              ? <><i className="bi bi-calendar-check me-1 text-success"></i>{formatDate(b.next_inspection_date)}</>
                              : <span className="text-muted">—</span>
                            }
                          </td>
                          <td className="align-middle text-center">
                            <span className={`health-badge ${health.color}`}>
                              {b.last_health_rating || '未'}
                            </span>
                          </td>
                          <td className="align-middle text-center">
                            <span className="badge bg-secondary rounded-pill">{b.inspection_count}</span>
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

        <div className="mt-3 text-muted d-flex gap-3 flex-wrap" style={{ fontSize: '0.82rem' }}>
          {Object.entries(HEALTH_LABELS).map(([k, v]) => (
            <span key={k} className={`health-badge ${v.color}`}>{k}: {v.label}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
