import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import ProjectListPage from './pages/ProjectListPage'
import ProjectFormPage from './pages/ProjectFormPage'
import ProjectDetailPage from './pages/ProjectDetailPage'

export default function App() {
  const location = useLocation()
  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link'

  return (
    <div className="min-vh-100 d-flex flex-column">
      <nav className="navbar navbar-expand-lg navbar-dark" style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #2563a8 100%)' }}>
        <div className="container-fluid px-4">
          <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
            <i className="bi bi-briefcase-fill fs-5"></i>
            <span className="fw-bold">建設コンサルタント 案件管理</span>
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navMenu">
            <ul className="navbar-nav ms-auto gap-1">
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
                <Link className="nav-link btn btn-warning btn-sm text-dark fw-bold px-3 ms-2" to="/projects/new">
                  <i className="bi bi-plus-circle me-1"></i>案件登録
                </Link>
              </li>
            </ul>
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
        </Routes>
      </main>

      <footer className="text-center py-2 border-top" style={{ background: '#1a3a5c', color: '#aac4e0', fontSize: '0.8rem' }}>
        建設コンサルタント案件管理システム &copy; {new Date().getFullYear()}
      </footer>
    </div>
  )
}
