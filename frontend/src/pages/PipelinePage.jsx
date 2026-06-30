import React, { useEffect, useState } from 'react'
import { opportunitiesApi } from '../api'
import { parseISO, format, differenceInDays } from 'date-fns'

const STAGES = ['情報収集', '提案中', '入札済み', '受注', '失注']
const STAGE_COLOR = {
  '情報収集': { bg: '#e0f0ff', border: '#2563a8', badge: 'bg-info text-dark' },
  '提案中':   { bg: '#fff7e0', border: '#f59e0b', badge: 'bg-warning text-dark' },
  '入札済み': { bg: '#ede9fe', border: '#7c3aed', badge: 'bg-purple' },
  '受注':     { bg: '#d1fae5', border: '#059669', badge: 'bg-success' },
  '失注':     { bg: '#fee2e2', border: '#dc2626', badge: 'bg-danger' },
}
const PROB_COLOR = (p) => p >= 70 ? 'bg-success' : p >= 40 ? 'bg-warning' : 'bg-danger'

const PROJECT_TYPES = ['橋梁設計', '道路設計', '河川・治水', '港湾・海岸', 'トンネル', '地質調査', '環境調査', '都市計画', '上下水道', 'その他']

const emptyForm = {
  opportunity_name: '', client_organization: '', client_contact: '',
  bid_date: '', estimated_amount: '', win_probability: 50,
  stage: '情報収集', project_type: '', person_in_charge: '', competitor: '', notes: '',
}

function fmt(n) {
  if (!n) return '-'
  return n >= 1e8 ? `${(n / 1e8).toFixed(1)}億` : `${(n / 1e4).toFixed(0)}万`
}

