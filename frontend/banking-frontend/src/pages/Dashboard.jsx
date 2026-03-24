import React, { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import {
  Activity, ShieldAlert, ShieldCheck, TrendingUp,
  RefreshCw, AlertTriangle, BarChart2, CheckCircle, Bell, X, Info
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const PIE_COLORS = ['#059669', '#ea580c', '#dc2626']

const tt = {
  contentStyle: {
    background: '#ffffff', border: '1px solid #b8d9f0',
    borderRadius: '8px', fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#0f172a',
  }
}

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`toast ${type}`}>
      <CheckCircle size={16} color={type === 'success' ? '#059669' : '#dc2626'} />
      {message}
    </div>
  )
}

function extractSummary(data) {
  if (!data) return { total: 0, safe: 0, medium: 0, high: 0 }
  return {
    total:  data.totalSimulated  ?? data.total ?? data.totalTransactions ?? data.totalCount ?? 0,
    safe:   data.safeCount       ?? data.safe  ?? data.safeTransactions  ?? 0,
    medium: data.mediumRiskCount ?? data.mediumRisk ?? data.medium       ?? 0,
    high:   data.highRiskCount   ?? data.highRisk   ?? data.high         ?? 0,
  }
}

const formatINR = amount =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0)

const getId       = tx => tx.transactionId         ?? tx.id             ?? '—'
const getSender   = tx => tx.senderAccountNumber    ?? tx.senderAccount  ?? tx.sender   ?? '—'
const getReceiver = tx => tx.receiverAccountNumber  ?? tx.receiverAccount ?? tx.receiver ?? '—'
const getScore    = tx => tx.fraudScore             ?? tx.score          ?? null
const getDevice   = tx => tx.deviceTrustScore       ?? tx.deviceScore    ?? null
const getVelocity = tx => tx.velocityLast24h        ?? tx.transactionVelocity ?? tx.velocity ?? '—'
const getMerchant = tx => tx.merchantCategory       ?? tx.merchant       ?? '—'

