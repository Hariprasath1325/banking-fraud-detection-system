import React, { useState, useEffect, useMemo } from 'react'
import api from '../api/axios'
import { ShieldAlert, Clock, X, Info, AlertTriangle } from 'lucide-react'

const PAGE_SIZE = 50

const getId       = tx => tx.transactionId         ?? tx.id             ?? '—'
const getSender   = tx => tx.senderAccountNumber    ?? tx.senderAccount  ?? tx.sender   ?? '—'
const getReceiver = tx => tx.receiverAccountNumber  ?? tx.receiverAccount ?? tx.receiver ?? '—'
const getScore    = tx => tx.fraudScore             ?? tx.score          ?? null
const getDevice   = tx => tx.deviceTrustScore       ?? tx.deviceScore    ?? null
const getVelocity = tx => tx.velocityLast24h        ?? tx.transactionVelocity ?? tx.velocity ?? '—'
const getMerchant = tx => tx.merchantCategory       ?? tx.merchant       ?? '—'

const formatINR = amount =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount || 0)

const TIME_FILTERS = [
  { label: 'All Time',      value: 'all' },
  { label: 'Last 1 Week',   value: '7'   },
  { label: 'Last 1 Month',  value: '30'  },
  { label: 'Last 3 Months', value: '90'  },
  { label: 'Last 1 Year',   value: '365' },
]

