import React, { useState, useEffect, useMemo } from 'react'
import api from '../api/axios'
import { Search, ArrowLeftRight, X, AlertTriangle, CheckCircle, Info } from 'lucide-react'

const PAGE_SIZE = 50

const getId       = tx => tx.transactionId         ?? tx.id              ?? '—'
const getSender   = tx => tx.senderAccountNumber    ?? tx.senderAccount   ?? tx.sender    ?? '—'
const getReceiver = tx => tx.receiverAccountNumber  ?? tx.receiverAccount ?? tx.receiver  ?? '—'
const getVelocity = tx => tx.velocityLast24h        ?? tx.transactionVelocity ?? tx.velocity ?? '—'
const getDevice   = tx => tx.deviceTrustScore       ?? tx.deviceScore     ?? null
const getScore    = tx => tx.fraudScore             ?? tx.score           ?? null
const getMerchant = tx => tx.merchantCategory       ?? tx.merchant        ?? '—'

const getRiskStr = tx => {
  const fraudStatus = (tx.fraudStatus   || '').toUpperCase()
  const simType     = (tx.simulationType || '').toUpperCase()
  if (fraudStatus === 'LOW_RISK'    || fraudStatus === 'SAFE')   return 'SAFE'
  if (fraudStatus === 'MEDIUM_RISK' || fraudStatus === 'MEDIUM') return 'MEDIUM'
  if (fraudStatus === 'HIGH_RISK'   || fraudStatus === 'HIGH')   return 'HIGH'
  if (simType === 'SAFE'   || simType === 'LOW_RISK')    return 'SAFE'
  if (simType === 'MEDIUM' || simType === 'MEDIUM_RISK') return 'MEDIUM'
  if (simType === 'HIGH'   || simType === 'HIGH_RISK')   return 'HIGH'
  return 'SAFE'
}

const formatINR = amount =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount || 0)

