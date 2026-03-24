import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, ArrowLeftRight, ShieldAlert,
  BarChart3, Activity, LogOut, Zap, ChevronLeft, ChevronRight,
  Shield, UserCheck,
} from 'lucide-react'

const navItems = [
  { path: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { path: '/transactions', label: 'Transactions', icon: ArrowLeftRight  },
  { path: '/fraud-alerts', label: 'Fraud Alerts', icon: ShieldAlert     },
  { path: '/analytics',    label: 'Analytics',    icon: BarChart3       },
  { path: '/metrics',      label: 'ML Metrics',   icon: Activity        },
]

export default function Sidebar({ collapsed, setCollapsed }) {
  const { logout, user, role, isAdmin } = useAuth()
  const navigate = useNavigate()
  const w = collapsed ? 64 : 240

  const roleLabel = isAdmin ? 'Admin' : 'Analyst'
  const roleColor = isAdmin ? '#38bdf8' : '#6ee7b7'
  const roleBg    = isAdmin ? 'rgba(56,189,248,0.12)' : 'rgba(110,231,183,0.12)'
  const RoleIcon  = isAdmin ? Shield : UserCheck

  return (
    <aside style={{
      width: w, minWidth: w,
      background: '#ffffff',
      borderRight: '1px solid #b8d9f0',
      display: 'flex', flexDirection: 'column',
      height: '100vh', zIndex: 10,
      boxShadow: '2px 0 8px rgba(0,0,0,0.06)',
      transition: 'width 0.25s ease, min-width 0.25s ease',
      overflow: 'hidden', position: 'relative',
    }}>
      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: 'absolute', top: '50%', right: -12,
          transform: 'translateY(-50%)',
          width: 24, height: 24, borderRadius: '50%',
          background: '#0284c7', border: '2px solid #ffffff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 20,
          boxShadow: '0 2px 6px rgba(2,132,199,0.4)',
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#0369a1'}
        onMouseLeave={e => e.currentTarget.style.background = '#0284c7'}
      >
        {collapsed ? <ChevronRight size={12} color="#fff" strokeWidth={3} /> : <ChevronLeft size={12} color="#fff" strokeWidth={3} />}
      </button>

      {/* Logo */}
      <div style={{ padding: collapsed ? '20px 14px' : '22px 20px 18px', borderBottom: '1px solid #b8d9f0', transition: 'padding 0.25s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 10, justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <div style={{ width: 34, height: 34, minWidth: 34, background: 'linear-gradient(135deg, #0284c7, #1d4ed8)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(2,132,199,0.35)' }}>
            <Zap size={16} color="#ffffff" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '-0.3px', color: '#0f172a', whiteSpace: 'nowrap' }}>FraudShield</div>
              <div style={{ fontSize: '10px', color: '#64748b', letterSpacing: '0.8px', textTransform: 'uppercase', marginTop: '1px', whiteSpace: 'nowrap' }}>Detection System</div>
            </div>
          )}
        </div>
      </div>

      {/* User + Role */}
      {!collapsed && (
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #b8d9f0', background: '#f0f8ff' }}>
          <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '4px', fontWeight: '600' }}>Logged in as</div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#0284c7', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user || 'User'}
          </div>
          {/* Role Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: roleBg, border: `1px solid ${roleColor}40`, borderRadius: '6px', padding: '3px 8px' }}>
            <RoleIcon size={11} color={roleColor} />
            <span style={{ fontSize: '11px', fontWeight: '700', color: roleColor, letterSpacing: '0.3px' }}>
              {roleLabel}
            </span>
          </div>
        </div>
      )}

      {/* Collapsed role indicator */}
      {collapsed && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0', borderBottom: '1px solid #b8d9f0' }}>
          <div style={{ width: 28, height: 28, borderRadius: '7px', background: roleBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={roleLabel}>
            <RoleIcon size={14} color={roleColor} />
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: collapsed ? '12px 8px' : '12px 10px', overflowY: 'auto', overflowX: 'hidden' }}>
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink key={path} to={path} title={collapsed ? label : ''} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: collapsed ? 0 : 11,
            padding: collapsed ? '10px' : '10px 13px',
            borderRadius: '8px', marginBottom: '3px',
            textDecoration: 'none',
            fontSize: '13px', fontWeight: isActive ? '700' : '500',
            color: isActive ? '#0284c7' : '#475569',
            background: isActive ? '#e0f2fe' : 'transparent',
            border: isActive ? '1px solid #bae6fd' : '1px solid transparent',
            transition: 'all 0.15s',
          })}>
            {({ isActive }) => (
              <>
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} style={{ minWidth: 16 }} />
                {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: collapsed ? '12px 8px' : '12px 10px', borderTop: '1px solid #b8d9f0' }}>
        <button
          onClick={() => { logout(); navigate('/login') }}
          title={collapsed ? 'Logout' : ''}
          style={{
            width: '100%', display: 'flex', alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: collapsed ? 0 : 11,
            padding: collapsed ? '10px' : '10px 13px',
            borderRadius: '8px',
            background: 'transparent', border: '1px solid transparent',
            color: '#94a3b8', fontSize: '13px', fontWeight: '500',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#dc2626'
            e.currentTarget.style.background = 'rgba(220,38,38,0.06)'
            e.currentTarget.style.borderColor = 'rgba(220,38,38,0.2)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '#94a3b8'
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = 'transparent'
          }}
        >
          <LogOut size={16} style={{ minWidth: 16 }} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}