export default function PipelinePage() {
  const [opps, setOpps] = useState([])
  const [pipelineStats, setPipelineStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [viewMode, setViewMode] = useState('kanban') // kanban | table

  const load = () => {
    setLoading(true)
    Promise.all([opportunitiesApi.list(), opportunitiesApi.pipelineStats()])
      .then(([oR, sR]) => { setOpps(oR.data); setPipelineStats(sR.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openNew = () => { setForm(emptyForm); setEditId(null); setShowModal(true) }
  const openEdit = (opp) => {
    setForm({ ...opp, bid_date: opp.bid_date || '', estimated_amount: opp.estimated_amount || '', })
    setEditId(opp.id); setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const payload = { ...form, estimated_amount: form.estimated_amount ? Number(form.estimated_amount) : 0, win_probability: Number(form.win_probability), bid_date: form.bid_date || null }
      if (editId) await opportunitiesApi.update(editId, payload)
      else await opportunitiesApi.create(payload)
      setShowModal(false); load()
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('この商談を削除しますか？')) return
    await opportunitiesApi.delete(id); load()
  }

  const handleStageChange = async (id, stage) => {
    await opportunitiesApi.update(id, { stage }); load()
  }

  const totalExpected = Object.values(pipelineStats).reduce((s, v) => s + (v?.expected || 0), 0)
  const activeOpps = opps.filter(o => o.stage !== '失注')

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>

  return (
    <div className="container-fluid py-4 px-3 px-md-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0"><i className="bi bi-funnel me-2 text-primary"></i>受注パイプライン管理</h4>
        <div className="d-flex gap-2">
          <div className="btn-group btn-group-sm">
            <button className={`btn ${viewMode === 'kanban' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setViewMode('kanban')}>
              <i className="bi bi-kanban me-1"></i>かんばん
            </button>
            <button className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setViewMode('table')}>
              <i className="bi bi-table me-1"></i>一覧
            </button>
          </div>
          <button className="btn btn-success btn-sm" onClick={openNew}>
            <i className="bi bi-plus-circle me-1"></i>商談追加
          </button>
        </div>
      </div>

      {/* Pipeline summary */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body py-3">
              <div className="text-muted small">商談中件数</div>
              <div className="fs-2 fw-bold text-primary">{activeOpps.length}<span className="fs-6 text-muted ms-1">件</span></div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body py-3">
              <div className="text-muted small">商談総額</div>
              <div className="fs-2 fw-bold text-warning">{fmt(activeOpps.reduce((s, o) => s + (o.estimated_amount || 0), 0))}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body py-3">
              <div className="text-muted small">期待受注額</div>
              <div className="fs-2 fw-bold text-success">{fmt(totalExpected)}</div>
              <div className="text-muted" style={{ fontSize: '0.72rem' }}>確率加重合計</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body py-3">
              <div className="text-muted small">近日入札</div>
              <div className="fs-2 fw-bold text-danger">
                {opps.filter(o => o.bid_date && differenceInDays(parseISO(o.bid_date), new Date()) <= 30 && differenceInDays(parseISO(o.bid_date), new Date()) >= 0).length}
                <span className="fs-6 text-muted ms-1">件</span>
              </div>
              <div className="text-muted" style={{ fontSize: '0.72rem' }}>30日以内</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stage funnel summary */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body py-2 px-3">
          <div className="d-flex gap-2 align-items-center flex-wrap">
            {STAGES.filter(s => s !== '失注').map((stage, i) => {
              const s = pipelineStats[stage] || {}
              const c = STAGE_COLOR[stage]
              return (
                <React.Fragment key={stage}>
                  <div className="text-center px-3 py-2 rounded" style={{ background: c.bg, borderLeft: `4px solid ${c.border}`, minWidth: 110 }}>
                    <div className="fw-bold" style={{ color: c.border }}>{stage}</div>
                    <div className="fs-5 fw-bold">{s.count || 0}件</div>
                    <div className="small text-muted">{fmt(s.amount)}</div>
                  </div>
                  {i < STAGES.filter(s => s !== '失注').length - 1 && <i className="bi bi-chevron-right text-muted"></i>}
                </React.Fragment>
              )
            })}
          </div>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        /* Kanban view */
        <div className="row g-3">
          {STAGES.map(stage => {
            const c = STAGE_COLOR[stage]
            const stageOpps = opps.filter(o => o.stage === stage)
            return (
              <div className="col-12 col-md-6 col-xl" key={stage}>
                <div className="card border-0 shadow-sm h-100" style={{ borderTop: `3px solid ${c.border}` }}>
                  <div className="card-header py-2 border-0" style={{ background: c.bg }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold" style={{ color: c.border }}>{stage}</span>
                      <span className="badge rounded-pill" style={{ background: c.border }}>{stageOpps.length}</span>
                    </div>
                  </div>
                  <div className="card-body p-2" style={{ minHeight: 200 }}>
                    {stageOpps.length === 0 && (
                      <div className="text-center text-muted py-4 small">案件なし</div>
                    )}
                    {stageOpps.map(opp => (
                      <div key={opp.id} className="card border shadow-sm mb-2 cursor-pointer" onClick={() => openEdit(opp)}>
                        <div className="card-body p-2">
                          <div className="fw-semibold small mb-1 lh-sm">{opp.opportunity_name}</div>
                          <div className="text-muted" style={{ fontSize: '0.72rem' }}>{opp.client_organization}</div>
                          {opp.bid_date && (
                            <div className={`small mt-1 ${differenceInDays(parseISO(opp.bid_date), new Date()) <= 14 ? 'text-danger fw-bold' : 'text-muted'}`}>
                              <i className="bi bi-calendar me-1"></i>入札: {format(parseISO(opp.bid_date), 'MM/dd')}
                            </div>
                          )}
                          <div className="d-flex justify-content-between align-items-center mt-2">
                            <span className="small fw-bold text-primary">{fmt(opp.estimated_amount)}</span>
                            <div className="d-flex align-items-center gap-1">
                              <div className="progress" style={{ width: 40, height: 6 }}>
                                <div className={`progress-bar ${PROB_COLOR(opp.win_probability)}`} style={{ width: `${opp.win_probability}%` }} />
                              </div>
                              <span style={{ fontSize: '0.7rem' }}>{opp.win_probability}%</span>
                            </div>
                          </div>
                          <div className="d-flex gap-1 mt-2 flex-wrap">
                            {STAGES.filter(s => s !== stage).map(s => (
                              <button key={s} className="btn btn-outline-secondary py-0 px-1" style={{ fontSize: '0.65rem' }}
                                onClick={e => { e.stopPropagation(); handleStageChange(opp.id, s) }}>
                                → {s}
                              </button>
                            ))}
                            <button className="btn btn-outline-danger py-0 px-1 ms-auto" style={{ fontSize: '0.65rem' }}
                              onClick={e => { e.stopPropagation(); handleDelete(opp.id) }}>
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Table view */
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 small">
                <thead className="table-dark">
                  <tr>
                    <th>案件名（仮）</th>
                    <th style={{ width: 120 }}>発注機関</th>
                    <th style={{ width: 80 }}>入札予定</th>
                    <th style={{ width: 80 }}>予定金額</th>
                    <th style={{ width: 90 }}>受注確率</th>
                    <th style={{ width: 80 }}>期待金額</th>
                    <th style={{ width: 80 }}>ステージ</th>
                    <th style={{ width: 80 }}>担当</th>
                    <th style={{ width: 60 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {opps.map(opp => (
                    <tr key={opp.id}>
                      <td className="fw-semibold">{opp.opportunity_name}</td>
                      <td>{opp.client_organization}</td>
                      <td>
                        {opp.bid_date ? (
                          <span className={differenceInDays(parseISO(opp.bid_date), new Date()) <= 14 ? 'text-danger fw-bold' : ''}>
                            {format(parseISO(opp.bid_date), 'MM/dd')}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="text-end">{fmt(opp.estimated_amount)}</td>
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <div className="progress flex-grow-1" style={{ height: 8 }}>
                            <div className={`progress-bar ${PROB_COLOR(opp.win_probability)}`} style={{ width: `${opp.win_probability}%` }} />
                          </div>
                          <span style={{ minWidth: 32 }}>{opp.win_probability}%</span>
                        </div>
                      </td>
                      <td className="text-end text-success fw-bold">{fmt((opp.estimated_amount || 0) * opp.win_probability / 100)}</td>
                      <td>
                        <select className="form-select form-select-sm py-0" value={opp.stage}
                          onChange={e => handleStageChange(opp.id, e.target.value)}>
                          {STAGES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td>{opp.person_in_charge}</td>
                      <td>
                        <button className="btn btn-outline-primary btn-sm py-0 px-1 me-1" onClick={() => openEdit(opp)}>編集</button>
                        <button className="btn btn-outline-danger btn-sm py-0 px-1" onClick={() => handleDelete(opp.id)}>削除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">{editId ? '商談編集' : '新規商談登録'}</h5>
                <button className="btn-close btn-close-white" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-semibold">案件名（仮） <span className="text-danger">*</span></label>
                      <input className="form-control" required value={form.opportunity_name}
                        onChange={e => setForm(f => ({ ...f, opportunity_name: e.target.value }))} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">発注機関</label>
                      <input className="form-control" value={form.client_organization}
                        onChange={e => setForm(f => ({ ...f, client_organization: e.target.value }))} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">担当者名</label>
                      <input className="form-control" value={form.client_contact}
                        onChange={e => setForm(f => ({ ...f, client_contact: e.target.value }))} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">入札予定日</label>
                      <input type="date" className="form-control" value={form.bid_date}
                        onChange={e => setForm(f => ({ ...f, bid_date: e.target.value }))} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">予定金額（円）</label>
                      <input type="number" className="form-control" value={form.estimated_amount}
                        onChange={e => setForm(f => ({ ...f, estimated_amount: e.target.value }))} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">ステージ</label>
                      <select className="form-select" value={form.stage}
                        onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}>
                        {STAGES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">受注確率: <strong>{form.win_probability}%</strong></label>
                      <input type="range" className="form-range" min="0" max="100" step="5"
                        value={form.win_probability} onChange={e => setForm(f => ({ ...f, win_probability: e.target.value }))} />
                      <div className="progress mt-1" style={{ height: 8 }}>
                        <div className={`progress-bar ${PROB_COLOR(form.win_probability)}`} style={{ width: `${form.win_probability}%` }} />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">業務種別</label>
                      <select className="form-select" value={form.project_type}
                        onChange={e => setForm(f => ({ ...f, project_type: e.target.value }))}>
                        <option value="">選択</option>
                        {PROJECT_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">当社担当</label>
                      <input className="form-control" value={form.person_in_charge}
                        onChange={e => setForm(f => ({ ...f, person_in_charge: e.target.value }))} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">競合他社</label>
                      <input className="form-control" value={form.competitor}
                        onChange={e => setForm(f => ({ ...f, competitor: e.target.value }))} />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">メモ</label>
                      <textarea className="form-control" rows={2} value={form.notes}
                        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>キャンセル</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? '保存中...' : '保存'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
