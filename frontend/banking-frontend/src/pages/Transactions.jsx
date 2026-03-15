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

// ✅ THE KEY FIX — maps ALL backend values correctly
// Your backend returns: LOW_RISK, MEDIUM_RISK, HIGH_RISK
// simulationType returns: SAFE, MEDIUM, HIGH
const getRiskStr = tx => {
  const fraudStatus  = (tx.fraudStatus   || '').toUpperCase()
  const simType      = (tx.simulationType || '').toUpperCase()

  // Check fraudStatus first
  if (fraudStatus === 'LOW_RISK'    || fraudStatus === 'SAFE')   return 'SAFE'
  if (fraudStatus === 'MEDIUM_RISK' || fraudStatus === 'MEDIUM') return 'MEDIUM'
  if (fraudStatus === 'HIGH_RISK'   || fraudStatus === 'HIGH')   return 'HIGH'

  // Fallback to simulationType
  if (simType === 'SAFE'   || simType === 'LOW_RISK')    return 'SAFE'
  if (simType === 'MEDIUM' || simType === 'MEDIUM_RISK') return 'MEDIUM'
  if (simType === 'HIGH'   || simType === 'HIGH_RISK')   return 'HIGH'

  return 'SAFE' // default
}

const formatINR = amount =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount || 0)

const getScoreColor = score => {
  if (score === null) return 'var(--text-muted)'
  if (score >= 100)   return 'var(--accent-red)'
  if (score >= 50)    return 'var(--accent-orange)'
  return 'var(--accent-green)'
}

