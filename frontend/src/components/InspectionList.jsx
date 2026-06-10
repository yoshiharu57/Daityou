import React, { useState } from 'react'
import { inspectionApi, HEALTH_LABELS, MEMBER_TYPES, DAMAGE_TYPES, formatDateFull } from '../api'

const INSPECTION_TYPES = ['定期点検', '緊急点検', '詳細点検', '初回点検']
const REPAIR_URGENCY = ['なし', '次回点検まで経過観察', '早期に補修が必要', '早急に補修が必要', '緊急に補修が必要']
const DAMAGE_RATINGS = ['a', 'b', 'c', 'd', 'e', '-']

function InspectionForm({ bridgeId, inspection, onSave, onCancel }) {
  const [form, setForm] = useState(inspection ? {
    inspection_date: inspection.inspection_date || '',
    inspection_type: inspection.inspection_type || '定期点検',
    inspector_company: inspection.inspector_company || '',
    inspector_name: inspection.inspector_name || '',
    health_rating: inspection.health_rating || '未判定',
    overall_findings: inspection.overall_findings || '',
    repair_urgency: inspection.repair_urgency || 'なし',
    next_inspection_date: inspection.next_inspection_date || '',
  } : {
    inspection_date: '',
    inspection_type: '定期点検',
    inspector_company: '',
    inspector_name: '',
    health_rating: '未判定',
    overall_findings: '',
    repair_urgency: 'なし',
    next_inspection_date: '',
  })
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        bridge_id: bridgeId,
        next_inspection_date: form.next_inspection_date || null,
      }
      if (inspection) {
        await inspectionApi.update(inspection.id, payload)
      } else {
        await inspectionApi.create(payload)
      }
      onSave()
    } catch (err) {
      alert(err.response?.data?.detail || '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card border-primary">
      <div className="card-header">
        <i className="bi bi-clipboard2-plus me-2"></i>
        {inspection ? '点検記録を編集' : '点検記録を新規追加'}
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label fw-semibold">点検年月日 <span className="text-danger">*</span></label>
            <input type="date" className="form-control" name="inspection_date"
              value={form.inspection_date} onChange={handleChange} required />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold">点検種別</label>
            <select className="form-select" name="inspection_type" value={form.inspection_type} onChange={handleChange}>
              {INSPECTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold">健全性区分</label>
            <select className="form-select" name="health_rating" value={form.health_rating} onChange={handleChange}>
              {Object.entries(HEALTH_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{k}: {v.label}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold">補修緊急度</label>
            <select className="form-select" name="repair_urgency" value={form.repair_urgency} onChange={handleChange}>
              {REPAIR_URGENCY.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">点検業者</label>
            <input type="text" className="form-control" name="inspector_company"
              value={form.inspector_company} onChange={handleChange} placeholder="点検会社名" />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold">点検者</label>
            <input type="text" className="form-control" name="inspector_name"
              value={form.inspector_name} onChange={handleChange} placeholder="担当者名" />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold">次回点検予定</label>
            <input type="date" className="form-control" name="next_inspection_date"
              value={form.next_inspection_date} onChange={handleChange} />
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold">総括所見</label>
            <textarea className="form-control" name="overall_findings" rows={4}
              value={form.overall_findings} onChange={handleChange}
              placeholder="点検の総括所見を入力してください..." />
          </div>
        </div>
      </div>
      <div className="card-footer d-flex gap-2">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>保存中</> : <><i className="bi bi-check-lg me-1"></i>保存</>}
        </button>
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
          <i className="bi bi-x-lg me-1"></i>キャンセル
        </button>
      </div>
    </form>
  )
}

function DamageForm({ inspectionId, onSave, onCancel }) {
  const [form, setForm] = useState({
    member_type: '',
    member_number: '',
    damage_type: '',
    damage_rating: 'b',
    damage_extent: '',
    description: '',
    repair_method: '',
  })
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await inspectionApi.addDamage(inspectionId, form)
      onSave()
    } catch (err) {
      alert(err.response?.data?.detail || '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded p-3 bg-light mb-3">
      <div className="row g-2">
        <div className="col-md-3">
          <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>部材種別</label>
          <select className="form-select form-select-sm" name="member_type" value={form.member_type} onChange={handleChange}>
            <option value="">選択</option>
            {MEMBER_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="col-md-2">
          <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>部材番号</label>
          <input className="form-control form-control-sm" name="member_number" value={form.member_number} onChange={handleChange} placeholder="G1, P1..." />
        </div>
        <div className="col-md-3">
          <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>損傷種別</label>
          <select className="form-select form-select-sm" name="damage_type" value={form.damage_type} onChange={handleChange}>
            <option value="">選択</option>
            {DAMAGE_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="col-md-2">
          <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>損傷程度</label>
          <select className="form-select form-select-sm" name="damage_rating" value={form.damage_rating} onChange={handleChange}>
            {DAMAGE_RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="col-md-2">
          <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>損傷量</label>
          <input className="form-control form-control-sm" name="damage_extent" value={form.damage_extent} onChange={handleChange} placeholder="例: 全面、一部..." />
        </div>
        <div className="col-md-8">
          <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>損傷の説明</label>
          <input className="form-control form-control-sm" name="description" value={form.description} onChange={handleChange} placeholder="損傷の状況を記入" />
        </div>
        <div className="col-md-4">
          <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>補修方法</label>
          <input className="form-control form-control-sm" name="repair_method" value={form.repair_method} onChange={handleChange} placeholder="推奨補修方法" />
        </div>
      </div>
      <div className="d-flex gap-2 mt-2">
        <button type="submit" className="btn btn-sm btn-primary" disabled={saving}>
          <i className="bi bi-plus me-1"></i>追加
        </button>
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onCancel}>キャンセル</button>
      </div>
    </form>
  )
}

export default function InspectionList({ bridge, inspections, selectedInspection, onSelect, onRefresh }) {
  const [showForm, setShowForm] = useState(false)
  const [editingInspection, setEditingInspection] = useState(null)
  const [showDamageForm, setShowDamageForm] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  const handleDelete = async (id) => {
    try {
      await inspectionApi.delete(id)
      setDeleteConfirmId(null)
      onRefresh()
    } catch {
      alert('削除に失敗しました')
    }
  }

  const handleDeleteDamage = async (inspectionId, damageId) => {
    try {
      await inspectionApi.deleteDamage(inspectionId, damageId)
      onRefresh()
    } catch {
      alert('削除に失敗しました')
    }
  }

  return (
    <div className="row g-3">
      {/* 左: 点検一覧 */}
      <div className="col-lg-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0 text-primary fw-bold">
            <i className="bi bi-list-check me-1"></i>点検記録一覧
          </h6>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => { setShowForm(!showForm); setEditingInspection(null) }}
          >
            <i className="bi bi-plus-lg me-1"></i>追加
          </button>
        </div>

        {showForm && !editingInspection && (
          <div className="mb-3">
            <InspectionForm
              bridgeId={bridge.id}
              onSave={() => { setShowForm(false); onRefresh() }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {inspections.length === 0 ? (
          <div className="empty-state py-4">
            <i className="bi bi-clipboard2 d-block fs-2 text-muted mb-2"></i>
            <p className="text-muted mb-0">点検記録がありません</p>
          </div>
        ) : (
          <div className="list-group">
            {inspections.map((insp) => {
              const health = HEALTH_LABELS[insp.health_rating] || HEALTH_LABELS['未判定']
              const isSelected = selectedInspection?.id === insp.id
              return (
                <button
                  key={insp.id}
                  className={`list-group-item list-group-item-action ${isSelected ? 'active' : ''}`}
                  onClick={() => onSelect(insp)}
                  style={{ borderLeft: isSelected ? '4px solid var(--primary)' : '4px solid transparent' }}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                        {formatDateFull(insp.inspection_date)}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>{insp.inspection_type}</div>
                    </div>
                    <span className={`health-badge ${health.color}`}>{insp.health_rating || '未'}</span>
                  </div>
                  {insp.inspector_company && (
                    <div className="text-muted mt-1" style={{ fontSize: '0.78rem' }}>
                      <i className="bi bi-building me-1"></i>{insp.inspector_company}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* 右: 選択中の点検詳細 */}
      <div className="col-lg-8">
        {selectedInspection ? (
          <div>
            {editingInspection?.id === selectedInspection.id ? (
              <InspectionForm
                bridgeId={bridge.id}
                inspection={editingInspection}
                onSave={() => { setEditingInspection(null); onRefresh() }}
                onCancel={() => setEditingInspection(null)}
              />
            ) : (
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <span>
                    <i className="bi bi-clipboard2-check me-2"></i>
                    {formatDateFull(selectedInspection.inspection_date)} 点検詳細
                  </span>
                  <div className="d-flex gap-1">
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => setEditingInspection(selectedInspection)}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => setDeleteConfirmId(selectedInspection.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <div className="row g-3 mb-3">
                    <div className="col-sm-4 text-center">
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>健全性区分</div>
                      <span className={`health-badge ${HEALTH_LABELS[selectedInspection.health_rating]?.color || 'health-未判定'} px-3`}>
                        {selectedInspection.health_rating || '未判定'}
                      </span>
                    </div>
                    <div className="col-sm-4 text-center">
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>点検種別</div>
                      <div className="fw-semibold">{selectedInspection.inspection_type}</div>
                    </div>
                    <div className="col-sm-4 text-center">
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>補修緊急度</div>
                      <div className={`fw-semibold ${selectedInspection.repair_urgency && selectedInspection.repair_urgency !== 'なし' ? 'text-danger' : ''}`}>
                        {selectedInspection.repair_urgency || '—'}
                      </div>
                    </div>
                  </div>

                  <table className="table table-sm table-borderless mb-3">
                    <tbody>
                      <tr>
                        <td className="text-muted" style={{ width: '35%' }}>点検業者</td>
                        <td>{selectedInspection.inspector_company || '—'}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">点検者</td>
                        <td>{selectedInspection.inspector_name || '—'}</td>
                      </tr>
                      {selectedInspection.next_inspection_date && (
                        <tr>
                          <td className="text-muted">次回点検予定</td>
                          <td>{formatDateFull(selectedInspection.next_inspection_date)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {selectedInspection.overall_findings && (
                    <div className="mb-3">
                      <p className="section-title">総括所見</p>
                      <div className="p-3 bg-light rounded" style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                        {selectedInspection.overall_findings}
                      </div>
                    </div>
                  )}

                  {/* 損傷記録 */}
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <p className="section-title mb-0">損傷記録</p>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setShowDamageForm(!showDamageForm)}
                      >
                        <i className="bi bi-plus me-1"></i>損傷追加
                      </button>
                    </div>

                    {showDamageForm && (
                      <DamageForm
                        inspectionId={selectedInspection.id}
                        onSave={() => { setShowDamageForm(false); onRefresh() }}
                        onCancel={() => setShowDamageForm(false)}
                      />
                    )}

                    {selectedInspection.damage_records?.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-sm table-bordered mb-0">
                          <thead>
                            <tr style={{ fontSize: '0.82rem' }}>
                              <th>部材種別</th>
                              <th>番号</th>
                              <th>損傷種別</th>
                              <th className="text-center">程度</th>
                              <th>説明</th>
                              <th>補修方法</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody style={{ fontSize: '0.82rem' }}>
                            {selectedInspection.damage_records.map((d) => (
                              <tr key={d.id}>
                                <td>{d.member_type || '—'}</td>
                                <td>{d.member_number || '—'}</td>
                                <td>{d.damage_type || '—'}</td>
                                <td className="text-center">
                                  <span className="badge bg-warning text-dark">{d.damage_rating || '—'}</span>
                                </td>
                                <td>{d.description || '—'}</td>
                                <td>{d.repair_method || '—'}</td>
                                <td>
                                  <button
                                    className="btn btn-xs btn-link text-danger p-0"
                                    style={{ fontSize: '0.82rem' }}
                                    onClick={() => handleDeleteDamage(selectedInspection.id, d.id)}
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-muted text-center py-3" style={{ fontSize: '0.88rem' }}>
                        損傷記録がありません
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state">
            <i className="bi bi-hand-index d-block fs-2 text-muted mb-2"></i>
            <p className="text-muted">左側から点検記録を選択してください</p>
          </div>
        )}
      </div>

      {/* 削除確認モーダル */}
      {deleteConfirmId && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title"><i className="bi bi-exclamation-triangle me-2"></i>削除の確認</h5>
                <button className="btn-close" onClick={() => setDeleteConfirmId(null)}></button>
              </div>
              <div className="modal-body">
                <p className="text-danger mb-0">
                  <i className="bi bi-exclamation-circle me-1"></i>
                  この点検記録と関連する損傷記録・写真がすべて削除されます。
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setDeleteConfirmId(null)}>キャンセル</button>
                <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirmId)}>
                  <i className="bi bi-trash me-1"></i>削除する
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