<<<<<<< HEAD
// ✅ Same colors as filter buttons — dark solid with white fonts
const ROW_THEME = {
  HIGH:   { base: '#dc2626', hover: '#b91c1c', border: '#991b1b' },
  MEDIUM: { base: '#d97706', hover: '#b45309', border: '#92400e' },
  SAFE:   { base: '#16a34a', hover: '#15803d', border: '#14532d' },
=======
// ✅ Normal white background — colored fonts only
const ROW_FONT = {
  HIGH:   { id: '#dc2626', text: '#b91c1c', muted: '#dc2626', amount: '#dc2626', score: '#dc2626', border: '#fca5a5' },
  MEDIUM: { id: '#d97706', text: '#b45309', muted: '#d97706', amount: '#d97706', score: '#d97706', border: '#fde68a' },
  SAFE:   { id: '#16a34a', text: '#15803d', muted: '#16a34a', amount: '#16a34a', score: '#16a34a', border: '#bbf7d0' },
>>>>>>> f9ff47d (Initial commit)
}

// ─── Transaction Detail Modal ──────────────────────────────────────────────────
function TransactionModal({ tx, onClose }) {
  if (!tx) return null
  const score  = getScore(tx)
  const device = getDevice(tx)
  const risk   = getRiskStr(tx)
  const riskColor = risk === 'HIGH' ? '#dc2626' : risk === 'MEDIUM' ? '#d97706' : '#16a34a'
  const riskBg    = risk === 'HIGH' ? 'rgba(220,38,38,0.08)' : risk === 'MEDIUM' ? 'rgba(217,119,6,0.08)' : 'rgba(22,163,74,0.08)'

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #cbd5e1', width: '580px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}
        onClick={e => e.stopPropagation()}>

<<<<<<< HEAD
        {/* Header */}
=======
>>>>>>> f9ff47d (Initial commit)
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '14px 14px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {risk === 'SAFE' ? <CheckCircle size={18} color={riskColor} /> : <AlertTriangle size={18} color={riskColor} />}
            <div>
              <div style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a' }}>Transaction #{getId(tx)}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{tx.timestamp ? new Date(tx.timestamp).toLocaleString('en-IN') : '—'}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
            onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
            onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
            <X size={18} />
          </button>
        </div>

<<<<<<< HEAD
        {/* Risk Banner */}
=======
>>>>>>> f9ff47d (Initial commit)
        <div style={{ margin: '16px 24px 0', padding: '12px 16px', background: riskBg, borderRadius: '8px', border: `1px solid ${riskColor}40`, display: 'flex', gap: '10px' }}>
          <Info size={15} color={riskColor} style={{ marginTop: '2px', minWidth: 15 }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: riskColor, marginBottom: '4px' }}>
              {risk === 'HIGH' ? '⚠ HIGH RISK — FLAGGED FOR FRAUD' : risk === 'MEDIUM' ? '⚡ MEDIUM RISK — UNDER REVIEW' : '✓ LOW RISK — SAFE TRANSACTION'}
            </div>
            <div style={{ fontSize: '12px', color: '#374151', lineHeight: '1.7' }}>{tx.message || 'No additional details.'}</div>
          </div>
        </div>

        <div style={{ padding: '16px 24px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { label: 'Transaction ID',    value: getId(tx),       mono: true },
              { label: 'Status',            value: tx.status ?? '—' },
              { label: 'Sender Account',    value: getSender(tx),   mono: true },
              { label: 'Receiver Account',  value: getReceiver(tx), mono: true },
              { label: 'Amount',            value: formatINR(tx.amount), bold: true, color: '#1d4ed8' },
              { label: 'Fraud Score',       value: score !== null ? Number(score).toFixed(3) : '—', mono: true, color: riskColor },
              { label: 'Merchant',          value: getMerchant(tx) },
              { label: 'Cardholder Age',    value: tx.cardholderAge ?? '—' },
              { label: 'Device Trust',      value: device !== null ? Number(device).toFixed(4) : '—', mono: true, color: device !== null && device < 0.3 ? '#dc2626' : '#16a34a' },
              { label: 'Velocity (24h)',    value: getVelocity(tx), mono: true },
              { label: 'Foreign Txn',       value: tx.foreignTransaction === 1 ? 'Yes' : 'No', color: tx.foreignTransaction === 1 ? '#d97706' : '#16a34a' },
              { label: 'Location Mismatch', value: tx.locationMismatch === 1 ? 'Yes — Mismatch' : 'No — OK', color: tx.locationMismatch === 1 ? '#d97706' : '#16a34a' },
              { label: 'Simulation Type',   value: tx.simulationType ?? '—' },
              { label: 'Flagged',           value: tx.flagged ? 'Yes — Fraud Flagged' : 'No — Clear', color: tx.flagged ? '#dc2626' : '#16a34a' },
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
export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('All')
  const [search,   setSearch]   = useState('')
  const [page,     setPage]     = useState(1)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    api.get('/simulation/all')
      .then(res => setTransactions(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error('Transactions error:', err))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { setPage(1) }, [filter, search])

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      const risk = getRiskStr(tx)
      const matchFilter =
        filter === 'All'    ? true :
        filter === 'Safe'   ? risk === 'SAFE'   :
        filter === 'Medium' ? risk === 'MEDIUM' :
        filter === 'High'   ? risk === 'HIGH'   : true
      const q = search.toLowerCase()
      return matchFilter && (!q ||
        String(getId(tx)).toLowerCase().includes(q) ||
        getSender(tx).toLowerCase().includes(q)     ||
        getReceiver(tx).toLowerCase().includes(q)   ||
        getMerchant(tx).toLowerCase().includes(q))
    })
  }, [transactions, filter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const getRiskBadge = tx => {
    const s = getRiskStr(tx)
<<<<<<< HEAD
    if (s === 'HIGH')   return <span style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.4px', border: '1px solid rgba(255,255,255,0.4)' }}>HIGH</span>
    if (s === 'MEDIUM') return <span style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.4px', border: '1px solid rgba(255,255,255,0.4)' }}>MEDIUM</span>
    return <span style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.4px', border: '1px solid rgba(255,255,255,0.4)' }}>SAFE</span>
=======
    if (s === 'HIGH')   return <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fca5a5' }}>HIGH</span>
    if (s === 'MEDIUM') return <span style={{ background: '#fef9c3', color: '#d97706', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fde68a' }}>MEDIUM</span>
    return <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>SAFE</span>
>>>>>>> f9ff47d (Initial commit)
  }

  return (
    <div style={{ padding: '24px 28px', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexShrink: 0 }}>
        <ArrowLeftRight size={20} color="#0284c7" />
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a' }}>Transactions</h1>
      </div>
      <p style={{ fontSize: '13px', color: '#475569', marginBottom: '14px', flexShrink: 0 }}>
        Click any row to view full transaction details
      </p>

      {/* Filters + Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexShrink: 0 }}>
        {['All', 'Safe', 'Medium', 'High'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '7px 18px', fontSize: '12px', fontWeight: '600',
            borderRadius: '7px', cursor: 'pointer', border: 'none',
            background: filter === f
              ? f === 'High'   ? '#dc2626'
              : f === 'Medium' ? '#d97706'
              : f === 'Safe'   ? '#16a34a'
              :                  '#0284c7'
              : '#e2e8f0',
            color: filter === f ? '#ffffff' : '#475569',
            transition: 'all 0.15s',
          }}>
            {f}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            placeholder="Search ID, account, merchant..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '32px', paddingRight: '12px', height: '36px', width: '230px', fontSize: '12px', border: '1.5px solid #cbd5e1', borderRadius: '8px', background: '#ffffff', color: '#0f172a', outline: 'none' }}
          />
        </div>
      </div>

      {/* Table Card */}
<<<<<<< HEAD
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', minHeight: 0 }}>
        {/* Top Bar */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid #e2e8f0', background: '#f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
=======
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', minHeight: 0 }}>
        {/* Top Bar */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
>>>>>>> f9ff47d (Initial commit)
          <span style={{ fontSize: '12px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace', fontWeight: '600' }}>
            {filtered.length} TRANSACTIONS
          </span>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>
            Page {page} of {totalPages}
          </span>
        </div>

        {/* Scrollable Table */}
        <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto', minHeight: 0 }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '12px' }}>
              <div style={{ width: 28, height: 28, border: '3px solid #e2e8f0', borderTopColor: '#0284c7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ fontSize: '13px', color: '#64748b' }}>Fetching transactions...</p>
            </div>
          ) : (
            <table style={{ width: '100%', minWidth: '1100px', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
<<<<<<< HEAD
                <tr style={{ background: '#e2e8f0' }}>
                  {['ID','Sender','Receiver','Amount','Timestamp','Risk','Fraud Score','Merchant','Foreign','Location','Device','Velocity','Age','Flagged']
                    .map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: '#475569', letterSpacing: '0.6px', textTransform: 'uppercase', borderBottom: '2px solid #cbd5e1', whiteSpace: 'nowrap' }}>
=======
                <tr style={{ background: '#f1f5f9' }}>
                  {['ID','Sender','Receiver','Amount','Timestamp','Risk','Fraud Score','Merchant','Foreign','Location','Device','Velocity','Age','Flagged']
                    .map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: '#64748b', letterSpacing: '0.6px', textTransform: 'uppercase', borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap' }}>
>>>>>>> f9ff47d (Initial commit)
                        {h}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={14} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '13px' }}>
                      No transactions found
                    </td>
                  </tr>
                ) : paginated.map((tx, i) => {
                  const risk   = getRiskStr(tx)
<<<<<<< HEAD
                  const rt     = ROW_THEME[risk] || ROW_THEME.SAFE
=======
                  const rf     = ROW_FONT[risk] || ROW_FONT.SAFE
>>>>>>> f9ff47d (Initial commit)
                  const score  = getScore(tx)
                  const device = getDevice(tx)
                  // Alternating plain white / very light grey background
                  const rowBg  = i % 2 === 0 ? '#ffffff' : '#f8fafc'
                  return (
                    <tr key={i}
<<<<<<< HEAD
                      style={{ background: rt.base, borderLeft: `4px solid ${rt.border}`, cursor: 'pointer', transition: 'background 0.15s', borderBottom: `1px solid ${rt.border}` }}
                      onMouseEnter={e => e.currentTarget.style.background = rt.hover}
                      onMouseLeave={e => e.currentTarget.style.background = rt.base}
                      onClick={() => setSelected(tx)}
                    >
                      {/* All td fonts white on solid color background */}
                      <td style={{ padding: '9px 12px', color: '#ffffff', fontFamily: 'JetBrains Mono, monospace', fontWeight: '800', fontSize: '12px', whiteSpace: 'nowrap' }}>{getId(tx)}</td>
                      <td style={{ padding: '9px 12px', color: 'rgba(255,255,255,0.92)', fontFamily: 'JetBrains Mono, monospace', fontWeight: '600', fontSize: '11px', whiteSpace: 'nowrap' }}>{getSender(tx)}</td>
                      <td style={{ padding: '9px 12px', color: 'rgba(255,255,255,0.85)', fontFamily: 'JetBrains Mono, monospace', fontWeight: '600', fontSize: '11px', whiteSpace: 'nowrap' }}>{getReceiver(tx)}</td>
                      <td style={{ padding: '9px 12px', color: '#ffffff', fontWeight: '800', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', whiteSpace: 'nowrap' }}>{formatINR(tx.amount)}</td>
                      <td style={{ padding: '9px 12px', color: 'rgba(255,255,255,0.80)', fontSize: '11px', whiteSpace: 'nowrap' }}>{tx.timestamp ? new Date(tx.timestamp).toLocaleString('en-IN') : '—'}</td>
                      <td style={{ padding: '9px 12px' }}>{getRiskBadge(tx)}</td>
                      <td style={{ padding: '9px 12px', fontFamily: 'JetBrains Mono, monospace', fontWeight: '700', fontSize: '12px', color: '#ffffff', whiteSpace: 'nowrap' }}>
                        {score !== null ? Number(score).toFixed(2) : '—'}
                      </td>
                      <td style={{ padding: '9px 12px', color: 'rgba(255,255,255,0.90)', fontSize: '12px', fontWeight: '600' }}>{getMerchant(tx)}</td>
                      <td style={{ padding: '9px 12px', fontSize: '12px', fontWeight: '700', color: '#ffffff' }}>
                        {tx.foreignTransaction === 1 ? 'Yes' : 'No'}
                      </td>
                      <td style={{ padding: '9px 12px', fontSize: '12px', fontWeight: '700', color: tx.locationMismatch === 1 ? '#fef08a' : '#ffffff' }}>
                        {tx.locationMismatch === 1 ? 'Mismatch' : 'OK'}
                      </td>
                      <td style={{ padding: '9px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: '600', color: device !== null && device < 0.3 ? '#fef08a' : 'rgba(255,255,255,0.85)' }}>
                        {device !== null ? Number(device).toFixed(3) : '—'}
                      </td>
                      <td style={{ padding: '9px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'rgba(255,255,255,0.85)', fontWeight: '600' }}>{getVelocity(tx)}</td>
                      <td style={{ padding: '9px 12px', fontSize: '12px', color: 'rgba(255,255,255,0.85)', fontWeight: '600' }}>{tx.cardholderAge ?? '—'}</td>
                      <td style={{ padding: '9px 12px', fontSize: '12px', fontWeight: '800', color: tx.flagged ? '#fef08a' : '#ffffff' }}>
=======
                      style={{ background: rowBg, borderLeft: `4px solid ${rf.border}`, cursor: 'pointer', transition: 'background 0.15s', borderBottom: '1px solid #f1f5f9' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                      onMouseLeave={e => e.currentTarget.style.background = rowBg}
                      onClick={() => setSelected(tx)}
                    >
                      {/* ID — colored per risk */}
                      <td style={{ padding: '9px 12px', color: rf.id, fontFamily: 'JetBrains Mono, monospace', fontWeight: '800', fontSize: '12px', whiteSpace: 'nowrap' }}>{getId(tx)}</td>
                      {/* Sender */}
                      <td style={{ padding: '9px 12px', color: rf.text, fontFamily: 'JetBrains Mono, monospace', fontWeight: '600', fontSize: '11px', whiteSpace: 'nowrap' }}>{getSender(tx)}</td>
                      {/* Receiver */}
                      <td style={{ padding: '9px 12px', color: rf.text, fontFamily: 'JetBrains Mono, monospace', fontWeight: '600', fontSize: '11px', whiteSpace: 'nowrap' }}>{getReceiver(tx)}</td>
                      {/* Amount */}
                      <td style={{ padding: '9px 12px', color: rf.amount, fontWeight: '800', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', whiteSpace: 'nowrap' }}>{formatINR(tx.amount)}</td>
                      {/* Timestamp */}
                      <td style={{ padding: '9px 12px', color: '#64748b', fontSize: '11px', whiteSpace: 'nowrap' }}>{tx.timestamp ? new Date(tx.timestamp).toLocaleString('en-IN') : '—'}</td>
                      {/* Risk Badge */}
                      <td style={{ padding: '9px 12px' }}>{getRiskBadge(tx)}</td>
                      {/* Fraud Score */}
                      <td style={{ padding: '9px 12px', fontFamily: 'JetBrains Mono, monospace', fontWeight: '700', fontSize: '12px', color: rf.score, whiteSpace: 'nowrap' }}>
                        {score !== null ? Number(score).toFixed(2) : '—'}
                      </td>
                      {/* Merchant */}
                      <td style={{ padding: '9px 12px', color: rf.text, fontSize: '12px', fontWeight: '600' }}>{getMerchant(tx)}</td>
                      {/* Foreign */}
                      <td style={{ padding: '9px 12px', fontSize: '12px', fontWeight: '700', color: tx.foreignTransaction === 1 ? '#d97706' : '#64748b' }}>
                        {tx.foreignTransaction === 1 ? 'Yes' : 'No'}
                      </td>
                      {/* Location */}
                      <td style={{ padding: '9px 12px', fontSize: '12px', fontWeight: '700', color: tx.locationMismatch === 1 ? '#d97706' : '#64748b' }}>
                        {tx.locationMismatch === 1 ? 'Mismatch' : 'OK'}
                      </td>
                      {/* Device */}
                      <td style={{ padding: '9px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: '600', color: device !== null && device < 0.3 ? '#dc2626' : '#64748b' }}>
                        {device !== null ? Number(device).toFixed(3) : '—'}
                      </td>
                      {/* Velocity */}
                      <td style={{ padding: '9px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>{getVelocity(tx)}</td>
                      {/* Age */}
                      <td style={{ padding: '9px 12px', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>{tx.cardholderAge ?? '—'}</td>
                      {/* Flagged */}
                      <td style={{ padding: '9px 12px', fontSize: '12px', fontWeight: '800', color: tx.flagged ? '#dc2626' : '#16a34a' }}>
>>>>>>> f9ff47d (Initial commit)
                        {tx.flagged ? 'Yes' : 'No'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && filtered.length > PAGE_SIZE && (
<<<<<<< HEAD
          <div style={{ padding: '10px 16px', borderTop: '1px solid #e2e8f0', background: '#f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
=======
          <div style={{ padding: '10px 16px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
>>>>>>> f9ff47d (Initial commit)
            <span style={{ fontSize: '12px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>
              Showing {((page-1)*PAGE_SIZE)+1}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[
                { label: '«', action: () => setPage(1),         disabled: page === 1 },
                { label: '‹', action: () => setPage(p => p-1), disabled: page === 1 },
              ].map(({ label, action, disabled }) => (
                <button key={label} onClick={action} disabled={disabled}
<<<<<<< HEAD
                  style={{ width: 30, height: 30, borderRadius: '6px', border: '1px solid #cbd5e1', background: disabled ? '#f1f5f9' : '#ffffff', color: disabled ? '#cbd5e1' : '#64748b', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: '13px' }}>
=======
                  style={{ width: 30, height: 30, borderRadius: '6px', border: '1px solid #e2e8f0', background: disabled ? '#f8fafc' : '#ffffff', color: disabled ? '#cbd5e1' : '#64748b', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: '13px' }}>
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
                    style={{ width: 30, height: 30, borderRadius: '6px', border: '1px solid #cbd5e1', background: page === p ? '#0284c7' : '#ffffff', color: page === p ? '#ffffff' : '#64748b', cursor: 'pointer', fontSize: '12px', fontWeight: page === p ? '700' : '400' }}>
=======
                    style={{ width: 30, height: 30, borderRadius: '6px', border: '1px solid #e2e8f0', background: page === p ? '#0284c7' : '#ffffff', color: page === p ? '#ffffff' : '#64748b', cursor: 'pointer', fontSize: '12px', fontWeight: page === p ? '700' : '400' }}>
>>>>>>> f9ff47d (Initial commit)
                    {p}
                  </button>
                )
              })}
              {[
                { label: '›', action: () => setPage(p => p+1), disabled: page === totalPages },
                { label: '»', action: () => setPage(totalPages), disabled: page === totalPages },
              ].map(({ label, action, disabled }) => (
                <button key={label} onClick={action} disabled={disabled}
<<<<<<< HEAD
                  style={{ width: 30, height: 30, borderRadius: '6px', border: '1px solid #cbd5e1', background: disabled ? '#f1f5f9' : '#ffffff', color: disabled ? '#cbd5e1' : '#64748b', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: '13px' }}>
=======
                  style={{ width: 30, height: 30, borderRadius: '6px', border: '1px solid #e2e8f0', background: disabled ? '#f8fafc' : '#ffffff', color: disabled ? '#cbd5e1' : '#64748b', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: '13px' }}>
>>>>>>> f9ff47d (Initial commit)
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {selected && <TransactionModal tx={selected} onClose={() => setSelected(null)} />}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
