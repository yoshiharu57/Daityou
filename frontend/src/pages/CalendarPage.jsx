import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { projectsApi } from '../api'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, isSameDay, isSameMonth, parseISO, addMonths, subMonths,
  differenceInDays
} from 'date-fns'
import { ja } from 'date-fns/locale'

const EVENT_COLOR = {
  deadline: { bg: '#fee2e2', border: '#dc2626', text: '#991b1b', label: '工期終了' },
  start: { bg: '#d1fae5', border: '#059669', text: '#065f46', label: '工期開始' },
  contract: { bg: '#dbeafe', border: '#2563a8', text: '#1e40af', label: '契約' },
}

export default function CalendarPage() {
  const [projects, setProjects] = useState([])
  const [viewDate, setViewDate] = useState(new Date())
  const [selected, setSelected] = useState(null)
  const [eventFilter, setEventFilter] = useState({ deadline: true, start: true, contract: false })

  useEffect(() => {
    projectsApi.list().then(r => setProjects(r.data))
  }, [])

  const events = useMemo(() => {
    const list = []
    projects.forEach(p => {
      if (p.end_date && eventFilter.deadline)
        list.push({ date: parseISO(p.end_date), type: 'deadline', project: p })
      if (p.start_date && eventFilter.start)
        list.push({ date: parseISO(p.start_date), type: 'start', project: p })
      if (p.contract_date && eventFilter.contract)
        list.push({ date: parseISO(p.contract_date), type: 'contract', project: p })
    })
    return list
  }, [projects, eventFilter])

  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const startPad = getDay(monthStart)
  const endPad = 6 - getDay(monthEnd)
  const paddedDays = [
    ...Array(startPad).fill(null),
    ...days,
    ...Array(endPad).fill(null),
  ]

  const eventsOnDay = (day) => day ? events.filter(e => isSameDay(e.date, day)) : []

  const upcomingDeadlines = projects
    .filter(p => p.end_date && p.status === '進行中')
    .map(p => ({ ...p, days: differenceInDays(parseISO(p.end_date), new Date()) }))
    .filter(p => p.days >= -7 && p.days <= 60)
    .sort((a, b) => a.days - b.days)

  return (
    <div className="container-fluid py-4 px-3 px-md-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0"><i className="bi bi-calendar3 me-2 text-primary"></i>案件カレンダー</h4>
        <div className="d-flex gap-2 align-items-center flex-wrap">
          {/* Event filter */}
          {Object.entries(EVENT_COLOR).map(([key, c]) => (
            <div key={key} className="form-check form-check-inline mb-0">
              <input className="form-check-input" type="checkbox" id={`filter-${key}`}
                checked={eventFilter[key]} onChange={() => setEventFilter(f => ({ ...f, [key]: !f[key] }))} />
              <label className="form-check-label small" htmlFor={`filter-${key}`}
                style={{ color: c.border, fontWeight: 600 }}>{c.label}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="row g-4">
        {/* Calendar */}
        <div className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-2">
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setViewDate(d => subMonths(d, 1))}>
                <i className="bi bi-chevron-left"></i>
              </button>
              <h5 className="mb-0 fw-bold">{format(viewDate, 'yyyy年 M月', { locale: ja })}</h5>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setViewDate(d => addMonths(d, 1))}>
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
            <div className="card-body p-2">
              {/* Day headers */}
              <div className="row g-0 mb-1">
                {['日', '月', '火', '水', '木', '金', '土'].map((d, i) => (
                  <div key={d} className="col text-center small fw-bold py-1"
                    style={{ color: i === 0 ? '#dc2626' : i === 6 ? '#2563a8' : '#666' }}>
                    {d}
                  </div>
                ))}
              </div>
              {/* Calendar grid */}
              <div className="row g-0" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {paddedDays.map((day, idx) => {
                  const dayEvents = eventsOnDay(day)
                  const isToday = day && isSameDay(day, new Date())
                  const isSelected = day && selected && isSameDay(day, selected)
                  const dow = idx % 7
                  return (
                    <div key={idx}
                      className={`border rounded-1 p-1 ${day ? 'cursor-pointer' : ''} ${isSelected ? 'border-primary' : 'border-light'}`}
                      style={{
                        minHeight: 70,
                        background: isSelected ? '#eff6ff' : isToday ? '#fefce8' : day ? '#fff' : '#f9fafb',
                        cursor: day ? 'pointer' : 'default',
                      }}
                      onClick={() => day && setSelected(isSameDay(day, selected || new Date(-1)) ? null : day)}>
                      {day && (
                        <>
                          <div className={`small fw-bold mb-1 ${isToday ? 'rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center' : ''}`}
                            style={isToday ? { width: 22, height: 22, fontSize: '0.75rem' } : {
                              color: dow === 0 ? '#dc2626' : dow === 6 ? '#2563a8' : '#333'
                            }}>
                            {format(day, 'd')}
                          </div>
                          <div>
                            {dayEvents.slice(0, 2).map((e, i) => {
                              const c = EVENT_COLOR[e.type]
                              return (
                                <div key={i} className="rounded px-1 mb-1 text-truncate"
                                  style={{ background: c.bg, borderLeft: `2px solid ${c.border}`, color: c.text, fontSize: '0.65rem', lineHeight: 1.3 }}>
                                  {e.project.project_name}
                                </div>
                              )
                            })}
                            {dayEvents.length > 2 && (
                              <div className="text-muted" style={{ fontSize: '0.6rem' }}>+{dayEvents.length - 2}件</div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Selected day detail */}
          {selected && (
            <div className="card border-0 shadow-sm mt-3">
              <div className="card-header bg-white border-bottom py-2">
                <span className="fw-bold">{format(selected, 'M月d日（E）', { locale: ja })} のイベント</span>
              </div>
              <div className="card-body p-2">
                {eventsOnDay(selected).length === 0 ? (
                  <div className="text-muted small text-center py-2">イベントなし</div>
                ) : (
                  eventsOnDay(selected).map((e, i) => {
                    const c = EVENT_COLOR[e.type]
                    return (
                      <div key={i} className="d-flex align-items-center gap-2 mb-2 p-2 rounded"
                        style={{ background: c.bg, borderLeft: `3px solid ${c.border}` }}>
                        <span className="badge" style={{ background: c.border, fontSize: '0.65rem' }}>{c.label}</span>
                        <Link to={`/projects/${e.project.id}`} className="text-decoration-none fw-semibold small" style={{ color: c.text }}>
                          {e.project.project_name}
                        </Link>
                        <span className="text-muted small ms-auto">{e.project.business_number}</span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Upcoming deadlines sidebar */}
        <div className="col-12 col-xl-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom py-2 fw-bold">
              <i className="bi bi-clock-history me-2 text-danger"></i>工期終了 直近60日
            </div>
            <div className="card-body p-0">
              {upcomingDeadlines.length === 0 ? (
                <div className="text-center text-muted py-4 small">該当案件なし</div>
              ) : (
                <div className="list-group list-group-flush">
                  {upcomingDeadlines.map(p => (
                    <Link key={p.id} to={`/projects/${p.id}`}
                      className="list-group-item list-group-item-action px-3 py-2"
                      style={{ background: p.days < 0 ? '#fff0f0' : p.days <= 14 ? '#fffbeb' : '#fff' }}>
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1 me-2">
                          <div className="small fw-semibold text-dark lh-sm">{p.project_name}</div>
                          <div className="text-muted" style={{ fontSize: '0.72rem' }}>{p.client_organization}</div>
                        </div>
                        <div className="text-end flex-shrink-0">
                          <div className={`fw-bold ${p.days < 0 ? 'text-danger' : p.days <= 14 ? 'text-warning' : 'text-muted'}`}
                            style={{ fontSize: '0.8rem' }}>
                            {p.days < 0 ? `${Math.abs(p.days)}日超過` : `残${p.days}日`}
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                            {format(parseISO(p.end_date), 'M/d')}
                          </div>
                        </div>
                      </div>
                      <div className="mt-1">
                        <div className="progress" style={{ height: 5 }}>
                          <div className={`progress-bar ${p.progress_rate >= 100 ? 'bg-success' : p.days < 0 ? 'bg-danger' : 'bg-primary'}`}
                            style={{ width: `${p.progress_rate}%` }} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="card border-0 shadow-sm mt-3">
            <div className="card-body py-2 px-3">
              <div className="small fw-semibold text-muted mb-2">凡例</div>
              {Object.entries(EVENT_COLOR).map(([key, c]) => (
                <div key={key} className="d-flex align-items-center gap-2 mb-1">
                  <div className="rounded" style={{ width: 12, height: 12, background: c.border, flexShrink: 0 }}></div>
                  <span className="small">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
