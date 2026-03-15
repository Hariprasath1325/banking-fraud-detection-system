import React, { useState, useEffect } from 'react'
import api from '../api/axios'
import { Activity } from 'lucide-react'

export default function Metrics() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/simulation/metrics')
      .then(res => setMetrics(res.data))
      .catch(err => console.error('Metrics error:', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="page-container">
      <div className="loading-wrap"><div className="spinner" /></div>
    </div>
  )

  const tp = metrics?.truePositive ?? metrics?.tp ?? 0
  const fp = metrics?.falsePositive ?? metrics?.fp ?? 0
  const fn = metrics?.falseNegative ?? metrics?.fn ?? 0
  const tn = metrics?.trueNegative  ?? metrics?.tn ?? 0
  const precision = metrics?.precision ?? 0
  const recall    = metrics?.recall    ?? 0
  const f1 = (precision + recall > 0) ? (2 * precision * recall) / (precision + recall) : 0
  const total = tp + fp + fn + tn
  const acc = total > 0 ? (((tp + tn) / total) * 100).toFixed(1) : '0.0'

  return (
    <div className="page-container animate-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <Activity size={20} color="var(--accent-cyan)" />
        <h1 style={{ fontSize: '24px', fontWeight: '700' }}>ML Performance Metrics</h1>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
        Machine learning model evaluation — precision, recall, and confusion matrix
      </p>

      {/* Metric Cards */}
      <div className="grid-4 mb-20">
        {[
          { label: 'Precision',        value: `${Number(precision).toFixed(1)}%`, color: 'var(--accent-cyan)',   desc: 'Fraud prediction accuracy', cls: 'cyan'   },
          { label: 'Recall',           value: `${Number(recall).toFixed(1)}%`,    color: 'var(--accent-blue)',   desc: 'Fraud detection rate',      cls: 'blue'   },
          { label: 'F1 Score',         value: `${Number(f1).toFixed(1)}%`,        color: 'var(--accent-purple)', desc: 'Harmonic mean',             cls: 'purple' },
          { label: 'Overall Accuracy', value: `${acc}%`,                          color: 'var(--accent-green)',  desc: 'All correct predictions',   cls: 'green'  },
        ].map(({ label, value, color, desc, cls }) => (
          <div key={label} className={`stat-card ${cls}`}>
            <div className="stat-label">{label}</div>
            <div className={`stat-value ${cls}`}>{value}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>{desc}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Performance Bars */}
        <div className="card">
          <div className="section-title"><Activity size={14} />Performance Indicators</div>
          {[
            { label: 'Precision',           value: precision,       color: 'var(--accent-cyan)'   },
            { label: 'Recall (Sensitivity)', value: recall,         color: 'var(--accent-blue)'   },
            { label: 'F1 Score',            value: f1,              color: 'var(--accent-purple)' },
            { label: 'Overall Accuracy',    value: parseFloat(acc), color: 'var(--accent-green)'  },
          ].map(({ label, value, color }) => (
            <div key={label} className="metric-row">
              <div className="metric-label-row">
                <span className="metric-label">{label}</span>
                <span className="metric-val" style={{ color }}>{Number(value).toFixed(1)}%</span>
              </div>
              <div className="metric-track">
                <div className="metric-fill" style={{ width: `${Math.min(value, 100)}%`, background: color }} />
              </div>
            </div>
          ))}
        </div>

        {/* Confusion Matrix */}
        <div className="card">
          <div className="section-title">Confusion Matrix</div>
          <div className="confusion-matrix">
            {[
              { label: 'True Positive',  value: tp, color: 'var(--accent-green)',  desc: 'Fraud correctly detected' },
              { label: 'False Positive', value: fp, color: 'var(--accent-red)',    desc: 'Safe flagged as fraud'    },
              { label: 'False Negative', value: fn, color: 'var(--accent-orange)', desc: 'Fraud missed by model'    },
              { label: 'True Negative',  value: tn, color: 'var(--accent-cyan)',   desc: 'Safe correctly cleared'   },
            ].map(({ label, value, color, desc }) => (
              <div key={label} className="cm-cell" style={{ borderColor: `${color}30` }}>
                <div className="cm-value" style={{ color }}>{value}</div>
                <div className="cm-label">{label}</div>
                <div className="cm-desc">{desc}</div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '14px', padding: '14px',
            background: 'var(--bg-secondary)', borderRadius: '8px',
            display: 'flex', justifyContent: 'space-around',
          }}>
            {[
              ['Total',     total,   'var(--text-primary)' ],
              ['Correct',   tp + tn, 'var(--accent-green)' ],
              ['Incorrect', fp + fn, 'var(--accent-red)'   ],
            ].map(([l, v, c]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '4px' }}>{l}</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: c, fontFamily: 'var(--font-mono)' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}