// ─── Detail Modal ──────────────────────────────────────────────────────────────
function AlertModal({ tx, onClose }) {
  if (!tx) return null
  const score  = getScore(tx)
  const device = getDevice(tx)

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
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
            onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
            onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
            <X size={18} />
          </button>
        </div>

        <div style={{ margin: '16px 24px 0', padding: '12px 16px', background: 'rgba(220,38,38,0.06)', borderRadius: '8px', border: '1px solid rgba(220,38,38,0.2)', display: 'flex', gap: '10px' }}>
          <Info size={15} color="#dc2626" style={{ marginTop: '2px', minWidth: 15 }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#dc2626', marginBottom: '4px' }}>⚠ FRAUD REASON</div>
            <div style={{ fontSize: '12px', color: '#374151', lineHeight: '1.7' }}>{tx.message || 'High risk transaction detected.'}</div>
          </div>
        </div>

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
              { label: 'Foreign Txn',       value: tx.foreignTransaction === 1 ? 'Yes' : 'No', color: tx.foreignTransaction === 1 ? '#ea580c' : '#16a34a' },
              { label: 'Location Mismatch', value: tx.locationMismatch === 1 ? 'Yes — Mismatch' : 'No', color: tx.locationMismatch === 1 ? '#ea580c' : '#16a34a' },
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

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function FraudAlerts() {
  const [flagged,   setFlagged]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [timeRange, setTimeRange] = useState('all')
  const [page,      setPage]      = useState(1)
  const [selected,  setSelected]  = useState(null)

  useEffect(() => {
    api.get('/simulation/flagged')
      .then(res => setFlagged(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error('FraudAlerts error:', err))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { setPage(1) }, [timeRange])

  const filtered = useMemo(() => {
    if (timeRange === 'all') return flagged
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - parseInt(timeRange))
    return flagged.filter(tx => tx.timestamp && new Date(tx.timestamp) >= cutoff)
  }, [flagged, timeRange])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // ✅ Same red as High filter button — solid with white text
  const ROW_BASE  = '#dc2626'
  const ROW_HOVER = '#b91c1c'

  return (
    <div style={{ padding: '24px 28px', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexShrink: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3px' }}>
            <ShieldAlert size={20} color="#dc2626" />
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a' }}>Fraud Alerts</h1>
<<<<<<< HEAD
            <span style={{ background: '#dc2626', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '2px 10px', borderRadius: '20px' }}>
=======
            <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: '11px', fontWeight: '700', padding: '2px 10px', borderRadius: '20px', border: '1px solid #fca5a5' }}>
>>>>>>> f9ff47d (Initial commit)
              {filtered.length} ACTIVE
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#475569' }}>Click any row to view full fraud details and reason</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={14} color="#64748b" />
          <select value={timeRange} onChange={e => setTimeRange(e.target.value)}
            style={{ padding: '7px 12px', fontSize: '12px', border: '1.5px solid #cbd5e1', borderRadius: '8px', background: '#ffffff', color: '#0f172a', cursor: 'pointer', outline: 'none' }}>
            {TIME_FILTERS.map(tf => <option key={tf.value} value={tf.value}>{tf.label}</option>)}
          </select>
        </div>
      </div>

      {/* Table Card */}
<<<<<<< HEAD
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8fafc', border: '1px solid #fecaca', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 16px rgba(220,38,38,0.12)', minHeight: 0 }}>
=======
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#ffffff', border: '1px solid #fecaca', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(220,38,38,0.08)', minHeight: 0 }}>
>>>>>>> f9ff47d (Initial commit)
        {/* Status Bar */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid #fecaca', background: '#fff1f2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: '700', letterSpacing: '0.4px' }}>FRAUD DETECTION ACTIVE</span>
          </div>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace', fontWeight: '600' }}>
            {filtered.length} FLAGGED &nbsp;|&nbsp; Page {page} of {totalPages}
          </span>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto', minHeight: 0 }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '12px' }}>
              <div style={{ width: 28, height: 28, border: '3px solid #fecaca', borderTopColor: '#ef4444', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>Loading alerts...</p>
            </div>
          ) : (
            <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
<<<<<<< HEAD
                <tr style={{ background: '#ffe4e6' }}>
=======
                <tr style={{ background: '#fff1f2' }}>
>>>>>>> f9ff47d (Initial commit)
                  {['TX ID','Sender','Receiver','Amount','Fraud Score','Merchant','Device Trust','Velocity','Timestamp','Flagged']
                    .map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: '#9f1239', letterSpacing: '0.6px', textTransform: 'uppercase', borderBottom: '2px solid #fecaca', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '13px' }}>
                      No fraud alerts in selected time range
                    </td>
                  </tr>
                ) : paginated.map((tx, i) => {
                  const score  = getScore(tx)
                  const device = getDevice(tx)
                  const rowBg  = i % 2 === 0 ? '#ffffff' : '#fff8f8'
                  return (
                    <tr key={i}
<<<<<<< HEAD
                      style={{ background: ROW_BASE, borderLeft: '4px solid #991b1b', cursor: 'pointer', transition: 'background 0.15s', borderBottom: '1px solid #991b1b' }}
                      onMouseEnter={e => e.currentTarget.style.background = ROW_HOVER}
                      onMouseLeave={e => e.currentTarget.style.background = ROW_BASE}
                      onClick={() => setSelected(tx)}
                    >
                      <td style={{ padding: '9px 12px', color: '#ffffff', fontFamily: 'JetBrains Mono, monospace', fontWeight: '800', fontSize: '12px', whiteSpace: 'nowrap' }}>{getId(tx)}</td>
                      <td style={{ padding: '9px 12px', color: 'rgba(255,255,255,0.92)', fontFamily: 'JetBrains Mono, monospace', fontWeight: '600', fontSize: '11px', whiteSpace: 'nowrap' }}>{getSender(tx)}</td>
                      <td style={{ padding: '9px 12px', color: 'rgba(255,255,255,0.85)', fontFamily: 'JetBrains Mono, monospace', fontWeight: '600', fontSize: '11px', whiteSpace: 'nowrap' }}>{getReceiver(tx)}</td>
                      <td style={{ padding: '9px 12px', color: '#ffffff', fontWeight: '800', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', whiteSpace: 'nowrap' }}>{formatINR(tx.amount)}</td>
                      <td style={{ padding: '9px 12px', fontFamily: 'JetBrains Mono, monospace', fontWeight: '700', fontSize: '12px', color: '#ffffff', whiteSpace: 'nowrap' }}>
                        {score !== null ? Number(score).toFixed(2) : '—'}
                      </td>
                      <td style={{ padding: '9px 12px', color: 'rgba(255,255,255,0.90)', fontSize: '12px', fontWeight: '600' }}>{getMerchant(tx)}</td>
                      <td style={{ padding: '9px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: '600', color: device !== null && device < 0.3 ? '#fef08a' : 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap' }}>
                        {device !== null ? Number(device).toFixed(3) : '—'}
                      </td>
                      <td style={{ padding: '9px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'rgba(255,255,255,0.85)', fontWeight: '600' }}>{getVelocity(tx)}</td>
                      <td style={{ padding: '9px 12px', color: 'rgba(255,255,255,0.80)', fontSize: '11px', whiteSpace: 'nowrap' }}>{tx.timestamp ? new Date(tx.timestamp).toLocaleString('en-IN') : '—'}</td>
                      <td style={{ padding: '9px 12px', fontWeight: '800', fontSize: '12px', color: '#ffffff' }}>Yes</td>
=======
                      style={{ background: rowBg, borderLeft: '4px solid #fca5a5', cursor: 'pointer', transition: 'background 0.15s', borderBottom: '1px solid #fff1f2' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fff1f2'}
                      onMouseLeave={e => e.currentTarget.style.background = rowBg}
                      onClick={() => setSelected(tx)}
                    >
                      {/* All fonts red — visible on white background */}
                      <td style={{ padding: '9px 12px', color: '#dc2626', fontFamily: 'JetBrains Mono, monospace', fontWeight: '800', fontSize: '12px', whiteSpace: 'nowrap' }}>{getId(tx)}</td>
                      <td style={{ padding: '9px 12px', color: '#b91c1c', fontFamily: 'JetBrains Mono, monospace', fontWeight: '600', fontSize: '11px', whiteSpace: 'nowrap' }}>{getSender(tx)}</td>
                      <td style={{ padding: '9px 12px', color: '#b91c1c', fontFamily: 'JetBrains Mono, monospace', fontWeight: '600', fontSize: '11px', whiteSpace: 'nowrap' }}>{getReceiver(tx)}</td>
                      <td style={{ padding: '9px 12px', color: '#dc2626', fontWeight: '800', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', whiteSpace: 'nowrap' }}>{formatINR(tx.amount)}</td>
                      <td style={{ padding: '9px 12px', fontFamily: 'JetBrains Mono, monospace', fontWeight: '700', fontSize: '12px', color: '#dc2626', whiteSpace: 'nowrap' }}>
                        {score !== null ? Number(score).toFixed(2) : '—'}
                      </td>
                      <td style={{ padding: '9px 12px', color: '#b91c1c', fontSize: '12px', fontWeight: '600' }}>{getMerchant(tx)}</td>
                      <td style={{ padding: '9px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: '600', color: device !== null && device < 0.3 ? '#dc2626' : '#9f1239', whiteSpace: 'nowrap' }}>
                        {device !== null ? Number(device).toFixed(3) : '—'}
                      </td>
                      <td style={{ padding: '9px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#9f1239', fontWeight: '600' }}>{getVelocity(tx)}</td>
                      <td style={{ padding: '9px 12px', color: '#9f1239', fontSize: '11px', fontWeight: '500', whiteSpace: 'nowrap' }}>{tx.timestamp ? new Date(tx.timestamp).toLocaleString('en-IN') : '—'}</td>
                      <td style={{ padding: '9px 12px', fontWeight: '800', fontSize: '12px', color: '#dc2626' }}>Yes</td>
>>>>>>> f9ff47d (Initial commit)
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && filtered.length > PAGE_SIZE && (
          <div style={{ padding: '10px 16px', borderTop: '1px solid #fecaca', background: '#fff1f2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>
              Showing {((page-1)*PAGE_SIZE)+1}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[
                { label: '«', action: () => setPage(1),           disabled: page === 1 },
                { label: '‹', action: () => setPage(p => p - 1), disabled: page === 1 },
              ].map(({ label, action, disabled }) => (
                <button key={label} onClick={action} disabled={disabled}
<<<<<<< HEAD
                  style={{ width: 30, height: 30, borderRadius: '6px', border: '1px solid #fecaca', background: disabled ? '#fff1f2' : '#ffffff', color: disabled ? '#fca5a5' : '#991b1b', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: '13px' }}>
=======
                  style={{ width: 30, height: 30, borderRadius: '6px', border: '1px solid #fecaca', background: disabled ? '#fff1f2' : '#ffffff', color: disabled ? '#fca5a5' : '#dc2626', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: '13px' }}>
>>>>>>> f9ff47d (Initial commit)
                  {label}
                </button>
              ))}
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let p = i + 1
                if (totalPages > 5) {
                  if (page <= 3) p = i + 1
                  else if (page >= totalPages - 2) p = totalPages - 4 + i
                  else p = page - 2 + i
                }
                return (
                  <button key={p} onClick={() => setPage(p)}
<<<<<<< HEAD
                    style={{ width: 30, height: 30, borderRadius: '6px', border: '1px solid #fecaca', background: page === p ? '#dc2626' : '#ffffff', color: page === p ? '#ffffff' : '#991b1b', cursor: 'pointer', fontSize: '12px', fontWeight: page === p ? '700' : '400' }}>
=======
                    style={{ width: 30, height: 30, borderRadius: '6px', border: '1px solid #fecaca', background: page === p ? '#dc2626' : '#ffffff', color: page === p ? '#ffffff' : '#dc2626', cursor: 'pointer', fontSize: '12px', fontWeight: page === p ? '700' : '400' }}>
>>>>>>> f9ff47d (Initial commit)
                    {p}
                  </button>
                )
              })}
              {[
                { label: '›', action: () => setPage(p => p + 1), disabled: page === totalPages },
                { label: '»', action: () => setPage(totalPages),  disabled: page === totalPages },
              ].map(({ label, action, disabled }) => (
                <button key={label} onClick={action} disabled={disabled}
<<<<<<< HEAD
                  style={{ width: 30, height: 30, borderRadius: '6px', border: '1px solid #fecaca', background: disabled ? '#fff1f2' : '#ffffff', color: disabled ? '#fca5a5' : '#991b1b', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: '13px' }}>
=======
                  style={{ width: 30, height: 30, borderRadius: '6px', border: '1px solid #fecaca', background: disabled ? '#fff1f2' : '#ffffff', color: disabled ? '#fca5a5' : '#dc2626', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: '13px' }}>
>>>>>>> f9ff47d (Initial commit)
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {selected && <AlertModal tx={selected} onClose={() => setSelected(null)} />}
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  )
}
