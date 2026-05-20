import React from 'react'

export default function Toast({ toast }) {
  if (!toast) return null
  const bg = toast.type === 'error' ? 'var(--red)' : toast.type === 'warning' ? 'var(--gold)' : 'var(--ink)'
  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', left: '50%',
      transform: 'translateX(-50%)',
      background: bg, color: 'white',
      padding: '10px 22px', borderRadius: 'var(--radius)',
      fontSize: 14, fontWeight: 500,
      boxShadow: 'var(--shadow-md)',
      zIndex: 9999, whiteSpace: 'nowrap',
      animation: 'fadeUp .25s ease',
    }}>
      {toast.msg}
    </div>
  )
}
