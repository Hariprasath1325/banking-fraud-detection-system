import React from 'react'
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
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <AppShell />
}

function AppShell() {
  const [collapsed, setCollapsed] = React.useState(false)
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
    </div>
  )
}

function LoginGuard() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  return <Login />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* ✅ Root always goes to login */}
        <Route path="/"      element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginGuard />} />
        <Route path="/*"     element={<ProtectedLayout />} />
      </Routes>
    </AuthProvider>
  )
}