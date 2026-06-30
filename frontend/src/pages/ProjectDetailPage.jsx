import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { projectsApi, logsApi } from '../api'
import { differenceInDays, parseISO, format } from 'date-fns'

function ProgressBar({ value }) {
  const color = value >= 100 ? 'bg-success' : value >= 60 ? 'bg-primary' : value >= 30 ? 'bg-warning' : 'bg-danger'
  return (
    <div>
      <div className="d-flex justify-content-between small mb-1">
        <span>業務進捗率</span><strong>{value}%</strong>
      </div>
      <div className="progress" style={{ height: 16 }}>
        <div className={`progress-bar ${color} fw-bold`} style={{ width: `${Math.min(value, 100)}%` }}>{value}%</div>
      </div>
    </div>
  )
}

const LOG_TYPES = ['打合せ', '提出', '現地調査', '電話', 'メール', 'その他']

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showLogForm, setShowLogForm] = useState(false)
  const [logForm, setLogForm] = useState({ log_date: format(new Date(), 'yyyy-MM-dd'), activity_type: '打合せ', description: '', staff_name: '', next_action: '' })
  const [savingLog, setSavingLog] = useState(false)

  const load = () => {
    Promise.all([projectsApi.get(id), logsApi.list(id)])
      .then(([pR, lR]) => { setProject(pR.data); setLogs(lR.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const handleDelete = async () => {
    if (!window.confirm('この案件を削除してもよいですか？')) return
    await projectsApi.delete(id)
    navigate('/projects')
  }

  const handleLogSubmit = async (e) => {
    e.preventDefault()
    setSavingLog(true)
    try {
      await logsApi.create({ ...logForm, project_id: Number(id) })
      setLogForm({ log_date: format(new Date(), 'yyyy-MM-dd'), activity_type: '打合せ', description: '', staff_name: '', next_action: '' })
      setShowLogForm(false)
      const r = await logsApi.list(id)
      setLogs(r.data)
    } finally { setSavingLog(false) }
  }

  const handleDeleteLog = async (logId) => {
    if (!window.confirm('記録を削除しますか？')) return
    await logsApi.delete(logId)
    const r = await logsApi.list(id)
    setLogs(r.data)
  }

  const handleProgressUpdate = async (val) => {
    await projectsApi.update(id, { progress_rate: val })
    setProject(p => ({ ...p, progress_rate: val }))
  }

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
  if (!project) return <div className="text-center py-5 text-danger">案件が見つかりません</div>

  const days = project.end_date ? differenceInDays(parseISO(project.end_date), new Date()) : null
  const fmt = (d) => d ? format(parseISO(d), 'yyyy年MM月dd日') : '未設定'

  return (
    <div className="container py-4" style={{ maxWidth: 960 }}>
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/">ダッシュボード</Link></li>
          <li className="breadcrumb-item"><Link to="/projects">案件一覧</Link></li>
          <li className="breadcrumb-item active">{project.project_name}</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <div>
              <div className="text-muted small mb-1">
                <span className="badge bg-secondary me-2">{project.business_number}</span>
                {project.project_type && <span className="badge bg-info text-dark me-2">{project.project_type}</span>}
                {project.status === '完了' ? <span className="badge bg-success">完了</span>
                  : project.status === '中断' ? <span className="badge bg-secondary">中断</span>
                  : days !== null && days < 0 ? <span className="badge bg-danger">期限超過</span>
                  : days !== null && days <= 30 ? <span className="badge bg-warning text-dark">期限間近</span>
                  : <span className="badge bg-primary">進行中</span>}
              </div>
              <h4 className="fw-bold mb-0">{project.project_name}</h4>
            </div>
            <div className="d-flex gap-2">
              <Link to={`/projects/${id}/edit`} className="btn btn-outline-primary btn-sm">
                <i className="bi bi-pencil me-1"></i>編集
              </Link>
              <button className="btn btn-outline-danger btn-sm" onClick={handleDelete}>
                <i className="bi bi-trash me-1"></i>削除
              </button>
            </div>
          </div>

          <div className="mt-3">
            <ProgressBar value={project.progress_rate} />
            <div className="d-flex align-items-center gap-2 mt-2">
              <span className="small text-muted">進捗を更新:</span>
              {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(v => (
                <button key={v} className={`btn btn-sm py-0 px-2 ${project.progress_rate === v ? 'btn-primary' : 'btn-outline-secondary'}`}
                  style={{ fontSize: '0.72rem' }} onClick={() => handleProgressUpdate(v)}>
                  {v}%
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Left column: details */}
        <div className="col-md-5">
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header bg-white fw-bold border-bottom">
              <i className="bi bi-info-circle me-2 text-primary"></i>案件詳細
            </div>
            <div className="card-body p-0">
              <table className="table table-sm mb-0">
                <tbody>
                  <tr><th className="text-muted fw-normal ps-3" style={{ width: 120 }}>発注機関</th><td>{project.client_organization || '-'}</td></tr>
                  <tr><th className="text-muted fw-normal ps-3">相手先担当</th><td>{project.client_contact || '-'}</td></tr>
                  <tr><th className="text-muted fw-normal ps-3">契約日</th><td>{fmt(project.contract_date)}</td></tr>
                  <tr><th className="text-muted fw-normal ps-3">工期開始</th><td>{fmt(project.start_date)}</td></tr>
                  <tr>
                    <th className="text-muted fw-normal ps-3">工期終了</th>
                    <td>
                      {fmt(project.end_date)}
                      {days !== null && (
                        <span className={`ms-2 badge ${days < 0 ? 'bg-danger' : days <= 30 ? 'bg-warning text-dark' : 'bg-light text-dark'}`}>
                          {days < 0 ? `${Math.abs(days)}日超過` : `残${days}日`}
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th className="text-muted fw-normal ps-3">受注金額</th>
                    <td className="fw-bold">{project.contract_amount ? `¥${project.contract_amount.toLocaleString()}` : '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header bg-white fw-bold border-bottom">
              <i className="bi bi-person-gear me-2 text-primary"></i>担当技術者
            </div>
            <div className="card-body p-0">
              <table className="table table-sm mb-0">
                <tbody>
                  <tr><th className="text-muted fw-normal ps-3" style={{ width: 120 }}>担当</th><td>{project.person_in_charge || '-'}</td></tr>
                  <tr><th className="text-muted fw-normal ps-3">主任技術者</th><td>{project.chief_engineer || '-'}</td></tr>
                  <tr><th className="text-muted fw-normal ps-3">照査技術者</th><td>{project.review_engineer || '-'}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {project.notes && (
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white fw-bold border-bottom">
                <i className="bi bi-sticky me-2 text-warning"></i>メモ
              </div>
              <div className="card-body">
                <p className="mb-0 small" style={{ whiteSpace: 'pre-wrap' }}>{project.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right column: activity logs */}
        <div className="col-md-7">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center border-bottom">
              <span className="fw-bold"><i className="bi bi-journal-text me-2 text-primary"></i>活動履歴</span>
              <button className="btn btn-sm btn-primary" onClick={() => setShowLogForm(v => !v)}>
                <i className="bi bi-plus me-1"></i>記録追加
              </button>
            </div>
            <div className="card-body p-3">
              {showLogForm && (
                <div className="card border-primary mb-3">
                  <div className="card-body p-3">
                    <h6 className="text-primary mb-3">活動記録を追加</h6>
                    <form onSubmit={handleLogSubmit}>
                      <div className="row g-2 mb-2">
                        <div className="col-6">
                          <label className="form-label small fw-semibold">日付</label>
                          <input type="date" className="form-control form-control-sm" required
                            value={logForm.log_date} onChange={e => setLogForm(f => ({ ...f, log_date: e.target.value }))} />
                        </div>
                        <div className="col-6">
                          <label className="form-label small fw-semibold">種別</label>
                          <select className="form-select form-select-sm"
                            value={logForm.activity_type} onChange={e => setLogForm(f => ({ ...f, activity_type: e.target.value }))}>
                            {LOG_TYPES.map(t => <option key={t}>{t}</option>)}
                          </select>
                        </div>
                        <div className="col-8">
                          <label className="form-label small fw-semibold">内容 <span className="text-danger">*</span></label>
                          <textarea className="form-control form-control-sm" rows={2} required
                            value={logForm.description} onChange={e => setLogForm(f => ({ ...f, description: e.target.value }))} />
                        </div>
                        <div className="col-4">
                          <label className="form-label small fw-semibold">担当者</label>
                          <input className="form-control form-control-sm"
                            value={logForm.staff_name} onChange={e => setLogForm(f => ({ ...f, staff_name: e.target.value }))} />
                        </div>
                        <div className="col-12">
                          <label className="form-label small fw-semibold">次のアクション</label>
                          <input className="form-control form-control-sm"
                            value={logForm.next_action} onChange={e => setLogForm(f => ({ ...f, next_action: e.target.value }))} />
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-primary btn-sm" disabled={savingLog}>
                          {savingLog ? '保存中...' : '保存'}
                        </button>
                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowLogForm(false)}>キャンセル</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {logs.length === 0 ? (
                <div className="text-center text-muted py-3 small">活動記録がありません</div>
              ) : (
                <div className="timeline">
                  {logs.map(log => (
                    <div key={log.id} className="d-flex gap-3 mb-3">
                      <div className="d-flex flex-column align-items-center">
                        <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white"
                          style={{ width: 36, height: 36, flexShrink: 0, fontSize: '0.7rem', fontWeight: 700 }}>
                          {log.activity_type?.slice(0, 2) || '記録'}
                        </div>
                        <div className="bg-secondary" style={{ width: 2, flexGrow: 1, marginTop: 4, opacity: 0.2 }} />
                      </div>
                      <div className="flex-grow-1 pb-3">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <span className="badge bg-light text-dark border me-2">{log.activity_type}</span>
                            <span className="small text-muted">{format(parseISO(log.log_date), 'yyyy/MM/dd')}</span>
                            {log.staff_name && <span className="small text-muted ms-2">({log.staff_name})</span>}
                          </div>
                          <button className="btn btn-sm text-danger py-0" onClick={() => handleDeleteLog(log.id)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                        <p className="mb-1 mt-1 small" style={{ whiteSpace: 'pre-wrap' }}>{log.description}</p>
                        {log.next_action && (
                          <div className="alert alert-info py-1 px-2 mb-0 small">
                            <i className="bi bi-arrow-right-circle me-1"></i>
                            <strong>次のアクション:</strong> {log.next_action}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
