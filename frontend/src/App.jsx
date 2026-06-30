import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import ProjectListPage from './pages/ProjectListPage'
import ProjectFormPage from './pages/ProjectFormPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import PipelinePage from './pages/PipelinePage'
import EngineerPage from './pages/EngineerPage'
import ReportPage from './pages/ReportPage'
import CalendarPage from './pages/CalendarPage'

export default function App() {
  const location = useLocation()
  const isActive = (path) =>
    (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path))
      ? 'nav-link active fw-semibold' : 'nav-link'

  return (
    <div className="min-vh-100 d-flex flex-column">
      <nav className="navbar navbar-expand-lg navbar-dark" style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #2563a8 100%)' }}>
        <div className="container-fluid px-3">
          <Link className="navbar-brand d-flex align-items-center gap-2 me-4" to="/">
            <i className="bi bi-briefcase-fill fs-5"></i>
            <span className="fw-bold" style={{ fontSize: '0.97rem' }}>建設コンサル 案件管理</span>
          </Link>
          <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navMenu">
            <ul className="navbar-nav gap-1 me-auto">
              <li className="nav-item">
                <Link className={isActive('/')} to="/">
                  <i className="bi bi-speedometer2 me-1"></i>ダッシュボード
                </Link>
              </li>
              <li className="nav-item">
                <Link className={isActive('/projects')} to="/projects">
                  <i className="bi bi-table me-1"></i>案件一覧
                </Link>
              </li>
              <li className="nav-item">
                <Link className={isActive('/pipeline')} to="/pipeline">
                  <i className="bi bi-funnel me-1"></i>パイプライン
                </Link>
              </li>
              <li className="nav-item">
                <Link className={isActive('/engineers')} to="/engineers">
                  <i className="bi bi-people me-1"></i>技術者稼働
                </Link>
              </li>
              <li className="nav-item">
                <Link className={isActive('/calendar')} to="/calendar">
                  <i className="bi bi-calendar3 me-1"></i>カレンダー
                </Link>
              </li>
              <li className="nav-item">
                <Link className={isActive('/reports')} to="/reports">
                  <i className="bi bi-bar-chart me-1"></i>売上分析
                </Link>
              </li>
            </ul>
            <Link className="btn btn-warning btn-sm text-dark fw-bold px-3" to="/projects/new">
              <i className="bi bi-plus-circle me-1"></i>案件登録
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow-1" style={{ background: '#f0f4f8' }}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectListPage />} />
          <Route path="/projects/new" element={<ProjectFormPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/projects/:id/edit" element={<ProjectFormPage />} />
          <Route path="/pipeline" element={<PipelinePage />} />
          <Route path="/engineers" element={<EngineerPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/reports" element={<ReportPage />} />
        </Routes>
      </main>

      <footer className="text-center py-2 border-top" style={{ background: '#1a3a5c', color: '#aac4e0', fontSize: '0.8rem' }}>
        建設コンサルタント案件管理システム &copy; {new Date().getFullYear()}
      </footer>
    </div>
  )
}