// ─── Transaction Detail Modal ─────────────────────────────────────────────────
function TransactionModal({ tx, onClose }) {
  if (!tx) return null
  const score  = getScore(tx)
  const device = getDevice(tx)
  const risk   = getRiskStr(tx)

  const riskColor = risk === 'HIGH' ? '#dc2626' : risk === 'MEDIUM' ? '#ea580c' : '#059669'
  const riskBg    = risk === 'HIGH' ? 'rgba(220,38,38,0.08)' : risk === 'MEDIUM' ? 'rgba(234,88,12,0.08)' : 'rgba(5,150,105,0.08)'

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15,23,42,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff', borderRadius: '14px',
          border: '1px solid #b8d9f0',
          width: '580px', maxWidth: '95vw',
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #b8d9f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#f0f8ff',
          borderRadius: '14px 14px 0 0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {risk === 'HIGH' || risk === 'MEDIUM'
              ? <AlertTriangle size={18} color={riskColor} />
              : <CheckCircle  size={18} color={riskColor} />}
            <div>
              <div style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a' }}>
                Transaction #{getId(tx)}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '1px' }}>
                {tx.timestamp ? new Date(tx.timestamp).toLocaleString('en-IN') : '—'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#94a3b8', padding: '4px', borderRadius: '6px',
              display: 'flex', alignItems: 'center',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
            onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Risk Banner + Reason */}
        <div style={{
          margin: '16px 24px 0',
          padding: '12px 16px',
          background: riskBg, borderRadius: '8px',
          border: `1px solid ${riskColor}30`,
          display: 'flex', alignItems: 'flex-start', gap: '10px',
        }}>
          <Info size={15} color={riskColor} style={{ marginTop: '2px', minWidth: 15 }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: riskColor, marginBottom: '4px', letterSpacing: '0.4px' }}>
              {risk === 'HIGH'
                ? '⚠ HIGH RISK — FLAGGED FOR FRAUD'
                : risk === 'MEDIUM'
                ? '⚡ MEDIUM RISK — UNDER REVIEW'
                : '✓ LOW RISK — SAFE TRANSACTION'}
            </div>
            <div style={{ fontSize: '12px', color: '#374151', lineHeight: '1.7' }}>
              {tx.message || 'No additional details available.'}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div style={{ padding: '16px 24px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { label: 'Transaction ID',    value: getId(tx),    mono: true },
              { label: 'Status',            value: tx.status ?? '—' },
              { label: 'Sender Account',    value: getSender(tx),   mono: true },
              { label: 'Receiver Account',  value: getReceiver(tx), mono: true },
              { label: 'Amount',            value: formatINR(tx.amount), bold: true, color: '#0284c7' },
              { label: 'Fraud Score',       value: score !== null ? Number(score).toFixed(3) : '—', mono: true, color: getScoreColor(score) },
              { label: 'Merchant',          value: getMerchant(tx) },
              { label: 'Cardholder Age',    value: tx.cardholderAge ?? '—' },
              { label: 'Device Trust',      value: device !== null ? Number(device).toFixed(4) : '—', mono: true, color: device !== null && device < 0.3 ? '#dc2626' : '#059669' },
              { label: 'Velocity (24h)',    value: getVelocity(tx), mono: true },
              { label: 'Foreign Txn',       value: (tx.foreignTransaction === 1 || tx.foreignTransaction === true) ? 'Yes' : 'No', color: (tx.foreignTransaction === 1 || tx.foreignTransaction === true) ? '#ea580c' : '#059669' },
              { label: 'Location Mismatch', value: (tx.locationMismatch === 1 || tx.locationMismatch === true) ? 'Yes — Mismatch' : 'No — OK', color: (tx.locationMismatch === 1 || tx.locationMismatch === true) ? '#ea580c' : '#059669' },
              { label: 'Simulation Type',   value: tx.simulationType ?? '—' },
              { label: 'Flagged',           value: tx.flagged ? 'Yes — Fraud Flagged' : 'No — Clear', color: tx.flagged ? '#dc2626' : '#059669' },
            ].map(({ label, value, mono, bold, color }) => (
              <div key={label} style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '11px 14px',
              }}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '5px' }}>
                  {label}
                </div>
                <div style={{
                  fontSize: '13px',
                  fontFamily: mono ? 'var(--font-mono)' : 'var(--font-main)',
                  fontWeight: bold ? '700' : '600',
                  color: color ?? '#0f172a',
                  wordBreak: 'break-all',
                }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Transactions Page ───────────────────────────────────────────────────
export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading]           = useState(true)
  const [filter, setFilter]             = useState('All')
  const [search, setSearch]             = useState('')
  const [page, setPage]                 = useState(1)
  const [selected, setSelected]         = useState(null)

  useEffect(() => {
    api.get('/simulation/all')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : []
        console.log('Sample tx:', data[0]) // debug — remove later
        setTransactions(data)
      })
      .catch(err => console.error('Transactions error:', err))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { setPage(1) }, [filter, search])

  // ✅ Filter logic using corrected getRiskStr
  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      const risk = getRiskStr(tx)

      const matchFilter =
        filter === 'All'    ? true :
        filter === 'Safe'   ? risk === 'SAFE'   :
        filter === 'Medium' ? risk === 'MEDIUM' :
        filter === 'High'   ? risk === 'HIGH'   : true

      const q = search.toLowerCase()
      const matchSearch = !q ||
        String(getId(tx)).toLowerCase().includes(q)  ||
        getSender(tx).toLowerCase().includes(q)      ||
        getReceiver(tx).toLowerCase().includes(q)    ||
        getMerchant(tx).toLowerCase().includes(q)

      return matchFilter && matchSearch
    })
  }, [transactions, filter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const getRiskBadge = tx => {
    const s = getRiskStr(tx)
    if (s === 'HIGH')   return <span className="badge badge-high">HIGH</span>
    if (s === 'MEDIUM') return <span className="badge badge-medium">MEDIUM</span>
    return <span className="badge badge-low">SAFE</span>
  }

  return (
    <div style={{
      padding: '24px 28px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxSizing: 'border-box',
    }}>
      {/* Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexShrink: 0 }}>
        <ArrowLeftRight size={20} color="var(--accent-cyan)" />
        <h1 style={{ fontSize: '22px', fontWeight: '700' }}>Transactions</h1>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px', flexShrink: 0 }}>
        Click any row to view full transaction details
      </p>

      {/* Filters + Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexShrink: 0, flexWrap: 'wrap' }}>
        {['All', 'Safe', 'Medium', 'High'].map(f => (
          <button
            key={f}
            className={`btn btn-ghost ${filter === f ? 'active' : ''}`}
            style={{ padding: '7px 16px', fontSize: '12px' }}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', position: 'relative' }}>
          <Search size={13} style={{
            position: 'absolute', left: '11px', top: '50%',
            transform: 'translateY(-50%)', color: 'var(--text-muted)',
          }} />
          <input
            className="search-input"
            placeholder="Search ID, account, merchant..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '220px', fontSize: '12px' }}
          />
        </div>
      </div>

      {/* Table Card */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow)',
        minHeight: 0,
      }}>
        {/* Table Top Bar */}
        <div style={{
          padding: '10px 16px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: '600' }}>
            {filtered.length} TRANSACTIONS
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Page {page} of {totalPages}
          </span>
        </div>

        {/* Scrollable Table */}
        <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto', minHeight: 0 }}>
          {loading ? (
            <div className="loading-wrap">
              <div className="spinner" />
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Fetching transactions...</p>
            </div>
          ) : (
            <table className="data-table" style={{ minWidth: '1100px' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                <tr>
                  {['ID','Sender','Receiver','Amount','Timestamp','Risk',
                    'Fraud Score','Merchant','Foreign','Location',
                    'Device','Velocity','Age','Flagged']
                    .map(h => (
                      <th key={h} style={{ background: '#dbeafe', fontSize: '10px' }}>{h}</th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={14} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '13px' }}>
                      No transactions found
                    </td>
                  </tr>
                ) : paginated.map((tx, i) => {
                  const score  = getScore(tx)
                  const device = getDevice(tx)
                  return (
                    <tr
  key={i}
style={{
  cursor: 'pointer',
  background:
    getRiskStr(tx) === 'HIGH'   ? 'rgba(220, 38, 38, 0.18)'  :
    getRiskStr(tx) === 'MEDIUM' ? 'rgba(234, 88, 12, 0.15)'  :
                                  'rgba(5, 150, 105, 0.13)',
  borderLeft:
    getRiskStr(tx) === 'HIGH'   ? '4px solid #dc2626' :
    getRiskStr(tx) === 'MEDIUM' ? '4px solid #f97316' :
                                  '4px solid #16a34a',
}}
onMouseEnter={e => {
  const risk = getRiskStr(tx)
  e.currentTarget.style.background =
    risk === 'HIGH'   ? 'rgba(220, 38, 38, 0.28)' :
    risk === 'MEDIUM' ? 'rgba(234, 88, 12, 0.24)' :
                        'rgba(5, 150, 105, 0.22)'
}}
onMouseLeave={e => {
  const risk = getRiskStr(tx)
  e.currentTarget.style.background =
    risk === 'HIGH'   ? 'rgba(220, 38, 38, 0.18)' :
    risk === 'MEDIUM' ? 'rgba(234, 88, 12, 0.15)' :
                        'rgba(5, 150, 105, 0.13)'
}}
  onClick={() => setSelected(tx)}
>
                      <td style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '12px' }}>
                        {getId(tx)}
                      </td>
                      <td style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                        {getSender(tx)}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                        {getReceiver(tx)}
                      </td>
                      <td style={{ color: '#1d4ed8', fontWeight: '700', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                        {formatINR(tx.amount)}
                      </td>
                      <td style={{ fontSize: '11px' }}>
                        {tx.timestamp ? new Date(tx.timestamp).toLocaleString('en-IN') : '—'}
                      </td>
                      <td>{getRiskBadge(tx)}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '12px', color: getScoreColor(score) }}>
                        {score !== null ? Number(score).toFixed(2) : '—'}
                      </td>
                      <td style={{ fontSize: '12px' }}>{getMerchant(tx)}</td>
                      <td style={{ fontSize: '12px', color: (tx.foreignTransaction === 1 || tx.foreignTransaction === true) ? 'var(--accent-orange)' : 'var(--text-muted)', fontWeight: (tx.foreignTransaction === 1 || tx.foreignTransaction === true) ? '600' : '400' }}>
                        {(tx.foreignTransaction === 1 || tx.foreignTransaction === true) ? 'Yes' : 'No'}
                      </td>
                      <td style={{ fontSize: '12px', color: (tx.locationMismatch === 1 || tx.locationMismatch === true) ? 'var(--accent-orange)' : 'var(--text-secondary)', fontWeight: (tx.locationMismatch === 1 || tx.locationMismatch === true) ? '600' : '400' }}>
                        {(tx.locationMismatch === 1 || tx.locationMismatch === true) ? 'Mismatch' : 'OK'}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: device !== null && device < 0.3 ? 'var(--accent-red)' : 'var(--text-secondary)' }}>
                        {device !== null ? Number(device).toFixed(3) : '—'}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                        {getVelocity(tx)}
                      </td>
                      <td style={{ fontSize: '12px' }}>
                        {tx.cardholderAge ?? tx.age ?? '—'}
                      </td>
                      <td style={{ fontSize: '12px', fontWeight: '600', color: tx.flagged ? '#dc2626' : '#059669' }}>
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
          <div className="pagination" style={{ flexShrink: 0 }}>
            <span className="pagination-info">
              Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="pagination-btns">
              <button className="page-btn" onClick={() => setPage(1)} disabled={page === 1}>«</button>
              <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let p = i + 1
                if (totalPages > 5) {
                  if (page <= 3) p = i + 1
                  else if (page >= totalPages - 2) p = totalPages - 4 + i
                  else p = page - 2 + i
                }
                return (
                  <button
                    key={p}
                    className={`page-btn ${page === p ? 'active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                )
              })}
              <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
              <button className="page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && <TransactionModal tx={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}