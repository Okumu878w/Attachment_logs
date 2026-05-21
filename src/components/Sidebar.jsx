import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const links = [
  { to: '/dashboard',  icon: 'ti-layout-dashboard', label: 'Dashboard' },
  { to: '/new-entry',  icon: 'ti-plus',              label: 'New Entry' },
  { to: '/entries',    icon: 'ti-list',              label: 'All Entries' },
  { to: '/schemes',    icon: 'ti-table',             label: 'Schemes of Work' },
  { to: '/weekly',     icon: 'ti-calendar-week',     label: 'Weekly Summary' },
  { to: '/payments',   icon: 'ti-credit-card',       label: 'Payments' },
  { to: '/profile',    icon: 'ti-user',              label: 'Profile' },
]

export default function Sidebar() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const name = profile?.full_name || user?.email?.split('@')[0] || '?'
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <aside style={{
      width: 230, flexShrink: 0,
      background: 'var(--ink)', color: 'white',
      display: 'flex', flexDirection: 'column',
      padding: '1.5rem 1rem', overflowY: 'auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2rem', padding: '0 0.5rem' }}>
        <div style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.12)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="ti ti-notebook" style={{ fontSize: 16 }} />
        </div>
        <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 18 }}>AttachLog</span>
      </div>

      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', padding: '0 0.75rem', marginBottom: 6 }}>Menu</div>
      {links.map(({ to, icon, label }) => (
        <NavLink key={to} to={to} style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 12px', borderRadius: 8,
          fontSize: 14, fontWeight: isActive ? 500 : 400,
          color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
          background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
          textDecoration: 'none', transition: 'all .15s', marginBottom: 2,
        })}>
          <i className={`ti ${icon}`} style={{ fontSize: 17 }} />
          {label}
        </NavLink>
      ))}

      <button onClick={handleLogout} style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 12px', borderRadius: 8,
        fontSize: 14, color: 'rgba(255,255,255,0.6)',
        background: 'transparent', border: 'none',
        cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
        transition: 'all .15s', marginTop: 4,
      }}
        onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}
        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.background = 'transparent' }}
      >
        <i className="ti ti-logout" style={{ fontSize: 17 }} /> Sign out
      </button>

      <div style={{ marginTop: 'auto', padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--gold-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: 'white', flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: 13, color: 'white', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
        </div>
      </div>
    </aside>
  )
}
