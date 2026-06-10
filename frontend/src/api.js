import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

export const bridgeApi = {
  list: (search) => api.get('/bridges/', { params: search ? { search } : {} }),
  get: (id) => api.get(`/bridges/${id}`),
  create: (data) => api.post('/bridges/', data),
  update: (id, data) => api.put(`/bridges/${id}`, data),
  delete: (id) => api.delete(`/bridges/${id}`),
}

export const inspectionApi = {
  listByBridge: (bridgeId) => api.get(`/inspections/bridge/${bridgeId}`),
  get: (id) => api.get(`/inspections/${id}`),
  create: (data) => api.post('/inspections/', data),
  update: (id, data) => api.put(`/inspections/${id}`, data),
  delete: (id) => api.delete(`/inspections/${id}`),
  addDamage: (inspectionId, data) => api.post(`/inspections/${inspectionId}/damage`, data),
  deleteDamage: (inspectionId, damageId) => api.delete(`/inspections/${inspectionId}/damage/${damageId}`),
}

export const photoApi = {
  listByInspection: (inspectionId) => api.get(`/photos/inspection/${inspectionId}`),
  upload: (inspectionId, formData) =>
    api.post(`/photos/upload/${inspectionId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getUrl: (inspectionId, filename) => `/api/photos/file/${inspectionId}/${filename}`,
  update: (photoId, formData) =>
    api.put(`/photos/${photoId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (photoId) => api.delete(`/photos/${photoId}`),
}

export const HEALTH_LABELS = {
  I: { label: '健全', color: 'health-I', description: '損傷が認められないか、損傷が軽微' },
  II: { label: '予防保全段階', color: 'health-II', description: '損傷が進行しており予防保全の観点から措置が必要' },
  III: { label: '早期措置段階', color: 'health-III', description: '損傷が進行しており早期に措置を講ずべき' },
  IV: { label: '緊急措置段階', color: 'health-IV', description: '損傷の状況が深刻で緊急に措置を講ずべき' },
  '未判定': { label: '未判定', color: 'health-未判定', description: '未判定' },
}

export const MEMBER_TYPES = [
  '主桁', '床版', '横桁', '対傾構', '横構', '橋脚', '橋台', '基礎', '支承', '伸縮装置',
  '排水装置', '高欄・防護柵', '舗装', '照明', '銘板', 'その他',
]

export const DAMAGE_TYPES = [
  'ひび割れ', '剥離・鉄筋露出', '変形・欠損', '腐食', '防食機能の劣化', '漏水・遊離石灰',
  '支承の機能障害', '洗掘', '沈下・移動・傾斜', '補修・補強材の損傷', 'その他',
]

export const STRUCTURE_TYPES = [
  'RC単純T桁橋', 'RC連続T桁橋', 'RC床版橋', 'PC単純桁橋', 'PC連続桁橋',
  '鋼単純桁橋', '鋼連続桁橋', 'ラーメン橋', 'アーチ橋', 'トラス橋', '吊橋', 'その他',
]

export const SUPERSTRUCTURE_TYPES = [
  'RC桁橋', 'RC床版橋', 'PC桁橋', 'PC床版橋', '鋼桁橋', '鋼床版橋',
  '鋼ラーメン橋', 'RCラーメン橋', 'PCラーメン橋', 'アーチ橋', 'トラス橋',
  '斜張橋', '吊橋', 'その他',
]

export const SUBSTRUCTURE_TYPES = [
  '逆T式橋台', 'ボックス式橋台', '重力式橋台', 'もたれ式橋台', '杭式橋台',
  'T型橋脚', '壁式橋脚', '張り出し式橋脚', '円形断面橋脚', '中空橋脚',
  'ラーメン式橋脚', '直接基礎', '場所打ち杭基礎', '既製杭基礎',
  '鋼管矢板基礎', 'ケーソン基礎', 'その他',
]

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    return `${d.getFullYear()}年${d.getMonth() + 1}月`
  } catch {
    return dateStr
  }
}

export function formatDateFull(dateStr) {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
  } catch {
    return dateStr
  }
}

export function googleMapsUrl(lat, lng, name) {
  if (!lat || !lng) return null
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
}
