import React, { useState, useEffect, useRef, useCallback } from 'react'
import { photoApi, MEMBER_TYPES, DAMAGE_TYPES, formatDateFull } from '../api'

const PHOTO_TYPES = ['全景', '橋名板', '近景', '損傷箇所', '補修前', '補修後', 'その他']

function PhotoModal({ photo, inspectionId, onClose }) {
  const url = photoApi.getUrl(inspectionId, photo.filename)
  const isPdf = photo.filename?.toLowerCase().endsWith('.pdf')
  return (
    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.85)', zIndex: 1050 }} onClick={onClose}>
      <div className="modal-dialog modal-xl modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content bg-dark border-0">
          <div className="modal-header border-secondary py-2">
            <div>
              <h6 className="modal-title text-white mb-0">
                {photo.original_filename || photo.filename}
              </h6>
              <small className="text-muted">
                {photo.photo_type && <span className="me-2">{photo.photo_type}</span>}
                {photo.member_type && <span className="me-2">{photo.member_type}</span>}
                {photo.damage_type && <span>{photo.damage_type}</span>}
              </small>
            </div>
            <button className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body text-center p-2">
            {isPdf ? (
              <iframe src={url} style={{ width: '100%', height: '70vh', border: 'none' }} title="PDF" />
            ) : (
              <img src={url} alt={photo.caption || ''} style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain' }} />
            )}
            {photo.caption && (
              <p className="text-white-50 mt-2 mb-0" style={{ fontSize: '0.9rem' }}>{photo.caption}</p>
            )}
          </div>
          <div className="modal-footer border-secondary py-2">
            <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-light">
              <i className="bi bi-download me-1"></i>ダウンロード
            </a>
            <button className="btn btn-sm btn-secondary" onClick={onClose}>閉じる</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function UploadModal({ inspectionId, onClose, onUploaded }) {
  const [files, setFiles] = useState([])
  const [photoType, setPhotoType] = useState('')
  const [memberType, setMemberType] = useState('')
  const [damageType, setDamageType] = useState('')
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef()

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = Array.from(e.dataTransfer.files).filter(f =>
      f.type.startsWith('image/') || f.type === 'application/pdf'
    )
    setFiles(prev => [...prev, ...dropped])
  }

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files)
    setFiles(prev => [...prev, ...selected])
  }

  const removeFile = (i) => setFiles(files.filter((_, idx) => idx !== i))

  const handleUpload = async () => {
    if (!files.length) return
    setUploading(true)
    try {
      const fd = new FormData()
      files.forEach(f => fd.append('files', f))
      if (photoType) fd.append('photo_type', photoType)
      if (memberType) fd.append('member_type', memberType)
      if (damageType) fd.append('damage_type', damageType)
      await photoApi.upload(inspectionId, fd)
      onUploaded()
      onClose()
    } catch (err) {
      alert(err.response?.data?.detail || 'アップロードに失敗しました')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title"><i className="bi bi-cloud-upload me-2"></i>写真アップロード</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div
              className={`upload-area mb-3 ${dragOver ? 'drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <i className="bi bi-cloud-arrow-up"></i>
              <p className="mt-2 mb-1 fw-semibold">ここにドラッグ＆ドロップ</p>
              <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                またはクリックしてファイルを選択（JPG・PNG・PDF対応）
              </p>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept="image/*,.pdf"
                className="d-none"
                onChange={handleFileChange}
              />
            </div>

            {files.length > 0 && (
              <div className="mb-3">
                <div className="d-flex flex-wrap gap-2">
                  {files.map((f, i) => (
                    <div key={i} className="position-relative">
                      {f.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(f)}
                          alt={f.name}
                          className="photo-thumb"
                          style={{ cursor: 'default' }}
                        />
                      ) : (
                        <div className="photo-thumb d-flex flex-column align-items-center justify-content-center bg-light" style={{ cursor: 'default' }}>
                          <i className="bi bi-file-pdf text-danger fs-3"></i>
                          <small className="text-muted" style={{ fontSize: '0.7rem', wordBreak: 'break-all', maxWidth: '120px' }}>
                            {f.name}
                          </small>
                        </div>
                      )}
                      <button
                        className="btn btn-danger btn-sm position-absolute top-0 end-0 p-0"
                        style={{ width: '20px', height: '20px', fontSize: '0.7rem', lineHeight: 1 }}
                        onClick={(e) => { e.stopPropagation(); removeFile(i) }}
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </div>
                  ))}
                </div>
                <small className="text-muted">{files.length}ファイル選択中</small>
              </div>
            )}

            <div className="row g-2">
              <div className="col-md-4">
                <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>写真区分</label>
                <select className="form-select form-select-sm" value={photoType} onChange={(e) => setPhotoType(e.target.value)}>
                  <option value="">選択</option>
                  {PHOTO_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>対象部材</label>
                <select className="form-select form-select-sm" value={memberType} onChange={(e) => setMemberType(e.target.value)}>
                  <option value="">選択</option>
                  {MEMBER_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>損傷種別</label>
                <select className="form-select form-select-sm" value={damageType} onChange={(e) => setDamageType(e.target.value)}>
                  <option value="">選択</option>
                  {DAMAGE_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>キャンセル</button>
            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
            >
              {uploading ? (
                <><span className="spinner-border spinner-border-sm me-1"></span>アップロード中...</>
              ) : (
                <><i className="bi bi-cloud-upload me-1"></i>{files.length}件をアップロード</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PhotoGallery({ bridge, inspections, selectedInspection, onSelectInspection, onRefresh }) {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(false)
  const [viewPhoto, setViewPhoto] = useState(null)
  const [showUpload, setShowUpload] = useState(false)
  const [filterType, setFilterType] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  const loadPhotos = useCallback(async () => {
    if (!selectedInspection) return
    setLoading(true)
    try {
      const res = await photoApi.listByInspection(selectedInspection.id)
      setPhotos(res.data)
    } catch {
      setPhotos([])
    } finally {
      setLoading(false)
    }
  }, [selectedInspection])

  useEffect(() => { loadPhotos() }, [loadPhotos])

  const handleDelete = async (photoId) => {
    try {
      await photoApi.delete(photoId)
      setDeleteConfirmId(null)
      loadPhotos()
    } catch {
      alert('削除に失敗しました')
    }
  }

  const filteredPhotos = filterType
    ? photos.filter(p => p.photo_type === filterType || p.member_type === filterType || p.damage_type === filterType)
    : photos

  const isPdf = (filename) => filename?.toLowerCase().endsWith('.pdf')

  return (
    <div className="row g-3">
      {/* 左: 点検選択 */}
      <div className="col-lg-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0 text-primary fw-bold">
            <i className="bi bi-calendar3 me-1"></i>点検を選択
          </h6>
        </div>
        {inspections.length === 0 ? (
          <div className="text-muted text-center py-3" style={{ fontSize: '0.88rem' }}>
            点検記録がありません
          </div>
        ) : (
          <div className="list-group">
            {inspections.map((insp) => (
              <button
                key={insp.id}
                className={`list-group-item list-group-item-action ${selectedInspection?.id === insp.id ? 'active' : ''}`}
                onClick={() => onSelectInspection(insp)}
                style={{ borderLeft: selectedInspection?.id === insp.id ? '4px solid var(--primary)' : '4px solid transparent' }}
              >
                <div className="fw-semibold" style={{ fontSize: '0.88rem' }}>
                  {formatDateFull(insp.inspection_date)}
                </div>
                <div className="text-muted" style={{ fontSize: '0.78rem' }}>{insp.inspection_type}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 右: 写真ギャラリー */}
      <div className="col-lg-9">
        {selectedInspection ? (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2">
                <h6 className="mb-0 text-primary fw-bold">
                  <i className="bi bi-images me-1"></i>
                  {formatDateFull(selectedInspection.inspection_date)}の写真
                </h6>
                <span className="badge bg-secondary rounded-pill">{photos.length}枚</span>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                <select
                  className="form-select form-select-sm"
                  style={{ width: 'auto' }}
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">すべて表示</option>
                  <optgroup label="写真区分">
                    {PHOTO_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </optgroup>
                  <optgroup label="部材種別">
                    {MEMBER_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
                  </optgroup>
                </select>
                <button className="btn btn-primary btn-sm" onClick={() => setShowUpload(true)}>
                  <i className="bi bi-cloud-upload me-1"></i>写真追加
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-spinner">
                <div className="spinner-border text-primary"></div>
              </div>
            ) : filteredPhotos.length === 0 ? (
              <div className="empty-state">
                <i className="bi bi-camera d-block fs-2 text-muted mb-2"></i>
                <p className="text-muted mb-2">写真がありません</p>
                <button className="btn btn-outline-primary btn-sm" onClick={() => setShowUpload(true)}>
                  <i className="bi bi-cloud-upload me-1"></i>写真をアップロード
                </button>
              </div>
            ) : (
              <div className="row g-3">
                {filteredPhotos.map((photo) => {
                  const url = photoApi.getUrl(selectedInspection.id, photo.filename)
                  const pdf = isPdf(photo.filename)
                  return (
                    <div key={photo.id} className="col-6 col-md-4 col-lg-3">
                      <div className="photo-card">
                        <div className="position-relative">
                          {pdf ? (
                            <div
                              className="photo-thumb d-flex flex-column align-items-center justify-content-center bg-light w-100 mx-auto"
                              style={{ cursor: 'pointer' }}
                              onClick={() => setViewPhoto(photo)}
                            >
                              <i className="bi bi-file-pdf text-danger fs-2"></i>
                              <small className="text-muted text-center" style={{ fontSize: '0.7rem', wordBreak: 'break-all', padding: '0 4px' }}>
                                {photo.original_filename || photo.filename}
                              </small>
                            </div>
                          ) : (
                            <img
                              src={url}
                              alt={photo.caption || ''}
                              className="photo-thumb w-100"
                              onClick={() => setViewPhoto(photo)}
                            />
                          )}
                          <button
                            className="btn btn-danger btn-sm position-absolute top-0 end-0 p-0"
                            style={{ width: '22px', height: '22px', fontSize: '0.7rem', lineHeight: 1, opacity: 0.85 }}
                            onClick={() => setDeleteConfirmId(photo.id)}
                          >
                            <i className="bi bi-x"></i>
                          </button>
                        </div>
                        <div className="photo-caption">
                          {photo.photo_type && <span className="badge bg-primary me-1" style={{ fontSize: '0.65rem' }}>{photo.photo_type}</span>}
                          {photo.member_type && <span className="badge bg-secondary me-1" style={{ fontSize: '0.65rem' }}>{photo.member_type}</span>}
                          {photo.caption && <div className="mt-1">{photo.caption}</div>}
                          {!photo.photo_type && !photo.member_type && !photo.caption && (
                            <span className="text-muted">{photo.original_filename || photo.filename}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <i className="bi bi-hand-index d-block fs-2 text-muted mb-2"></i>
            <p className="text-muted">左側から点検を選択してください</p>
          </div>
        )}
      </div>

      {/* 写真ビューモーダル */}
      {viewPhoto && (
        <PhotoModal
          photo={viewPhoto}
          inspectionId={selectedInspection.id}
          onClose={() => setViewPhoto(null)}
        />
      )}

      {/* アップロードモーダル */}
      {showUpload && selectedInspection && (
        <UploadModal
          inspectionId={selectedInspection.id}
          onClose={() => setShowUpload(false)}
          onUploaded={() => { loadPhotos(); onRefresh() }}
        />
      )}

      {/* 削除確認 */}
      {deleteConfirmId && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title"><i className="bi bi-exclamation-triangle me-2"></i>写真削除の確認</h5>
                <button className="btn-close" onClick={() => setDeleteConfirmId(null)}></button>
              </div>
              <div className="modal-body">
                <p className="text-danger mb-0">この写真を削除します。元に戻すことはできません。</p>
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
