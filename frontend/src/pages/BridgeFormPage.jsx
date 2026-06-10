import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { bridgeApi, STRUCTURE_TYPES, SUPERSTRUCTURE_TYPES, SUBSTRUCTURE_TYPES } from '../api'

const ROAD_CLASSES = ['市道', '町道', '村道', '主要地方道', '一般県道', '一般都道府県道', '国道', 'その他']
const MATERIALS = ['鉄筋コンクリート', 'プレストレストコンクリート', '鋼', '石', '木', '複合', 'その他']

export default function BridgeFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    management_number: '',
    bridge_name: '',
    bridge_name_kana: '',
    road_name: '',
    location: '',
    latitude: '',
    longitude: '',
    bridge_length: '',
    width: '',
    structure_type: '',
    superstructure_type: '',
    substructure_type: '',
    material: '',
    year_built: '',
    road_class: '',
    administrator: '',
    notes: '',
  })

  useEffect(() => {
    if (isEdit) {
      bridgeApi.get(id).then((res) => {
        const b = res.data
        setForm({
          management_number: b.management_number || '',
          bridge_name: b.bridge_name || '',
          bridge_name_kana: b.bridge_name_kana || '',
          road_name: b.road_name || '',
          location: b.location || '',
          latitude: b.latitude ?? '',
          longitude: b.longitude ?? '',
          bridge_length: b.bridge_length ?? '',
          width: b.width ?? '',
          structure_type: b.structure_type || '',
          superstructure_type: b.superstructure_type || '',
          substructure_type: b.substructure_type || '',
          material: b.material || '',
          year_built: b.year_built ?? '',
          road_class: b.road_class || '',
          administrator: b.administrator || '',
          notes: b.notes || '',
        })
      }).catch(() => navigate('/'))
    }
  }, [id, isEdit, navigate])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = {
        ...form,
        latitude: form.latitude !== '' ? parseFloat(form.latitude) : null,
        longitude: form.longitude !== '' ? parseFloat(form.longitude) : null,
        bridge_length: form.bridge_length !== '' ? parseFloat(form.bridge_length) : null,
        width: form.width !== '' ? parseFloat(form.width) : null,
        year_built: form.year_built !== '' ? parseInt(form.year_built) : null,
      }
      if (isEdit) {
        await bridgeApi.update(id, payload)
        navigate(`/bridges/${id}`)
      } else {
        const res = await bridgeApi.create(payload)
        navigate(`/bridges/${res.data.id}`)
      }
    } catch (e) {
      setError(e.response?.data?.detail || '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="container-fluid px-4">
          <nav aria-label="breadcrumb" className="mb-2">
            <ol className="breadcrumb mb-0" style={{ fontSize: '0.85rem' }}>
              <li className="breadcrumb-item">
                <Link to="/" className="text-white-50 text-decoration-none">橋梁一覧</Link>
              </li>
              {isEdit && (
                <li className="breadcrumb-item">
                  <Link to={`/bridges/${id}`} className="text-white-50 text-decoration-none">橋梁詳細</Link>
                </li>
              )}
              <li className="breadcrumb-item active text-white">
                {isEdit ? '橋梁情報編集' : '橋梁新規登録'}
              </li>
            </ol>
          </nav>
          <h4 className="mb-0">
            <i className={`bi ${isEdit ? 'bi-pencil' : 'bi-plus-circle'} me-2`}></i>
            {isEdit ? '橋梁情報編集' : '橋梁新規登録'}
          </h4>
        </div>
      </div>

      <div className="container-fluid px-4">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-circle-fill"></i>{error}
            </div>
          )}

          {/* 基本情報 */}
          <div className="card mb-3">
            <div className="card-header">
              <i className="bi bi-info-circle me-2"></i>基本情報
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-semibold">管理番号 <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    name="management_number"
                    value={form.management_number}
                    onChange={handleChange}
                    required
                    placeholder="例: BR-001"
                  />
                </div>
                <div className="col-md-5">
                  <label className="form-label fw-semibold">橋梁名 <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    name="bridge_name"
                    value={form.bridge_name}
                    onChange={handleChange}
                    required
                    placeholder="例: 大川橋"
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">橋梁名（カナ）</label>
                  <input
                    type="text"
                    className="form-control"
                    name="bridge_name_kana"
                    value={form.bridge_name_kana}
                    onChange={handleChange}
                    placeholder="例: オオカワバシ"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">路線名</label>
                  <input
                    type="text"
                    className="form-control"
                    name="road_name"
                    value={form.road_name}
                    onChange={handleChange}
                    placeholder="例: 市道第1号線"
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">道路種別</label>
                  <select className="form-select" name="road_class" value={form.road_class} onChange={handleChange}>
                    <option value="">選択</option>
                    {ROAD_CLASSES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">管理者</label>
                  <input
                    type="text"
                    className="form-control"
                    name="administrator"
                    value={form.administrator}
                    onChange={handleChange}
                    placeholder="例: 〇〇市土木課"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">所在地</label>
                  <input
                    type="text"
                    className="form-control"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="例: 〇〇市中央区大川町1丁目"
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">
                    緯度 <small className="text-muted">(Google Map用)</small>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name="latitude"
                    value={form.latitude}
                    onChange={handleChange}
                    step="0.000001"
                    placeholder="例: 35.6762"
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">経度</label>
                  <input
                    type="number"
                    className="form-control"
                    name="longitude"
                    value={form.longitude}
                    onChange={handleChange}
                    step="0.000001"
                    placeholder="例: 139.6503"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 構造諸元 */}
          <div className="card mb-3">
            <div className="card-header">
              <i className="bi bi-rulers me-2"></i>構造諸元
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-semibold">橋梁形式</label>
                  <select className="form-select" name="structure_type" value={form.structure_type} onChange={handleChange}>
                    <option value="">選択</option>
                    {STRUCTURE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">上部工構造</label>
                  <select className="form-select" name="superstructure_type" value={form.superstructure_type} onChange={handleChange}>
                    <option value="">選択</option>
                    {SUPERSTRUCTURE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">下部工構造</label>
                  <select className="form-select" name="substructure_type" value={form.substructure_type} onChange={handleChange}>
                    <option value="">選択</option>
                    {SUBSTRUCTURE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">材料</label>
                  <select className="form-select" name="material" value={form.material} onChange={handleChange}>
                    <option value="">選択</option>
                    {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">建設年次</label>
                  <input
                    type="number"
                    className="form-control"
                    name="year_built"
                    value={form.year_built}
                    onChange={handleChange}
                    min="1800"
                    max="2099"
                    placeholder="例: 1985"
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">橋長 (m)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="bridge_length"
                    value={form.bridge_length}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                    placeholder="例: 45.5"
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">幅員 (m)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="width"
                    value={form.width}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                    placeholder="例: 8.5"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 備考 */}
          <div className="card mb-4">
            <div className="card-header">
              <i className="bi bi-chat-text me-2"></i>備考
            </div>
            <div className="card-body">
              <textarea
                className="form-control"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={4}
                placeholder="特記事項があれば入力してください"
              />
            </div>
          </div>

          <div className="d-flex gap-2 mb-4">
            <button type="submit" className="btn btn-primary px-4" disabled={saving}>
              {saving ? (
                <><span className="spinner-border spinner-border-sm me-2"></span>保存中...</>
              ) : (
                <><i className="bi bi-check-lg me-1"></i>{isEdit ? '更新する' : '登録する'}</>
              )}
            </button>
            <Link to={isEdit ? `/bridges/${id}` : '/'} className="btn btn-outline-secondary px-4">
              <i className="bi bi-x-lg me-1"></i>キャンセル
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
