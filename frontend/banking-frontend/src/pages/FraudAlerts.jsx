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

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function AlertModal({ tx, onClose }) {
  if (!tx) return null
  const score  = getScore(tx)
  const device = getDevice(tx)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15,23,42,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)',
    }} onClick={onClose}>
      <div style={{
        background: '#ffffff', borderRadius: '14px',
        border: '1px solid rgba(220,38,38,0.3)',
        width: '560px', maxWidth: '95vw',
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(220,38,38,0.15)',
      }} onClick={e => e.stopPropagation()}>

        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(220,38,38,0.15)', background: 'rgba(220,38,38,0.04)', borderRadius: '14px 14px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

        {/* Reason */}
        <div style={{ margin: '16px 24px 0', padding: '12px 16px', background: 'rgba(220,38,38,0.06)', borderRadius: '8px', border: '1px solid rgba(220,38,38,0.2)', display: 'flex', gap: '10px' }}>
          <Info size={15} color="#dc2626" style={{ marginTop: '2px', minWidth: 15 }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#dc2626', marginBottom: '4px' }}>⚠ FRAUD REASON</div>
            <div style={{ fontSize: '12px', color: '#374151', lineHeight: '1.6' }}>{tx.message || 'High risk transaction detected.'}</div>
          </div>
        </div>

        <div style={{ padding: '16px 24px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
              <div key={label} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>{label}</div>
                <div style={{ fontSize: '13px', fontFamily: mono ? 'var(--font-mono)' : 'var(--font-main)', fontWeight: bold ? '700' : '600', color: color ?? '#0f172a', wordBreak: 'break-all' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FraudAlerts() {
  const [flagged, setFlagged]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [timeRange, setTimeRange] = useState('all')
  const [page, setPage]           = useState(1)
  const [selected, setSelected]   = useState(null)

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

  return (
    <div style={{ padding: '24px 28px', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexShrink: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3px' }}>
            <ShieldAlert size={20} color="var(--accent-red)" />
            <h1 style={{ fontSize: '22px', fontWeight: '700' }}>Fraud Alerts</h1>
            <span className="badge badge-flagged">{filtered.length} ACTIVE</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Click any row to view full fraud details and reason
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={14} color="var(--text-muted)" />
          <select className="select-input" value={timeRange} onChange={e => setTimeRange(e.target.value)}>
            {TIME_FILTERS.map(tf => <option key={tf.value} value={tf.value}>{tf.label}</option>)}
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', overflow: 'hidden', boxShadow: 'var(--shadow)', minHeight: 0 }}>
        {/* Status bar */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(220,38,38,0.15)', background: 'rgba(220,38,38,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#dc2626', boxShadow: '0 0 6px #dc2626', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: '700', letterSpacing: '0.4px' }}>FRAUD DETECTION ACTIVE</span>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: '600' }}>
            {filtered.length} FLAGGED &nbsp;|&nbsp; Page {page} of {totalPages}
          </span>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto', minHeight: 0 }}>
          {loading ? (
            <div className="loading-wrap"><div className="spinner" /></div>
          ) : (
            <table className="data-table" style={{ minWidth: '900px' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                <tr>
                  {['TX ID','Sender','Receiver','Amount','Fraud Score','Merchant','Device Trust','Velocity','Timestamp','Flagged']
                    .map(h => <th key={h} style={{ background: '#fef2f2', fontSize: '10px' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No fraud alerts in selected time range</td></tr>
                ) : paginated.map((tx, i) => {
                  const score  = getScore(tx)
                  const device = getDevice(tx)
                  return (
                    <tr
  key={i}
  style={{
    cursor: 'pointer',
    background: 'rgba(220, 38, 38, 0.18)',
    borderLeft: '4px solid #dc2626',
  }}
  onMouseEnter={e => e.currentTarget.style.background = 'rgba(220, 38, 38, 0.28)'}
  onMouseLeave={e => e.currentTarget.style.background = 'rgba(220, 38, 38, 0.18)'}
  onClick={() => setSelected(tx)}
>
                      <td style={{ color: '#dc2626', fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '12px' }}>{getId(tx)}</td>
                      <td style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{getSender(tx)}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{getReceiver(tx)}</td>
                      <td style={{ color: '#dc2626', fontWeight: '700', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{formatINR(tx.amount)}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '12px', color: score >= 100 ? '#dc2626' : '#ea580c' }}>
                        {score !== null ? Number(score).toFixed(2) : '—'}
                      </td>
                      <td style={{ fontSize: '12px' }}>{getMerchant(tx)}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: device !== null && device < 0.3 ? '#dc2626' : device !== null && device < 0.6 ? '#ea580c' : 'var(--text-secondary)' }}>
                        {device !== null ? Number(device).toFixed(3) : '—'}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{getVelocity(tx)}</td>
                      <td style={{ fontSize: '11px' }}>{tx.timestamp ? new Date(tx.timestamp).toLocaleString('en-IN') : '—'}</td>
                      <td style={{ fontWeight: '700', fontSize: '12px', color: '#dc2626' }}>Yes</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && filtered.length > PAGE_SIZE && (
          <div className="pagination" style={{ flexShrink: 0 }}>
            <span className="pagination-info">
              Showing {((page-1)*PAGE_SIZE)+1}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="pagination-btns">
              <button className="page-btn" onClick={() => setPage(1)} disabled={page===1}>«</button>
              <button className="page-btn" onClick={() => setPage(p=>p-1)} disabled={page===1}>‹</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let p = i + 1
                if (totalPages > 5) {
                  if (page <= 3) p = i + 1
                  else if (page >= totalPages - 2) p = totalPages - 4 + i
                  else p = page - 2 + i
                }
                return <button key={p} className={`page-btn ${page===p?'active':''}`} onClick={()=>setPage(p)}>{p}</button>
              })}
              <button className="page-btn" onClick={() => setPage(p=>p+1)} disabled={page===totalPages}>›</button>
              <button className="page-btn" onClick={() => setPage(totalPages)} disabled={page===totalPages}>»</button>
            </div>
          </div>
        )}
      </div>

      {selected && <AlertModal tx={selected} onClose={() => setSelected(null)} />}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  )
}