import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Zap, Eye, EyeOff, ShieldCheck } from 'lucide-react'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleLogin = async e => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setError(err.message || 'Invalid username or password.')
        return
      }
      const data = await res.json()
      const jwt      = data.token ?? data.jwt ?? data.accessToken
      const userRole = data.role  ?? 'ROLE_ANALYST'
      if (!jwt) { setError('Login failed. No token received.'); return }
      login(jwt, username, userRole)
      navigate('/dashboard', { replace: true })
    } catch {
      setError('Cannot connect to server. Make sure backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      height: '100vh', width: '100vw',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 40%, #dbeafe 100%)',
      fontFamily: 'Inter, sans-serif',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background decorative circles */}
      <div style={{ position: 'absolute', width: 500, height: 500, top: '-150px', left: '-150px', borderRadius: '50%', background: 'rgba(2,132,199,0.12)', filter: 'blur(60px)' }} />
      <div style={{ position: 'absolute', width: 400, height: 400, bottom: '-100px', right: '-100px', borderRadius: '50%', background: 'rgba(29,78,216,0.10)', filter: 'blur(60px)' }} />
      <div style={{ position: 'absolute', width: 250, height: 250, top: '30%', right: '20%', borderRadius: '50%', background: 'rgba(2,132,199,0.07)', filter: 'blur(40px)' }} />

      {/* Card */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #bae6fd',
        borderRadius: '24px',
        padding: '48px 44px',
        width: '400px', maxWidth: '92vw',
        boxShadow: '0 20px 60px rgba(2,132,199,0.15), 0 4px 16px rgba(0,0,0,0.08)',
        zIndex: 1,
        position: 'relative',
      }}>

        {/* Top accent bar */}
        <div style={{
          position: 'absolute', top: 0, left: '10%', right: '10%', height: '3px',
          background: 'linear-gradient(90deg, #0284c7, #1d4ed8)',
          borderRadius: '0 0 6px 6px',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '36px' }}>
          <div style={{
            width: 60, height: 60,
            background: 'linear-gradient(135deg, #0284c7, #1d4ed8)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 24px rgba(2,132,199,0.4)',
            marginBottom: '16px',
          }}>
            <Zap size={28} color="#fff" strokeWidth={2.5} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
            FraudShield
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', letterSpacing: '1.2px', textTransform: 'uppercase', marginTop: '4px', fontWeight: '600' }}>
            Detection System
          </div>
        </div>

        {/* Welcome text */}
        <div style={{ marginBottom: '28px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
            Welcome back
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Sign in to your account to continue
          </p>
        </div>

        <form onSubmit={handleLogin}>
          {/* Username */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              style={{
                width: '100%', padding: '12px 16px',
                fontSize: '14px', boxSizing: 'border-box',
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: '10px', color: '#0f172a',
                outline: 'none', fontFamily: 'Inter, sans-serif',
                transition: 'all 0.2s',
              }}
              onFocus={e => {
                e.target.style.borderColor = '#0284c7'
                e.target.style.background  = '#ffffff'
                e.target.style.boxShadow   = '0 0 0 3px rgba(2,132,199,0.12)'
              }}
              onBlur={e => {
                e.target.style.borderColor = '#e2e8f0'
                e.target.style.background  = '#f8fafc'
                e.target.style.boxShadow   = 'none'
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                style={{
                  width: '100%', padding: '12px 46px 12px 16px',
                  fontSize: '14px', boxSizing: 'border-box',
                  background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '10px', color: '#0f172a',
                  outline: 'none', fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.2s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#0284c7'
                  e.target.style.background  = '#ffffff'
                  e.target.style.boxShadow   = '0 0 0 3px rgba(2,132,199,0.12)'
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#e2e8f0'
                  e.target.style.background  = '#f8fafc'
                  e.target.style.boxShadow   = 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={{
                  position: 'absolute', right: '14px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#94a3b8', padding: 0,
                  display: 'flex', alignItems: 'center',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#0284c7'}
                onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: '20px', padding: '11px 14px',
              background: '#fef2f2', border: '1.5px solid #fecaca',
              borderRadius: '8px', fontSize: '13px', color: '#dc2626',
              display: 'flex', alignItems: 'flex-start', gap: '8px',
              lineHeight: '1.5',
            }}>
              <span style={{ fontSize: '15px', marginTop: '0px' }}>⚠</span>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px',
              fontSize: '14px', fontWeight: '700',
              background: loading
                ? '#93c5fd'
                : 'linear-gradient(135deg, #0284c7, #1d4ed8)',
              color: '#ffffff', border: 'none',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(2,132,199,0.35)',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              letterSpacing: '0.3px',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 6px 24px rgba(2,132,199,0.45)' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.boxShadow = '0 4px 16px rgba(2,132,199,0.35)' }}
          >
            {loading ? (
              <>
                <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Signing in...
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                Sign In
              </>
            )}
          </button>
        </form>

        
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        ::placeholder { color: #94a3b8 !important; }
      `}</style>
    </div>
  )
}