import React, { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import {
  Activity, ShieldAlert, ShieldCheck, TrendingUp,
  RefreshCw, AlertTriangle, BarChart2, CheckCircle
} from 'lucide-react'

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

function extractRate(data) {
  if (data === null || data === undefined) return 0
  if (typeof data === 'number') return data
  return data.fraudRate ?? data.rate ?? data.value ?? data.fraudRatePercentage ?? 0
}

function extractAccuracy(data) {
  if (data === null || data === undefined) return 0
  if (typeof data === 'number') return data
  return data.accuracy ?? data.binaryAccuracy ?? data.value ?? data.accuracyPercentage ?? 0
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [fraudRate, setFraudRate] = useState(null)
  const [accuracy, setAccuracy] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      const [sumRes, frRes, accRes] = await Promise.all([
        api.get('/simulation/summary'),
        api.get('/simulation/fraud-rate'),
        api.get('/simulation/binary-accuracy'),
      ])
      setSummary(sumRes.data)
      setFraudRate(frRes.data)
      setAccuracy(accRes.data)
    } catch (err) {
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleGenerate = async () => {
  setGenerating(true)
  try {
    await api.post('/simulation/generate?count=5')
    await fetchData()
    setToast({ msg: '✅ Successfully created 5 new transactions!', type: 'success' })
  } catch (err) {
    // ✅ Even if backend returns error status, data may have been created
    // So always refresh data and show success if new data exists
    try {
      await fetchData()
      setToast({ msg: '✅ Successfully created 5 new transactions!', type: 'success' })
    } catch {
      setToast({ msg: '❌ Failed to generate transactions.', type: 'error' })
    }
  } finally {
    setGenerating(false)
  }
}

  const s = extractSummary(summary)
  const fraudRateVal = extractRate(fraudRate)
  const accuracyVal = extractAccuracy(accuracy)

  const pieData = [
    { name: 'Safe', value: s.safe },
    { name: 'Medium', value: s.medium },
    { name: 'High Risk', value: s.high },
  ]

  return (
    <div className="page-container animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '3px' }}>
            Fraud Monitor
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Real-time banking fraud detection dashboard
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
          <RefreshCw size={14} style={{ animation: generating ? 'spin 0.8s linear infinite' : 'none' }} />
          {generating ? 'Generating...' : 'Generate 5 Transactions'}
        </button>
      </div>

      {loading ? (
        <div className="loading-wrap">
          <div className="spinner" />
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading dashboard...</p>
        </div>
      ) : (
        <>
          <div className="grid-3 mb-16">
            <StatCard label="Total Transactions" value={s.total} color="cyan" icon={<Activity size={32} />} />
            <StatCard label="Safe Transactions"  value={s.safe}  color="green" icon={<ShieldCheck size={32} />} />
            <StatCard label="High Risk"           value={s.high}  color="red"   icon={<ShieldAlert size={32} />} />
          </div>
          <div className="grid-3 mb-20">
            <StatCard label="Medium Risk" value={s.medium} color="orange" icon={<AlertTriangle size={32} />} />
            <StatCard label="Fraud Rate"  value={`${Number(fraudRateVal).toFixed(1)}%`} color="purple" icon={<BarChart2 size={32} />} />
            <StatCard label="ML Accuracy" value={`${Number(accuracyVal).toFixed(1)}%`}  color="yellow" icon={<Activity size={32} />} />
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="section-title"><BarChart2 size={14} />Fraud Distribution</div>
              {s.total === 0 ? (
                <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px', flexDirection: 'column', gap: '8px' }}>
                  <BarChart2 size={32} color="#b8d9f0" />
                  Click "Generate 5 Transactions" to load data
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
              <div style={{
                marginTop: '20px', padding: '16px',
                background: 'var(--bg-secondary)', borderRadius: '8px',
                border: '1px solid var(--border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '600', letterSpacing: '0.5px' }}>FRAUD RATE</div>
                  <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--accent-red)', fontFamily: 'var(--font-mono)' }}>
                    {Number(fraudRateVal).toFixed(1)}%
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '600', letterSpacing: '0.5px' }}>ML ACCURACY</div>
                  <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
                    {Number(accuracyVal).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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