import React from 'react'
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/dashboard', icon: 'ti-layout-dashboard', label: 'Home' },
  { to: '/new-entry', icon: 'ti-plus',              label: 'New' },
  { to: '/entries',   icon: 'ti-list',              label: 'Entries' },
<<<<<<< HEAD
  { to: '/schemes',   icon: 'ti-table',             label: 'Schemes' },
  { to: '/payments',  icon: 'ti-credit-card',       label: 'Payments' },
=======
  { to: '/payments',  icon: 'ti-credit-card',       label: 'Payments' },
  { to: '/profile',   icon: 'ti-user',              label: 'Profile' },
>>>>>>> 10ebc388965faedd4040a4c75a3fb2b43733df69
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {links.map(({ to, icon, label }) => (
        <NavLink key={to} to={to} className={({ isActive }) => 'bottom-nav-item' + (isActive ? ' active' : '')}>
          {({ isActive }) => (
            <>
              {to === '/new-entry' ? (
                <div className="bottom-nav-fab">
                  <i className={`ti ${icon}`} />
                </div>
              ) : (
                <>
                  <i className={`ti ${icon}`} />
                  <span>{label}</span>
                </>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
