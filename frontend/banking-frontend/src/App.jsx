import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import FraudAlerts from './pages/FraudAlerts'
import Analytics from './pages/Analytics'
import Metrics from './pages/Metrics'

function ProtectedLayout() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <AppShell />
}

function AppShell() {
  const [collapsed,    setCollapsed]    = React.useState(false)
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    const handler = () => {
      setAccessDenied(true)
      setTimeout(() => setAccessDenied(false), 3500)
    }
    window.addEventListener('access-denied', handler)
    return () => window.removeEventListener('access-denied', handler)
  }, [])

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-primary)' }}>
          <Routes>
            <Route path="/"             element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"    element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/fraud-alerts" element={<FraudAlerts />} />
            <Route path="/analytics"    element={<Analytics />} />
            <Route path="/metrics"      element={<Metrics />} />
          </Routes>
        </div>
      </div>

      {/* Access Denied Toast */}
      {accessDenied && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
          background: '#7f1d1d', border: '1px solid #dc2626',
          borderRadius: '10px', padding: '14px 20px',
          display: 'flex', alignItems: 'center', gap: '10px',
          boxShadow: '0 8px 24px rgba(220,38,38,0.3)',
          animation: 'slideIn 0.3s ease',
          color: '#fecaca', fontSize: '13px', fontWeight: '600',
        }}>
          <span style={{ fontSize: '16px' }}>🚫</span>
          Access Denied — Analyst role cannot perform this action
        </div>
      )}

      <style>{`@keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </div>
  )
}

function LoginGuard() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <Login />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/"      element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginGuard />} />
        <Route path="/*"     element={<ProtectedLayout />} />
      </Routes>
    </AuthProvider>
  )
}