// ─── Transaction Detail Modal ──────────────────────────────────────────────────
function TransactionModal({ tx, onClose }) {
  if (!tx) return null
  const score  = getScore(tx)
  const device = getDevice(tx)

  return (
<<<<<<< HEAD
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(15,23,42,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid rgba(220,38,38,0.3)', width: '560px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(220,38,38,0.15)' }}
        onClick={e => e.stopPropagation()}>

        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(220,38,38,0.2)', background: 'rgba(220,38,38,0.05)', borderRadius: '14px 14px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={18} color="#dc2626" />
            <div>
              <div style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a' }}>Fraud Alert — TX #{getId(tx)}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{tx.timestamp ? new Date(tx.timestamp).toLocaleString('en-IN') : '—'}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
=======
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(15,23,42,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)',
    }} onClick={onClose}>
      <div style={{
        background: '#ffffff', borderRadius: '14px',
        border: '1px solid rgba(220,38,38,0.3)',
        width: '560px', maxWidth: '95vw',
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 64px rgba(220,38,38,0.15)',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid rgba(220,38,38,0.2)',
          background: 'rgba(220,38,38,0.05)',
          borderRadius: '14px 14px 0 0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={18} color="#dc2626" />
            <div>
              <div style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a' }}>
                Fraud Alert — TX #{getId(tx)}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                {tx.timestamp ? new Date(tx.timestamp).toLocaleString('en-IN') : '—'}
              </div>
            </div>
          </div>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
>>>>>>> f9ff47d (Initial commit)
            onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
            onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
            <X size={18} />
          </button>
        </div>

        {/* Fraud Reason */}
<<<<<<< HEAD
        <div style={{ margin: '16px 24px 0', padding: '12px 16px', background: 'rgba(220,38,38,0.06)', borderRadius: '8px', border: '1px solid rgba(220,38,38,0.2)', display: 'flex', gap: '10px' }}>
          <Info size={15} color="#dc2626" style={{ marginTop: '2px', minWidth: 15 }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#dc2626', marginBottom: '4px' }}>⚠ FRAUD REASON</div>
            <div style={{ fontSize: '12px', color: '#374151', lineHeight: '1.7' }}>{tx.message || 'High risk transaction detected.'}</div>
=======
        <div style={{
          margin: '16px 24px 0', padding: '12px 16px',
          background: 'rgba(220,38,38,0.06)', borderRadius: '8px',
          border: '1px solid rgba(220,38,38,0.2)',
          display: 'flex', gap: '10px',
        }}>
          <Info size={15} color="#dc2626" style={{ marginTop: '2px', minWidth: 15 }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#dc2626', marginBottom: '4px' }}>⚠ FRAUD REASON</div>
            <div style={{ fontSize: '12px', color: '#374151', lineHeight: '1.7' }}>
              {tx.message || 'High risk transaction detected.'}
            </div>
>>>>>>> f9ff47d (Initial commit)
          </div>
        </div>

        {/* Details Grid */}
        <div style={{ padding: '16px 24px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { label: 'Transaction ID',    value: getId(tx),       mono: true },
              { label: 'Amount',            value: formatINR(tx.amount), bold: true, color: '#dc2626' },
              { label: 'Sender',            value: getSender(tx),   mono: true },
              { label: 'Receiver',          value: getReceiver(tx), mono: true },
              { label: 'Fraud Score',       value: score !== null ? Number(score).toFixed(3) : '—', mono: true, color: '#dc2626' },
              { label: 'Merchant',          value: getMerchant(tx) },
              { label: 'Device Trust',      value: device !== null ? Number(device).toFixed(4) : '—', mono: true, color: device !== null && device < 0.3 ? '#dc2626' : '#ea580c' },
              { label: 'Velocity (24h)',    value: getVelocity(tx), mono: true },
              { label: 'Foreign Txn',       value: tx.foreignTransaction === 1 ? 'Yes' : 'No', color: tx.foreignTransaction === 1 ? '#ea580c' : '#059669' },
              { label: 'Location Mismatch', value: tx.locationMismatch === 1 ? 'Yes — Mismatch' : 'No', color: tx.locationMismatch === 1 ? '#ea580c' : '#059669' },
              { label: 'Cardholder Age',    value: tx.cardholderAge ?? '—' },
              { label: 'Status',            value: tx.status ?? '—' },
            ].map(({ label, value, mono, bold, color }) => (
              <div key={label} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '11px 14px' }}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '5px' }}>{label}</div>
                <div style={{ fontSize: '13px', fontFamily: mono ? 'JetBrains Mono, monospace' : 'inherit', fontWeight: bold ? '700' : '600', color: color ?? '#0f172a', wordBreak: 'break-all' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Alert Dropdown ─────────────────────────────────────────────────────────────
function AlertDropdown({ alerts, onClose, onSelectTx }) {
  return (
    <div style={{
      position: 'absolute', top: '44px', right: 0, zIndex: 200,
      background: '#ffffff', border: '1px solid #b8d9f0',
      borderRadius: '12px', width: '360px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
<<<<<<< HEAD
      overflow: 'hidden',
      maxHeight: '420px',
=======
      overflow: 'hidden', maxHeight: '420px',
>>>>>>> f9ff47d (Initial commit)
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 18px', borderBottom: '1px solid #e2e8f0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: alerts.length > 0 ? 'rgba(220,38,38,0.04)' : '#f8fafc',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {alerts.length > 0 && (
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#dc2626', boxShadow: '0 0 6px #dc2626', animation: 'pulse 2s infinite' }} />
          )}
          <span style={{ fontWeight: '700', fontSize: '13px', color: alerts.length > 0 ? '#dc2626' : '#0f172a' }}>
            {alerts.length > 0 ? `${alerts.length} New Fraud Alert${alerts.length > 1 ? 's' : ''}` : 'No New Alerts'}
          </span>
        </div>
<<<<<<< HEAD
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
=======
        <button onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
>>>>>>> f9ff47d (Initial commit)
          onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
          onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
          <X size={15} />
        </button>
      </div>

      {alerts.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
          No new fraud alerts
        </div>
      ) : (
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {alerts.map((tx, i) => (
            <div key={i}
              onClick={() => { onSelectTx(tx); onClose() }}
              style={{
                padding: '12px 18px',
                borderBottom: '1px solid #f1f5f9',
                background: i % 2 === 0 ? '#fff' : '#fafafa',
                display: 'flex', gap: '12px', alignItems: 'flex-start',
                cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#fff1f2'}
              onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa'}
            >
              <div style={{
                width: 32, height: 32, minWidth: 32,
                borderRadius: '8px', background: 'rgba(220,38,38,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <AlertTriangle size={15} color="#dc2626" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                  <span style={{ fontWeight: '700', fontSize: '12px', color: '#0f172a', fontFamily: 'JetBrains Mono, monospace' }}>
                    TX #{getId(tx)}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#dc2626' }}>
                    {formatINR(tx.amount)}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {getSender(tx)} → {getReceiver(tx)}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {tx.message || 'High risk transaction detected'}
                </div>
                <div style={{ marginTop: '4px', fontSize: '10px', color: '#dc2626', fontWeight: '600' }}>
                  Click to view details →
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
<<<<<<< HEAD
  const [summary,       setSummary]       = useState(null)
  const [generating,    setGenerating]    = useState(false)
  const [loading,       setLoading]       = useState(true)
  const [toast,         setToast]         = useState(null)
  const [newAlerts,     setNewAlerts]     = useState([])
  const [showDropdown,  setShowDropdown]  = useState(false)
  const [selectedTx,    setSelectedTx]    = useState(null)
  const [prevFlagged,   setPrevFlagged]   = useState(null)

  const fetchData = useCallback(async () => {
    try {
      const [sumRes, flaggedRes] = await Promise.all([
        api.get('/simulation/summary'),
        api.get('/simulation/flagged'),
      ])
      setSummary(sumRes.data)
      const allFlagged = Array.isArray(flaggedRes.data) ? flaggedRes.data : []
      if (prevFlagged === null) {
        setPrevFlagged(allFlagged.length)
      }
=======
  const { isAdmin } = useAuth()

  const [summary,      setSummary]      = useState(null)
  const [generating,   setGenerating]   = useState(false)
  const [loading,      setLoading]      = useState(true)
  const [toast,        setToast]        = useState(null)
  const [newAlerts,    setNewAlerts]    = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedTx,   setSelectedTx]  = useState(null)

  const fetchData = useCallback(async () => {
    try {
      const [sumRes] = await Promise.all([
        api.get('/simulation/summary'),
      ])
      setSummary(sumRes.data)
>>>>>>> f9ff47d (Initial commit)
    } catch (err) {
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }, [prevFlagged])

  useEffect(() => { fetchData() }, [])

  const handleGenerate = async () => {
<<<<<<< HEAD
  setGenerating(true)

  // ✅ Snapshot existing IDs before generating
  let beforeIds = new Set()
  try {
    const before = await api.get('/simulation/flagged')
    const beforeList = Array.isArray(before.data) ? before.data : []
    beforeIds = new Set(
      beforeList.map(tx => tx.transactionId ?? tx.id)
    )
  } catch {}

  try { await api.post('/simulation/generate?count=5') } catch {}

  try {
    const [sumRes, flaggedRes] = await Promise.all([
      api.get('/simulation/summary'),
      api.get('/simulation/flagged'),
    ])
    setSummary(sumRes.data)
    const allFlagged = Array.isArray(flaggedRes.data) ? flaggedRes.data : []

    // ✅ Find transactions whose ID was NOT in the before snapshot
    const newOnes = allFlagged.filter(tx => {
      const id = tx.transactionId ?? tx.id
      return !beforeIds.has(id)
    })

    if (newOnes.length > 0) {
      setNewAlerts(prev => [...newOnes, ...prev])
      setShowDropdown(true)
    }

    setToast({ msg: `✅ 5 transactions created${newOnes.length > 0 ? `, ${newOnes.length} fraud detected!` : '!'}`, type: 'success' })
  } catch {
    setToast({ msg: '❌ Failed to generate transactions.', type: 'error' })
  } finally {
    setGenerating(false)
=======
    setGenerating(true)

    // Snapshot existing flagged IDs before generating
    let beforeIds = new Set()
    try {
      const before = await api.get('/simulation/flagged')
      const beforeList = Array.isArray(before.data) ? before.data : []
      beforeIds = new Set(beforeList.map(tx => tx.transactionId ?? tx.id))
    } catch {}

    try { await api.post('/simulation/generate?count=5') } catch {}

    try {
      const [sumRes, flaggedRes] = await Promise.all([
        api.get('/simulation/summary'),
        api.get('/simulation/flagged'),
      ])
      setSummary(sumRes.data)
      const allFlagged = Array.isArray(flaggedRes.data) ? flaggedRes.data : []

      // Find truly new fraud transactions by ID comparison
      const newOnes = allFlagged.filter(tx => {
        const id = tx.transactionId ?? tx.id
        return !beforeIds.has(id)
      })

      if (newOnes.length > 0) {
        setNewAlerts(prev => [...newOnes, ...prev])
        setShowDropdown(true)
      }

      setToast({
        msg: `✅ 5 transactions created${newOnes.length > 0 ? `, ${newOnes.length} fraud detected!` : '!'}`,
        type: 'success',
      })
    } catch {
      setToast({ msg: '❌ Failed to generate transactions.', type: 'error' })
    } finally {
      setGenerating(false)
    }
>>>>>>> f9ff47d (Initial commit)
  }

  const s = extractSummary(summary)

  const pieData = [
    { name: 'Safe',      value: s.safe   },
    { name: 'Medium',    value: s.medium },
    { name: 'High Risk', value: s.high   },
  ]

  return (
    <div className="page-container animate-in">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '3px' }}>
            Fraud Monitor
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Real-time banking fraud detection dashboard
          </p>
        </div>

<<<<<<< HEAD
        {/* Right side — Bell + Generate */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
=======
        {/* Right side — Bell + Generate (Admin only) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

>>>>>>> f9ff47d (Initial commit)
          {/* Alert Bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowDropdown(v => !v)}
              style={{
                width: 40, height: 40, borderRadius: '10px',
                border: newAlerts.length > 0 ? '1.5px solid rgba(220,38,38,0.4)' : '1.5px solid #b8d9f0',
                background: newAlerts.length > 0 ? 'rgba(220,38,38,0.06)' : '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = newAlerts.length > 0 ? 'rgba(220,38,38,0.12)' : '#f0f8ff'}
              onMouseLeave={e => e.currentTarget.style.background = newAlerts.length > 0 ? 'rgba(220,38,38,0.06)' : '#ffffff'}
            >
              <Bell size={17} color={newAlerts.length > 0 ? '#dc2626' : '#64748b'} />
<<<<<<< HEAD
              {/* Badge */}
=======
>>>>>>> f9ff47d (Initial commit)
              {newAlerts.length > 0 && (
                <div style={{
                  position: 'absolute', top: -5, right: -5,
                  width: 18, height: 18, borderRadius: '50%',
                  background: '#dc2626', border: '2px solid #ffffff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: '800', color: '#ffffff',
                  fontFamily: 'JetBrains Mono, monospace',
                  animation: 'pulse 2s infinite',
                }}>
                  {newAlerts.length > 9 ? '9+' : newAlerts.length}
                </div>
              )}
            </button>

<<<<<<< HEAD
            {/* Dropdown */}
=======
>>>>>>> f9ff47d (Initial commit)
            {showDropdown && (
              <AlertDropdown
                alerts={newAlerts}
                onClose={() => setShowDropdown(false)}
                onSelectTx={tx => {
                  setSelectedTx(tx)
                  setShowDropdown(false)
                }}
              />
            )}
          </div>

<<<<<<< HEAD
          {/* Generate Button */}
          <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
            <RefreshCw size={14} style={{ animation: generating ? 'spin 0.8s linear infinite' : 'none' }} />
            {generating ? 'Generating...' : 'Generate 5 Transactions'}
          </button>
=======
          {/* Generate Button — Admin only */}
          {isAdmin && (
            <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
              <RefreshCw size={14} style={{ animation: generating ? 'spin 0.8s linear infinite' : 'none' }} />
              {generating ? 'Generating...' : 'Generate 5 Transactions'}
            </button>
          )}
>>>>>>> f9ff47d (Initial commit)
        </div>
      </div>

      

      {loading ? (
        <div className="loading-wrap">
          <div className="spinner" />
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading dashboard...</p>
        </div>
      ) : (
        <>
<<<<<<< HEAD
          {/* Stat Cards — removed Flagged, kept 4 cards */}
=======
          {/* Stat Cards */}
>>>>>>> f9ff47d (Initial commit)
          <div className="grid-3 mb-16">
            <StatCard label="Total Transactions" value={s.total}  color="cyan"   icon={<Activity    size={32} />} />
            <StatCard label="Safe Transactions"  value={s.safe}   color="green"  icon={<ShieldCheck size={32} />} />
            <StatCard label="High Risk"          value={s.high}   color="red"    icon={<ShieldAlert size={32} />} />
          </div>
          <div style={{ maxWidth: '33%', marginBottom: '20px' }}>
            <StatCard label="Medium Risk" value={s.medium} color="orange" icon={<AlertTriangle size={32} />} />
          </div>

          <div className="grid-2">
            {/* Pie Chart */}
            <div className="card">
              <div className="section-title"><BarChart2 size={14} />Fraud Distribution</div>
              {s.total === 0 ? (
                <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px', flexDirection: 'column', gap: '8px' }}>
                  <BarChart2 size={32} color="#b8d9f0" />
                  {isAdmin ? 'Click "Generate 5 Transactions" to load data' : 'No transaction data available'}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} opacity={0.9} />)}
                    </Pie>
                    <Tooltip {...tt} />
                    <Legend formatter={v => <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Risk Breakdown */}
            <div className="card">
              <div className="section-title"><TrendingUp size={14} />Risk Breakdown</div>
              {[
                { label: 'Safe',        value: s.safe,   color: 'var(--accent-green)'  },
                { label: 'Medium Risk', value: s.medium, color: 'var(--accent-orange)' },
                { label: 'High Risk',   value: s.high,   color: 'var(--accent-red)'    },
              ].map(({ label, value, color }) => (
                <div key={label} className="metric-row">
                  <div className="metric-label-row">
                    <span className="metric-label">{label}</span>
                    <span className="metric-val" style={{ color }}>
                      {value}
                      <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px' }}>
                        ({s.total ? ((value / s.total) * 100).toFixed(1) : 0}%)
                      </span>
                    </span>
                  </div>
                  <div className="metric-track">
                    <div className="metric-fill" style={{ width: `${s.total ? (value / s.total) * 100 : 0}%`, background: color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

<<<<<<< HEAD
      {/* Transaction Detail Modal from alert click */}
=======
      {/* Transaction Detail Modal */}
>>>>>>> f9ff47d (Initial commit)
      {selectedTx && <TransactionModal tx={selectedTx} onClose={() => setSelectedTx(null)} />}

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  )
}

function StatCard({ label, value, color, icon }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${color}`}>{value}</div>
    </div>
  )
}
