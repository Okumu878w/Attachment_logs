import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function WeeklySummary({ showToast }) {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [notes, setNotes] = useState({})
  const [open, setOpen] = useState({})
  const [saving, setSaving] = useState({})

  useEffect(() => { load() }, [user])

  async function load() {
    const [{ data: e }, { data: n }] = await Promise.all([
      supabase.from('log_entries').select('*').eq('user_id', user.id).order('date'),
      supabase.from('supervisor_notes').select('*').eq('user_id', user.id),
    ])
    setEntries(e || [])
    const noteMap = {}
    ;(n || []).forEach(r => { noteMap[r.week] = r.note })
    setNotes(noteMap)
  }

  const weeks = [...new Set(entries.map(e => e.week))].sort((a,b)=>a-b)

  async function saveNote(week) {
    setSaving(s => ({ ...s, [week]: true }))
    await supabase.from('supervisor_notes').upsert(
      { user_id: user.id, week, note: notes[week] || '', updated_at: new Date().toISOString() },
      { onConflict: 'user_id,week' }
    )
    setSaving(s => ({ ...s, [week]: false }))
    showToast('Note saved for Week ' + week)
  }

  return (
    <div>
      <div style={{ marginBottom:'1.75rem' }}>
        <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:28, fontWeight:400 }}>Weekly Summary</h1>
        <div style={{ fontSize:14, color:'var(--ink-light)', marginTop:3 }}>Review entries and add supervisor notes per week</div>
      </div>

      {weeks.length === 0 ? (
        <div className="empty"><i className="ti ti-calendar-week" /><p>No entries yet.</p></div>
      ) : weeks.map(w => {
        const wEntries = entries.filter(e => e.week === w)
        const isOpen = !!open[w]
        return (
          <div key={w} className="card" style={{ marginBottom:12, padding:0, overflow:'hidden' }}>
            <div
              onClick={() => setOpen(o => ({ ...o, [w]: !o[w] }))}
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem 1.25rem', background:'var(--cream-mid)', cursor:'pointer' }}
            >
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontFamily:'Playfair Display,serif', fontSize:18 }}>Week {w}</span>
                <span style={{ fontSize:12, color:'var(--ink-faint)' }}>{wEntries.length} day{wEntries.length!==1?'s':''}</span>
                {notes[w] && <span className="badge badge-green"><i className="ti ti-user-check" /> Supervisor note added</span>}
              </div>
              <i className="ti ti-chevron-down" style={{ transition:'transform .2s', transform: isOpen ? 'rotate(180deg)' : 'none', color:'var(--ink-faint)' }} />
            </div>

            {isOpen && (
              <div style={{ padding:'1rem 1.25rem' }}>
                {wEntries.map(e => {
                  const d = new Date(e.date+'T12:00:00')
                  return (
                    <div key={e.id} style={{ padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                      <div style={{ fontWeight:500, fontSize:14, marginBottom:3 }}>
                        {d.toLocaleDateString('en-KE',{weekday:'long', day:'numeric', month:'short'})}
                      </div>
                      <div style={{ fontSize:13, color:'var(--ink-light)', lineHeight:1.6 }}>{e.activities.split('\n').map((l,i)=><span key={i}>{l}<br/></span>)}</div>
                    </div>
                  )
                })}

                {/* Supervisor notes */}
                <div style={{ marginTop:'1rem', background:'var(--gold-light)', border:'1px solid rgba(180,83,9,0.2)', borderRadius:'var(--radius)', padding:'1rem' }}>
                  <div className="field" style={{ marginBottom:0 }}>
                    <label style={{ color:'var(--gold)', display:'flex', alignItems:'center', gap:6 }}>
                      <i className="ti ti-user-check" /> Supervisor Notes — Week {w}
                    </label>
                    <textarea
                      value={notes[w] || ''}
                      onChange={e => setNotes(n => ({ ...n, [w]: e.target.value }))}
                      placeholder="Add supervisor comments or sign-off notes for this week…"
                      style={{ background:'white', borderColor:'rgba(180,83,9,0.2)', minHeight:80 }}
                    />
                  </div>
                  <div style={{ display:'flex', justifyContent:'flex-end', marginTop:10 }}>
                    <button className="btn btn-sm" style={{ borderColor:'var(--gold)', color:'var(--gold)' }} onClick={() => saveNote(w)} disabled={saving[w]}>
                      <i className="ti ti-check" /> {saving[w] ? 'Saving…' : 'Save note'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
