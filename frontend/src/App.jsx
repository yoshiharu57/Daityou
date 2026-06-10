import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import BridgeListPage from './pages/BridgeListPage'
import BridgeDetailPage from './pages/BridgeDetailPage'
import BridgeFormPage from './pages/BridgeFormPage'

export default function App() {
  const location = useLocation()

  return (
    <div className="min-vh-100 d-flex flex-column">
      <nav className="navbar navbar-expand-lg navbar-custom">
        <div className="container-fluid px-4">
          <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
            <i className="bi bi-building-fill-gear fs-5"></i>
            <span>橋梁管理システム</span>
          </Link>
          <button
            className="navbar-toggler border-light"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navMenu"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navMenu">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  <i className="bi bi-list-ul me-1"></i>橋梁一覧
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/bridges/new">
                  <i className="bi bi-plus-circle me-1"></i>橋梁登録
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<BridgeListPage />} />
          <Route path="/bridges/new" element={<BridgeFormPage />} />
          <Route path="/bridges/:id" element={<BridgeDetailPage />} />
          <Route path="/bridges/:id/edit" element={<BridgeFormPage />} />
        </Routes>
      </main>

      <footer className="text-center py-3 border-top" style={{ background: '#fff', color: '#888', fontSize: '0.82rem' }}>
        橋梁管理システム &copy; {new Date().getFullYear()} &nbsp;|&nbsp; 国土交通省定期点検要領対応版
      </footer>
    </div>
  )
}
