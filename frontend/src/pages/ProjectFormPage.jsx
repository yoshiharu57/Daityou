import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { projectsApi } from '../api'

const PROJECT_TYPES = ['橋梁設計', '道路設計', '河川・治水', '港湾・海岸', 'トンネル', '地質調査', '環境調査', '都市計画', '上下水道', 'その他']
const ENGINEERS = ['山田 太郎', '鈴木 健一', '佐藤 雄二', '伊藤 次郎', '渡辺 三郎']

const empty = {
  business_number: '', project_name: '', client_organization: '', client_contact: '',
  contract_date: '', start_date: '', end_date: '',
  contract_amount: '', project_type: '', person_in_charge: '',
  chief_engineer: '', review_engineer: '',
  progress_rate: 0, status: '進行中', notes: '',
}

export default function ProjectFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    projectsApi.get(id).then(r => {
      const d = r.data
      setForm({
        ...d,
        contract_date: d.contract_date || '',
        start_date: d.start_date || '',
        end_date: d.end_date || '',
        contract_amount: d.contract_amount || '',
      })
    }).finally(() => setLoading(false))
  }, [id])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = {
        ...form,
        contract_amount: form.contract_amount ? Number(form.contract_amount) : 0,
        progress_rate: Number(form.progress_rate),
        contract_date: form.contract_date || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      }
      if (isEdit) {
        await projectsApi.update(id, payload)
      } else {
        await projectsApi.create(payload)
      }
      navigate('/projects')
    } catch (err) {
      setError(err.response?.data?.detail || '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>

  return (
    <div className="container py-4" style={{ maxWidth: 860 }}>
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/">ダッシュボード</Link></li>
          <li className="breadcrumb-item"><Link to="/projects">案件一覧</Link></li>
          <li className="breadcrumb-item active">{isEdit ? '案件編集' : '案件登録'}</li>
        </ol>
      </nav>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-primary text-white py-3">
          <h5 className="mb-0 fw-bold">
            <i className={`bi ${isEdit ? 'bi-pencil-square' : 'bi-plus-circle'} me-2`}></i>
            {isEdit ? '案件編集' : '新規案件登録'}
          </h5>
        </div>
        <div className="card-body p-4">
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <form onSubmit={handleSubmit}>

            {/* 基本情報 */}
            <h6 className="text-primary fw-bold border-bottom pb-1 mb-3">基本情報</h6>
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <label className="form-label fw-semibold">業務ナンバー <span className="text-danger">*</span></label>
                <input className="form-control" required value={form.business_number}
                  onChange={e => set('business_number', e.target.value)} placeholder="例: R6-001" />
              </div>
              <div className="col-md-8">
                <label className="form-label fw-semibold">案件名 <span className="text-danger">*</span></label>
                <input className="form-control" required value={form.project_name}
                  onChange={e => set('project_name', e.target.value)} placeholder="業務名称を入力" />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">業務種別</label>
                <select className="form-select" value={form.project_type} onChange={e => set('project_type', e.target.value)}>
                  <option value="">選択してください</option>
                  {PROJECT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">ステータス</label>
                <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                  <option>進行中</option>
                  <option>完了</option>
                  <option>中断</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">受注金額（円）</label>
                <div className="input-group">
                  <span className="input-group-text">¥</span>
                  <input type="number" className="form-control" value={form.contract_amount}
                    onChange={e => set('contract_amount', e.target.value)} placeholder="0" min="0" />
                </div>
              </div>
            </div>

            {/* 発注機関・担当者 */}
            <h6 className="text-primary fw-bold border-bottom pb-1 mb-3">発注機関・担当者</h6>
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">発注機関名</label>
                <input className="form-control" value={form.client_organization}
                  onChange={e => set('client_organization', e.target.value)} placeholder="例: ○○県土木部" />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">相手先担当者名</label>
                <input className="form-control" value={form.client_contact}
                  onChange={e => set('client_contact', e.target.value)} placeholder="例: 田中 一郎" />
              </div>
            </div>

            {/* 工期 */}
            <h6 className="text-primary fw-bold border-bottom pb-1 mb-3">工期・契約</h6>
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <label className="form-label fw-semibold">契約日</label>
                <input type="date" className="form-control" value={form.contract_date}
                  onChange={e => set('contract_date', e.target.value)} />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">工期開始日</label>
                <input type="date" className="form-control" value={form.start_date}
                  onChange={e => set('start_date', e.target.value)} />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">工期終了日</label>
                <input type="date" className="form-control" value={form.end_date}
                  onChange={e => set('end_date', e.target.value)} />
              </div>
            </div>

            {/* 担当技術者 */}
            <h6 className="text-primary fw-bold border-bottom pb-1 mb-3">担当技術者</h6>
            <div className="row g-3 mb-4">
              {[
                { label: '担当', key: 'person_in_charge' },
                { label: '主任技術者', key: 'chief_engineer' },
                { label: '照査技術者', key: 'review_engineer' },
              ].map(({ label, key }) => (
                <div className="col-md-4" key={key}>
                  <label className="form-label fw-semibold">{label}</label>
                  <input className="form-control" list={`eng-list-${key}`} value={form[key]}
                    onChange={e => set(key, e.target.value)} placeholder="技術者名を入力" />
                  <datalist id={`eng-list-${key}`}>
                    {ENGINEERS.map(e => <option key={e} value={e} />)}
                  </datalist>
                </div>
              ))}
            </div>

            {/* 進捗・メモ */}
            <h6 className="text-primary fw-bold border-bottom pb-1 mb-3">進捗・メモ</h6>
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">業務進捗率: <strong>{form.progress_rate}%</strong></label>
                <input type="range" className="form-range" min="0" max="100" step="5"
                  value={form.progress_rate} onChange={e => set('progress_rate', e.target.value)} />
                <div className="progress mt-1" style={{ height: 8 }}>
                  <div className="progress-bar bg-primary" style={{ width: `${form.progress_rate}%` }} />
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">メモ・備考</label>
                <textarea className="form-control" rows={3} value={form.notes}
                  onChange={e => set('notes', e.target.value)} placeholder="特記事項など" />
              </div>
            </div>

            <div className="d-flex gap-2 justify-content-end">
              <Link to="/projects" className="btn btn-outline-secondary">キャンセル</Link>
              <button type="submit" className="btn btn-primary px-4" disabled={saving}>
                {saving ? <><span className="spinner-border spinner-border-sm me-2" />保存中...</> : <><i className="bi bi-save me-1"></i>保存</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
