import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { bridgeApi, inspectionApi, HEALTH_LABELS, formatDate, formatDateFull, googleMapsUrl } from '../api'
import BridgeLedger from '../components/BridgeLedger'
import InspectionList from '../components/InspectionList'
import PhotoGallery from '../components/PhotoGallery'

export default function BridgeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [bridge, setBridge] = useState(null)
  const [inspections, setInspections] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('ledger')
  const [selectedInspection, setSelectedInspection] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [bRes, iRes] = await Promise.all([
        bridgeApi.get(id),
        inspectionApi.listByBridge(id),
      ])
      setBridge(bRes.data)
      setInspections(iRes.data)
      if (iRes.data.length > 0) setSelectedInspection(iRes.data[0])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { loadData() }, [loadData])

  const handleDelete = async () => {
    try {
      await bridgeApi.delete(id)
      navigate('/')
    } catch (e) {
      alert('削除に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border text-primary"></div>
      </div>
    )
  }

  if (!bridge) return <div className="container-fluid px-4 py-4">橋梁が見つかりません</div>

  const latestInspection = inspections[0]
  const health = HEALTH_LABELS[latestInspection?.health_rating] || HEALTH_LABELS['未判定']
  const mapsUrl = googleMapsUrl(bridge.latitude, bridge.longitude, bridge.bridge_name)

  const tabs = [
    { key: 'ledger', icon: 'bi-card-list', label: '橋梁台帳' },
    { key: 'inspection', icon: 'bi-clipboard2-check', label: `点検記録 (${inspections.length})` },
    { key: 'photos', icon: 'bi-images', label: '写真' },
  ]

  return (
    <div>
      {/* ヘッダー */}
      <div className="page-header">
        <div className="container-fluid px-4">
          <nav aria-label="breadcrumb" className="mb-2">
            <ol className="breadcrumb mb-0" style={{ fontSize: '0.85rem' }}>
              <li className="breadcrumb-item">
                <Link to="/" className="text-white-50 text-decoration-none">橋梁一覧</Link>
              </li>
              <li className="breadcrumb-item active text-white">{bridge.bridge_name}</li>
            </ol>
          </nav>
          <div className="d-flex align-items-start justify-content-between flex-wrap gap-2">
            <div>
              <h4 className="mb-1 d-flex align-items-center gap-2">
                <i className="bi bi-building"></i>
                {bridge.bridge_name}
              </h4>
              <div className="d-flex align-items-center gap-3 flex-wrap" style={{ fontSize: '0.88rem' }}>
                <span className="text-white-50">
                  <code className="text-white bg-transparent">{bridge.management_number}</code>
                </span>
                {bridge.road_name && (
                  <span className="text-white-50">
                    <i className="bi bi-signpost me-1"></i>{bridge.road_name}
                  </span>
                )}
                {bridge.location && (
                  <span className="text-white-50">
                    <i className="bi bi-geo me-1"></i>{bridge.location}
                  </span>
                )}
                {mapsUrl && (
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                    className="text-warning text-decoration-none"
                    style={{ fontSize: '0.85rem' }}>
                    <i className="bi bi-geo-alt-fill me-1"></i>Google Mapで見る
                  </a>
                )}
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className={`health-badge ${health.color} fs-6 px-3 py-1`}>
                健全性 {latestInspection?.health_rating || '未判定'}
              </span>
              <Link to={`/bridges/${id}/edit`} className="btn btn-warning btn-sm">
                <i className="bi bi-pencil me-1"></i>編集
              </Link>
              <button className="btn btn-danger btn-sm" onClick={() => setShowDeleteConfirm(true)}>
                <i className="bi bi-trash me-1"></i>削除
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid px-4">
        {/* タブ */}
        <ul className="nav tab-nav mb-4">
          {tabs.map(t => (
            <li className="nav-item" key={t.key}>
              <button
                className={`nav-link ${activeTab === t.key ? 'active' : ''}`}
                onClick={() => setActiveTab(t.key)}
              >
                <i className={`bi ${t.icon} me-1`}></i>{t.label}
              </button>
            </li>
          ))}
        </ul>

        {activeTab === 'ledger' && (
          <BridgeLedger bridge={bridge} latestInspection={latestInspection} />
        )}

        {activeTab === 'inspection' && (
          <InspectionList
            bridge={bridge}
            inspections={inspections}
            selectedInspection={selectedInspection}
            onSelect={setSelectedInspection}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'photos' && (
          <PhotoGallery
            bridge={bridge}
            inspections={inspections}
            selectedInspection={selectedInspection}
            onSelectInspection={setSelectedInspection}
            onRefresh={loadData}
          />
        )}
      </div>

      {/* 削除確認モーダル */}
      {showDeleteConfirm && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title"><i className="bi bi-exclamation-triangle me-2"></i>削除の確認</h5>
                <button className="btn-close" onClick={() => setShowDeleteConfirm(false)}></button>
              </div>
              <div className="modal-body">
                <p className="mb-1">「<strong>{bridge.bridge_name}</strong>」を削除します。</p>
                <p className="text-danger mb-0">
                  <i className="bi bi-exclamation-circle me-1"></i>
                  点検記録・写真を含む全データが削除されます。この操作は取り消せません。
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>キャンセル</button>
                <button className="btn btn-danger" onClick={handleDelete}>
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
