import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { payForWeek } from '../lib/paystack'

const WEEKS = Array.from({ length: 12 }, (_, i) => i + 1)

export default function Payments({ showToast }) {
  const { user } = useAuth()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(null)

  useEffect(() => { load() }, [user])

  async function load() {
    const { data } = await supabase.from('payments').select('*').eq('user_id', user.id).order('week')
    setPayments(data || [])
    setLoading(false)
  }

  function isPaid(week) { return payments.some(p => p.week === week && p.status === 'success') }

  async function handlePay(week) {
    setPaying(week)
    try {
      await payForWeek({
        userId: user.id, email: user.email, week,
        onSuccess: () => { showToast(`Week ${week} payment confirmed!`); load(); setPaying(null) },
        onClose: () => setPaying(null),
      })
    } catch (err) {
      showToast('Payment error: ' + err.message, 'error')
      setPaying(null)
    }
  }

  const totalPaid = payments.filter(p => p.status === 'success').length * 40

  if (loading) return <div style={{ display:'flex', justifyContent:'center', paddingTop:'4rem' }}><div className="spinner" /></div>

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ marginBottom:'1.75rem' }}>
        <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:28, fontWeight:400 }}>Payments</h1>
        <div style={{ fontSize:14, color:'var(--ink-light)', marginTop:3 }}>KES 40 per week — pay to unlock entry saving</div>
      </div>

      {/* Summary */}
      <div className="summary-cards" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:'1.5rem' }}>
        {[
          { label:'Weeks paid',    val: payments.filter(p=>p.status==='success').length, icon:'ti-circle-check', color:'var(--green)', bg:'var(--green-light)' },
          { label:'Weeks pending', val: 12 - payments.filter(p=>p.status==='success').length, icon:'ti-clock', color:'var(--gold)', bg:'var(--gold-light)' },
          { label:'Total paid',    val:`KES ${totalPaid}`, icon:'ti-cash', color:'var(--teal)', bg:'var(--teal-light)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding:'1.25rem', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, background:s.bg, color:s.color, flexShrink:0 }}>
              <i className={`ti ${s.icon}`} />
            </div>
            <div>
              <div style={{ fontFamily:'Playfair Display,serif', fontSize:22, lineHeight:1 }}>{s.val}</div>
              <div style={{ fontSize:13, color:'var(--ink-light)', marginTop:3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Week grid */}
      <div className="card">
        <h3 style={{ fontSize:15, fontWeight:500, marginBottom:'1.25rem' }}>Weekly Payment Status</h3>
        <div className="payments-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {WEEKS.map(w => {
            const paid = isPaid(w)
            const p = payments.find(p => p.week === w && p.status === 'success')
            return (
              <div key={w} style={{
                border:`1px solid ${paid ? 'rgba(22,101,52,0.25)' : 'var(--border-mid)'}`,
                borderRadius:'var(--radius)', padding:'12px 14px',
                background: paid ? 'var(--green-light)' : 'white',
                transition:'all .15s',
              }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontSize:14, fontWeight:600 }}>Week {w}</span>
                  {paid
                    ? <i className="ti ti-circle-check-filled" style={{ color:'var(--green)', fontSize:18 }} />
                    : <i className="ti ti-lock" style={{ color:'var(--ink-faint)', fontSize:16 }} />
                  }
                </div>
                {paid ? (
                  <div>
                    <div style={{ fontSize:11, color:'var(--green)', fontWeight:600 }}>PAID · KES 40</div>
                    {p?.paid_at && <div style={{ fontSize:11, color:'var(--ink-faint)', marginTop:2 }}>{new Date(p.paid_at).toLocaleDateString('en-KE',{day:'numeric',month:'short'})}</div>}
                  </div>
                ) : (
                  <button className="btn btn-sm" style={{ width:'100%', justifyContent:'center', marginTop:2 }} onClick={() => handlePay(w)} disabled={paying===w}>
                    {paying===w ? 'Opening…' : 'Pay KES 40'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Transaction history */}
      {payments.length > 0 && (
        <div className="card" style={{ marginTop:'1rem' }}>
          <h3 style={{ fontSize:15, fontWeight:500, marginBottom:'1rem' }}>Transaction History</h3>
          <div className="table-scroll">
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border)' }}>
                  {['Week','Amount','Reference','Date','Status'].map(h => (
                    <th key={h} style={{ textAlign:'left', padding:'6px 10px', fontSize:12, fontWeight:600, color:'var(--ink-faint)', textTransform:'uppercase', letterSpacing:'.05em', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id} style={{ borderBottom:'1px solid var(--border)' }}>
                    <td style={{ padding:'10px', whiteSpace:'nowrap' }}>Week {p.week}</td>
                    <td style={{ padding:'10px', whiteSpace:'nowrap' }}>KES {p.amount}</td>
                    <td style={{ padding:'10px', fontSize:12, color:'var(--ink-faint)', fontFamily:'monospace', whiteSpace:'nowrap' }}>{p.reference?.slice(0,16)}…</td>
                    <td style={{ padding:'10px', fontSize:13, whiteSpace:'nowrap' }}>{p.paid_at ? new Date(p.paid_at).toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'}) : '—'}</td>
                    <td style={{ padding:'10px' }}><span className={`badge ${p.status==='success'?'badge-green':'badge-red'}`}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
