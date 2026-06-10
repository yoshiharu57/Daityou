import React from 'react'
import { HEALTH_LABELS, formatDate, formatDateFull, googleMapsUrl } from '../api'

function Field({ label, value, unit }) {
  return (
    <div className="ledger-field mb-3">
      <label className="d-block">{label}</label>
      <div className="value">
        {value !== null && value !== undefined && value !== ''
          ? <>{value}{unit ? <small className="text-muted ms-1">{unit}</small> : null}</>
          : <span className="text-muted">—</span>
        }
      </div>
    </div>
  )
}

export default function BridgeLedger({ bridge, latestInspection }) {
  const health = HEALTH_LABELS[latestInspection?.health_rating] || HEALTH_LABELS['未判定']
  const mapsUrl = googleMapsUrl(bridge.latitude, bridge.longitude, bridge.bridge_name)
  const age = bridge.year_built ? (new Date().getFullYear() - bridge.year_built) : null

  return (
    <div>
      <div className="row g-3">
        {/* 基本情報 */}
        <div className="col-lg-8">
          <div className="card h-100">
            <div className="card-header">
              <i className="bi bi-card-list me-2"></i>橋梁台帳
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p className="section-title">識別情報</p>
                  <Field label="管理番号" value={bridge.management_number} />
                  <Field label="橋梁名" value={bridge.bridge_name} />
                  <Field label="橋梁名（カナ）" value={bridge.bridge_name_kana} />
                  <Field label="路線名" value={bridge.road_name} />
                  <Field label="道路種別" value={bridge.road_class} />
                  <Field label="管理者" value={bridge.administrator} />
                </div>
                <div className="col-md-6">
                  <p className="section-title">所在地</p>
                  <Field label="所在地" value={bridge.location} />
                  <div className="ledger-field mb-3">
                    <label className="d-block">位置情報</label>
                    <div className="value">
                      {bridge.latitude && bridge.longitude ? (
                        <div>
                          <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                            {bridge.latitude}, {bridge.longitude}
                          </div>
                          {mapsUrl && (
                            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="maps-link mt-1 d-inline-block">
                              <i className="bi bi-geo-alt-fill text-danger me-1"></i>Google Mapで確認する
                            </a>
                          )}
                        </div>
                      ) : <span className="text-muted">—</span>}
                    </div>
                  </div>
                </div>
              </div>

              <hr />

              <div className="row">
                <div className="col-md-6">
                  <p className="section-title">構造諸元</p>
                  <Field label="橋梁形式" value={bridge.structure_type} />
                  <Field label="上部工構造" value={bridge.superstructure_type} />
                  <Field label="下部工構造" value={bridge.substructure_type} />
                  <Field label="材料" value={bridge.material} />
                  <div className="row">
                    <div className="col-6">
                      <Field label="橋長" value={bridge.bridge_length} unit="m" />
                    </div>
                    <div className="col-6">
                      <Field label="幅員" value={bridge.width} unit="m" />
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <p className="section-title">建設・点検情報</p>
                  <div className="ledger-field mb-3">
                    <label className="d-block">建設年次</label>
                    <div className="value">
                      {bridge.year_built ? (
                        <>{bridge.year_built}年
                          {age !== null && (
                            <small className="text-muted ms-2">（築{age}年）</small>
                          )}
                        </>
                      ) : <span className="text-muted">—</span>}
                    </div>
                  </div>
                  <Field
                    label="前回点検年月"
                    value={latestInspection ? formatDate(latestInspection.inspection_date) : null}
                  />
                  <Field
                    label="次回点検予定日"
                    value={latestInspection?.next_inspection_date ? formatDateFull(latestInspection.next_inspection_date) : null}
                  />
                  <div className="ledger-field mb-3">
                    <label className="d-block">健全性区分</label>
                    <div className="value">
                      {latestInspection ? (
                        <span className={`health-badge ${health.color}`}>
                          {latestInspection.health_rating || '未判定'}: {health.label}
                        </span>
                      ) : <span className="text-muted">未点検</span>}
                    </div>
                  </div>
                </div>
              </div>

              {bridge.notes && (
                <>
                  <hr />
                  <p className="section-title">備考</p>
                  <p className="mb-0 text-muted" style={{ fontSize: '0.92rem', whiteSpace: 'pre-wrap' }}>
                    {bridge.notes}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* サイドバー: 最新点検情報 */}
        <div className="col-lg-4">
          <div className="card mb-3">
            <div className="card-header">
              <i className="bi bi-clipboard2-check me-2"></i>最新点検情報
            </div>
            <div className="card-body">
              {latestInspection ? (
                <>
                  <div className="text-center mb-3">
                    <div className={`health-badge ${health.color} px-4 py-2`} style={{ fontSize: '1.1rem' }}>
                      健全性 {latestInspection.health_rating || '未判定'}
                    </div>
                    <div className="text-muted mt-1" style={{ fontSize: '0.82rem' }}>{health.label}</div>
                  </div>
                  <table className="table table-sm table-borderless mb-0">
                    <tbody>
                      <tr>
                        <td className="text-muted" style={{ width: '50%' }}>点検年月日</td>
                        <td>{formatDateFull(latestInspection.inspection_date)}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">点検種別</td>
                        <td>{latestInspection.inspection_type || '—'}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">点検業者</td>
                        <td>{latestInspection.inspector_company || '—'}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">点検者</td>
                        <td>{latestInspection.inspector_name || '—'}</td>
                      </tr>
                      {latestInspection.repair_urgency && (
                        <tr>
                          <td className="text-muted">補修緊急度</td>
                          <td className="text-danger fw-semibold">{latestInspection.repair_urgency}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  {latestInspection.overall_findings && (
                    <div className="mt-3 p-2 bg-light rounded" style={{ fontSize: '0.85rem' }}>
                      <strong>所見:</strong>
                      <p className="mb-0 mt-1 text-muted" style={{ whiteSpace: 'pre-wrap' }}>
                        {latestInspection.overall_findings}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-state py-3">
                  <i className="bi bi-clipboard2 d-block fs-2 text-muted mb-2"></i>
                  <p className="mb-0 text-muted">点検記録がありません</p>
                </div>
              )}
            </div>
          </div>

          {/* 橋梁諸元サマリ */}
          <div className="card">
            <div className="card-header">
              <i className="bi bi-graph-up me-2"></i>諸元サマリ
            </div>
            <div className="card-body p-0">
              <table className="table table-sm mb-0">
                <tbody>
                  <tr>
                    <td className="text-muted ps-3">橋長</td>
                    <td className="text-end pe-3">
                      {bridge.bridge_length ? `${bridge.bridge_length} m` : '—'}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted ps-3">幅員</td>
                    <td className="text-end pe-3">
                      {bridge.width ? `${bridge.width} m` : '—'}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted ps-3">橋梁形式</td>
                    <td className="text-end pe-3">{bridge.structure_type || '—'}</td>
                  </tr>
                  <tr>
                    <td className="text-muted ps-3">上部工構造</td>
                    <td className="text-end pe-3">{bridge.superstructure_type || '—'}</td>
                  </tr>
                  <tr>
                    <td className="text-muted ps-3">下部工構造</td>
                    <td className="text-end pe-3">{bridge.substructure_type || '—'}</td>
                  </tr>
                  <tr>
                    <td className="text-muted ps-3">材料</td>
                    <td className="text-end pe-3">{bridge.material || '—'}</td>
                  </tr>
                  <tr>
                    <td className="text-muted ps-3">建設年</td>
                    <td className="text-end pe-3">
                      {bridge.year_built ? `${bridge.year_built}年` : '—'}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted ps-3">橋齢</td>
                    <td className="text-end pe-3">
                      {age !== null ? `${age}年` : '—'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
