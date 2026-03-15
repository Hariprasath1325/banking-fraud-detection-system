import React, { useState, useEffect } from 'react'
import api from '../api/axios'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts'
import { BarChart3, TrendingUp } from 'lucide-react'

const tt = {
  contentStyle: {
    background: '#ffffff', border: '1px solid #b8d9f0',
    borderRadius: '8px', fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#0f172a',
  },
  labelStyle: { color: '#64748b' },
}

// ✅ Fixed: handles LOW_RISK = SAFE
const getRisk = t => {
  const s = (t.fraudStatus ?? t.simulationType ?? t.riskLevel ?? '').toUpperCase()
  if (s === 'LOW_RISK' || s === 'SAFE') return 'SAFE'
  if (s === 'MEDIUM_RISK' || s === 'MEDIUM') return 'MEDIUM'
  if (s === 'HIGH_RISK' || s === 'HIGH') return 'HIGH'
  return s
}

export default function Analytics() {
  const [allTx,     setAllTx]     = useState([])
  const [summary,   setSummary]   = useState(null)
  const [fraudRate, setFraudRate] = useState(null)
  const [accuracy,  setAccuracy]  = useState(null)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/simulation/all'),
      api.get('/simulation/summary'),
      api.get('/simulation/fraud-rate'),
      api.get('/simulation/binary-accuracy'),
    ]).then(([allRes, sumRes, frRes, accRes]) => {
      setAllTx(Array.isArray(allRes.data) ? allRes.data : [])
      setSummary(sumRes.data)
      setFraudRate(frRes.data)
      setAccuracy(accRes.data)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const total  = summary?.totalSimulated  ?? summary?.total ?? 0
  const high   = summary?.highRiskCount   ?? summary?.highRisk ?? 0
  const fraudRateVal = typeof fraudRate === 'number' ? fraudRate : (fraudRate?.fraudRate ?? fraudRate?.rate ?? 0)
  const accuracyVal  = typeof accuracy  === 'number' ? accuracy  : (accuracy?.accuracy  ?? accuracy?.binaryAccuracy ?? 0)

  // Sample every 5th for cleaner trend — too many points makes it noisy
  const trendData = allTx
    .filter(tx => tx.timestamp && tx.fraudScore != null)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .filter((_, i) => i % 5 === 0)
    .map((tx, i) => ({
      idx: i + 1,
      score: parseFloat(Number(tx.fraudScore).toFixed(1)),
    }))

  // Group by 30 transactions for cleaner bars
  const grouped = []
  for (let i = 0; i < allTx.length; i += 30) {
    const chunk = allTx.slice(i, i + 30)
    grouped.push({
      group: `${i + 1}`,
      // ✅ Uses getRisk which correctly maps LOW_RISK → SAFE
      safe:   chunk.filter(t => getRisk(t) === 'SAFE').length,
      medium: chunk.filter(t => getRisk(t) === 'MEDIUM').length,
      high:   chunk.filter(t => getRisk(t) === 'HIGH').length,
    })
  }

  if (loading) return (
    <div className="page-container">
      <div className="loading-wrap"><div className="spinner" /></div>
    </div>
  )

  return (
    <div style={{ padding: '24px 28px', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <BarChart3 size={20} color="var(--accent-cyan)" />
        <h1 style={{ fontSize: '22px', fontWeight: '700' }}>Analytics</h1>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
        Statistical insights and fraud pattern analysis
      </p>

      {/* Top Stats — compact */}
      <div className="grid-4" style={{ marginBottom: '16px' }}>
        {[
          { label: 'Total Transactions', value: total,                                color: 'var(--accent-cyan)'   },
          { label: 'Fraud Rate',         value: `${Number(fraudRateVal).toFixed(1)}%`, color: 'var(--accent-red)'    },
          { label: 'ML Accuracy',        value: `${Number(accuracyVal).toFixed(1)}%`,  color: 'var(--accent-green)'  },
          { label: 'High Risk',          value: high,                                 color: 'var(--accent-orange)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color, fontFamily: 'var(--font-mono)' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Fraud Score Trend — fixed height, fits screen */}
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px 20px', marginBottom: '14px', boxShadow: 'var(--shadow)' }}>
        <div className="section-title" style={{ marginBottom: '12px' }}><TrendingUp size={13} />Fraud Score Trend Over Time</div>
        {trendData.length === 0 ? (
          <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No data</div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#dc2626" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="idx" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip {...tt} formatter={v => [v, 'Fraud Score']} />
              <Area type="monotone" dataKey="score" stroke="#dc2626" strokeWidth={1.5} fill="url(#sg)" dot={false} activeDot={{ r: 3, fill: '#dc2626' }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Risk Distribution — fixed height */}
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px 20px', boxShadow: 'var(--shadow)' }}>
        <div className="section-title" style={{ marginBottom: '12px' }}><BarChart3 size={13} />Risk Distribution by Transaction Group</div>
        {grouped.length === 0 ? (
          <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No data</div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={grouped} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="group" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip {...tt} />
              <Legend formatter={v => <span style={{ fontSize: 11, color: '#334155', fontWeight: '500' }}>{v}</span>} />
              <Bar dataKey="safe"   name="Safe"      fill="#059669" opacity={0.85} radius={[3,3,0,0]} maxBarSize={22} />
              <Bar dataKey="medium" name="Medium"    fill="#ea580c" opacity={0.85} radius={[3,3,0,0]} maxBarSize={22} />
              <Bar dataKey="high"   name="High Risk" fill="#dc2626" opacity={0.85} radius={[3,3,0,0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}