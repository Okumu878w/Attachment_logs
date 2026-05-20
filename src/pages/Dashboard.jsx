import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bar, Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler, Tooltip } from 'chart.js'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler, Tooltip)

export default function Dashboard({ showToast }) {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [user])

  async function loadData() {
    const [{ data: e }, { data: p }] = await Promise.all([
      supabase.from('log_entries').select('*').eq('user_id', user.id).order('date', { ascending: false }),
      supabase.from('payments').select('*').eq('user_id', user.id).eq('status', 'success'),
    ])
    setEntries(e || [])
    setPayments(p || [])
    setLoading(false)
  }

  const name = profile?.full_name || user?.email?.split('@')[0] || 'there'
  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const weeks = [...new Set(entries.map(e => e.week))].length
  const paidWeeks = payments.length

  const dates = [...new Set(entries.map(e => e.date))].sort().reverse()
  let streak = 0
  for (let i = 0; i < dates.length; i++) {
    if (i === 0) { streak = 1; continue }
    const diff = (new Date(dates[i-1]) - new Date(dates[i])) / 86400000
    if (diff <= 3) streak++; else break
  }

  const weekMap = {}
  entries.forEach(e => { weekMap[e.week] = (weekMap[e.week] || 0) + 1 })
  const wKeys = Object.keys(weekMap).sort((a,b)=>a-b)

  const monthMap = {}
  entries.forEach(e => { const m = e.date.slice(0,7); monthMap[m] = (monthMap[m]||0)+1 })
  const mKeys = Object.keys(monthMap).sort()

  const stats = [
    { icon: 'ti-notebook',      cls: 'gold',  num: entries.length, label: 'Total entries' },
    { icon: 'ti-calendar-week', cls: 'teal',  num: weeks,          label: 'Weeks logged' },
    { icon: 'ti-credit-card',   cls: 'green', num: paidWeeks,      label: 'Weeks paid' },
    { icon: 'ti-flame',         cls: 'red',   num: streak,         label: 'Day streak' },
  ]

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: 'rgba(0,0,0,0.04)' } }
    }
  }

  if (loading) return <div style={{ display:'flex', justifyContent:'center', paddingTop:'4rem' }}><div className="spinner" /></div>

  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'1.75rem' }}>
        <div>
          <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:28, fontWeight:400 }}>Dashboard</h1>
          <div style={{ fontSize:14, color:'var(--ink-light)', marginTop:3 }}>{greet}, {name.split(' ')[0]}</div>
        </div>
        <button className="btn" onClick={() => navigate('/new-entry')} style={{ flexShrink:0 }}>
          <i className="ti ti-plus" /> <span className="hide-xs">New Entry</span>
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:'1.5rem' }}>
        {stats.map(s => (
          <div key={s.label} className="card" style={{ padding:'1.25rem' }}>
            <div style={{ width:36, height:36, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, marginBottom:12,
              background: s.cls==='gold'?'var(--gold-light)':s.cls==='teal'?'var(--teal-light)':s.cls==='green'?'var(--green-light)':'var(--red-light)',
              color: s.cls==='gold'?'var(--gold)':s.cls==='teal'?'var(--teal)':s.cls==='green'?'var(--green)':'var(--red)',
            }}>
              <i className={`ti ${s.icon}`} />
            </div>
            <div style={{ fontFamily:'Playfair Display,serif', fontSize:30, lineHeight:1 }}>{s.num}</div>
            <div style={{ fontSize:13, color:'var(--ink-light)', marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="charts-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:'1.5rem' }}>
        <div className="card">
          <h3 style={{ fontSize:15, fontWeight:500, marginBottom:'1rem' }}>Entries per week</h3>
          <div style={{ height:200 }}>
            <Bar options={chartOpts} data={{
              labels: wKeys.map(w=>'Wk '+w),
              datasets: [{ data: wKeys.map(w=>weekMap[w]), backgroundColor:'#1C1917', borderRadius:6, borderSkipped:false }]
            }} />
          </div>
        </div>
        <div className="card">
          <h3 style={{ fontSize:15, fontWeight:500, marginBottom:'1rem' }}>Activity over time</h3>
          <div style={{ height:200 }}>
            <Line options={chartOpts} data={{
              labels: mKeys.map(m => new Date(m+'-01').toLocaleString('en',{month:'short'})),
              datasets: [{ data: mKeys.map(m=>monthMap[m]), borderColor:'#B45309', backgroundColor:'rgba(180,83,9,0.08)', tension:0.4, fill:true, pointBackgroundColor:'#B45309', pointRadius:4 }]
            }} />
          </div>
        </div>
      </div>

      {/* Recent entries */}
      <div className="card">
        <h3 style={{ fontSize:15, fontWeight:500, marginBottom:'1rem' }}>Recent entries</h3>
        {entries.length === 0 ? (
          <div className="empty" style={{ padding:'2rem' }}>
            <i className="ti ti-notebook" />
            <p>No entries yet. <button className="btn btn-ghost btn-sm" onClick={()=>navigate('/new-entry')} style={{ marginLeft:4 }}>Add your first log →</button></p>
          </div>
        ) : entries.slice(0,4).map(e => {
          const d = new Date(e.date+'T12:00:00')
          return (
            <div key={e.id} style={{ padding:'12px 0', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, cursor:'pointer' }} onClick={()=>navigate('/entries')}>
              <div style={{ minWidth:0 }}>
                <div style={{ fontFamily:'Playfair Display,serif', fontSize:16 }}>{d.toLocaleDateString('en-KE',{weekday:'long'})}</div>
                <div style={{ fontSize:13, color:'var(--ink-light)' }}>{d.toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'})}</div>
                <div style={{ fontSize:13, color:'var(--ink-light)', marginTop:4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{e.activities}</div>
              </div>
              <span className="badge badge-gold" style={{ flexShrink:0 }}>Wk {e.week}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
