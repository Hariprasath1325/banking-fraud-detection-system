import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { Eye, EyeOff, Zap, Shield, AlertCircle } from 'lucide-react'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { username, password })
      const token = res.data.token || res.data.jwt || res.data.accessToken || res.data
      login(token, username)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      height: '100vh', width: '100vw',
      background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #dbeafe 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-main)',
    }}>
      <div style={{
        background: '#ffffff',
        border: '1px solid #b8d9f0',
        borderRadius: '16px',
        padding: '44px',
        width: '400px',
        boxShadow: '0 20px 40px rgba(2,132,199,0.12)',
        animation: 'fadeInUp 0.4s ease',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '52px', height: '52px', borderRadius: '13px',
            background: 'linear-gradient(135deg, #0284c7, #1d4ed8)',
            marginBottom: '16px',
            boxShadow: '0 4px 14px rgba(2,132,199,0.35)',
          }}>
            <Zap size={24} color="#fff" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.3px' }}>
            FraudShield
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
            Banking Fraud Detection System
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)',
            borderRadius: '8px', padding: '11px 14px', marginBottom: '18px',
            fontSize: '13px', color: '#dc2626',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <AlertCircle size={14} />{error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '7px' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required autoFocus
              style={{
                width: '100%', background: '#f8fafc',
                border: '1px solid #b8d9f0', borderRadius: '8px',
                padding: '11px 14px', fontSize: '14px', color: '#0f172a',
                outline: 'none', transition: 'all 0.2s', fontFamily: 'var(--font-main)',
              }}
              onFocus={e => { e.target.style.borderColor = '#0284c7'; e.target.style.boxShadow = '0 0 0 3px rgba(2,132,199,0.15)' }}
              onBlur={e => { e.target.style.borderColor = '#b8d9f0'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '7px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{
                  width: '100%', background: '#f8fafc',
                  border: '1px solid #b8d9f0', borderRadius: '8px',
                  padding: '11px 44px 11px 14px', fontSize: '14px',
                  color: '#0f172a', outline: 'none', transition: 'all 0.2s',
                  fontFamily: 'var(--font-main)',
                }}
                onFocus={e => { e.target.style.borderColor = '#0284c7'; e.target.style.boxShadow = '0 0 0 3px rgba(2,132,199,0.15)' }}
                onBlur={e => { e.target.style.borderColor = '#b8d9f0'; e.target.style.boxShadow = 'none' }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '14px', padding: '12px' }}>
            {loading
              ? <><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />Signing in...</>
              : <><Shield size={15} />Sign In</>
            }
          </button>
        </form>
      </div>
      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}