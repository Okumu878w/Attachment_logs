import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function Entries({ showToast }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [weekFilter, setWeekFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  useEffect(() => { load() }, [user])

  async function load() {
    const { data } = await supabase.from('log_entries').select('*').eq('user_id', user.id).order('date', { ascending: false })
    setEntries(data || [])
    setLoading(false)
  }

  async function deleteEntry(id) {
    if (!confirm('Delete this entry?')) return
    await supabase.from('log_entries').delete().eq('id', id)
    setSelected(null)
    showToast('Entry deleted')
    load()
  }

  const weeks = [...new Set(entries.map(e => e.week))].sort((a,b)=>a-b)
  const filtered = entries
    .filter(e => weekFilter === 'all' || e.week === parseInt(weekFilter))
    .filter(e => !search || e.activities.toLowerCase().includes(search.toLowerCase()) || e.skills.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div style={{ display:'flex', justifyContent:'center', paddingTop:'4rem' }}><div className="spinner" /></div>

  return (
    <div>
      <div style={{ marginBottom:'1.75rem' }}>
        <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:28, fontWeight:400 }}>All Entries</h1>
        <div style={{ fontSize:14, color:'var(--ink-light)', marginTop:3 }}>{filtered.length} entr{filtered.length!==1?'ies':'y'}</div>
      </div>

      <div style={{ position:'relative', marginBottom:'1rem' }}>
        <i className="ti ti-search" style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--ink-faint)', fontSize:17, pointerEvents:'none' }} />
        <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search entries…"
          style={{ width:'100%', padding:'10px 14px 10px 40px', border:'1px solid var(--border-mid)', borderRadius:30, fontSize:14, fontFamily:'Outfit,sans-serif', outline:'none', background:'white', color:'var(--ink)' }} />
      </div>

      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:'1rem' }}>
        {['all', ...weeks].map(w => (
          <button key={w} onClick={() => setWeekFilter(String(w))} style={{
            padding:'5px 14px', borderRadius:20, border:'1px solid var(--border-mid)', fontSize:13, fontWeight:500,
            cursor:'pointer', fontFamily:'Outfit,sans-serif',
            background: weekFilter===String(w) ? 'var(--ink)' : 'white',
            color: weekFilter===String(w) ? 'white' : 'var(--ink-mid)', transition:'all .15s',
          }}>
            {w === 'all' ? 'All weeks' : 'Week ' + w}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty"><i className="ti ti-notebook" /><p>{search ? 'No matching entries.' : 'No entries yet.'}</p></div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {filtered.map(e => {
            const d = new Date(e.date+'T12:00:00')
            return (
              <div key={e.id} onClick={() => setSelected(e)} style={{
                background:'white', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)',
                padding:'1.25rem 1.5rem', cursor:'pointer', transition:'all .15s',
              }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
                  <div>
                    <div style={{ fontFamily:'Playfair Display,serif', fontSize:20 }}>{d.toLocaleDateString('en-KE',{weekday:'long'})}</div>
                    <div style={{ fontSize:13, color:'var(--ink-light)', marginTop:2 }}>{d.toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'})}</div>
                  </div>
                  <span className="badge badge-gold">Week {e.week}</span>
                </div>
                <div style={{ fontSize:11, fontWeight:600, color:'var(--ink-faint)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:3 }}>Activities</div>
                <div style={{ fontSize:13, color:'var(--ink-light)', lineHeight:1.6, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{e.activities}</div>
              </div>
            )
          })}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div onClick={e=>{ if(e.target===e.currentTarget) setSelected(null) }} style={{
          position:'fixed', inset:0, background:'rgba(28,25,23,0.5)',
          display:'flex', alignItems:'flex-end', justifyContent:'center',
          padding:'0', zIndex:200, backdropFilter:'blur(2px)',
        }}>
          <div className="modal-box" style={{ background:'white', borderRadius:'var(--radius-xl) var(--radius-xl) 0 0', padding:'1.75rem', width:'100%', maxWidth:580, maxHeight:'88vh', overflowY:'auto', boxShadow:'var(--shadow-lg)', animation:'fadeUp .25s ease' }}>
            <div style={{ width:40, height:4, background:'var(--border-mid)', borderRadius:2, margin:'0 auto 1.25rem', cursor:'pointer' }} onClick={()=>setSelected(null)} />
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'1.5rem' }}>
              <div>
                <div style={{ fontFamily:'Playfair Display,serif', fontSize:26 }}>{new Date(selected.date+'T12:00:00').toLocaleDateString('en-KE',{weekday:'long'})}</div>
                <div style={{ fontSize:14, color:'var(--ink-light)', marginTop:4 }}>
                  {new Date(selected.date+'T12:00:00').toLocaleDateString('en-KE',{day:'numeric',month:'long',year:'numeric'})} · Week {selected.week}
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={()=>setSelected(null)}><i className="ti ti-x" /></button>
            </div>
            {[['Activities / Tasks Performed', selected.activities], ['Skills Gained / Observations', selected.skills], selected.challenges && ['Challenges Faced', selected.challenges]].filter(Boolean).map(([label, text]) => (
              <div key={label} style={{ marginBottom:'1.25rem' }}>
                <div style={{ fontSize:11, fontWeight:600, color:'var(--ink-faint)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:6 }}>{label}</div>
                <div style={{ fontSize:15, color:'var(--ink)', lineHeight:1.75 }}>{text.split('\n').map((l,i)=><span key={i}>{l}<br/></span>)}</div>
              </div>
            ))}
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end', borderTop:'1px solid var(--border)', paddingTop:'1.25rem' }}>
              <button className="btn btn-danger btn-sm" onClick={()=>deleteEntry(selected.id)}><i className="ti ti-trash" /> Delete</button>
              <button className="btn btn-sm" onClick={()=>{ setSelected(null); navigate('/new-entry?edit='+selected.id) }}><i className="ti ti-edit" /> Edit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
