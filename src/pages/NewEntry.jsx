import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { checkPayment, payForWeek } from '../lib/paystack'
import { useNavigate, useSearchParams } from 'react-router-dom'

function today() { return new Date().toISOString().split('T')[0] }

export default function NewEntry({ showToast }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [date, setDate]             = useState(today())
  const [week, setWeek]             = useState('')
  const [activities, setActivities] = useState('')
  const [skills, setSkills]         = useState('')
  const [challenges, setChallenges] = useState('')
  const [saving, setSaving]         = useState(false)
  const [paymentOk, setPaymentOk]   = useState(null)
  const [paying, setPaying]         = useState(false)

  useEffect(() => {
    const editId = params.get('edit')
    if (editId) loadForEdit(editId)
  }, [params])

  async function loadForEdit(id) {
    const { data } = await supabase.from('log_entries').select('*').eq('id', id).single()
    if (data) {
      setDate(data.date); setWeek(String(data.week))
      setActivities(data.activities); setSkills(data.skills)
      setChallenges(data.challenges || '')
    }
  }

  useEffect(() => {
    if (!week || !user) { setPaymentOk(null); return }
    setPaymentOk(null)
    checkPayment(user.id, parseInt(week)).then(ok => setPaymentOk(ok))
  }, [week, user])

  async function handlePay() {
    setPaying(true)
    try {
      await payForWeek({
        userId: user.id,
        email: user.email,
        week: parseInt(week),
        onSuccess: () => {
  setPaymentOk(null)  // ← reset to trigger re-check
  checkPayment(user.id, parseInt(week)).then(ok => {  // ← re-check immediately
    setPaymentOk(ok)
    showToast('Payment successful! You can now save entries for Week ' + week)
  })
},
        onClose: () => setPaying(false),
      })
    } catch (err) {
      showToast('Payment error: ' + err.message, 'error')
    } finally {
      setPaying(false)
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!date || !week || !activities.trim() || !skills.trim()) {
      showToast('Please fill in all required fields', 'warning'); return
    }
    if (!paymentOk) {
      showToast('Please pay for Week ' + week + ' before saving entries', 'warning'); return
    }
    setSaving(true)
    const payload = {
      user_id: user.id, date, week: parseInt(week),
      activities: activities.trim(), skills: skills.trim(),
      challenges: challenges.trim() || null,
    }
    const editId = params.get('edit')
    let error
    if (editId) {
      ;({ error } = await supabase.from('log_entries').update(payload).eq('id', editId))
    } else {
      const { data: existing } = await supabase.from('log_entries').select('id').eq('user_id', user.id).eq('date', date).single()
      if (existing) {
        ;({ error } = await supabase.from('log_entries').update(payload).eq('id', existing.id))
      } else {
        ;({ error } = await supabase.from('log_entries').insert(payload))
      }
    }
    setSaving(false)
    if (error) { showToast('Error: ' + error.message, 'error'); return }
    showToast(editId ? 'Entry updated!' : 'Entry saved!')
    setDate(today()); setWeek(''); setActivities(''); setSkills(''); setChallenges('')
    navigate('/entries')
  }

  const weekPaid     = paymentOk === true
  const weekUnpaid   = paymentOk === false
  const weekChecking = paymentOk === null && week

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:28, fontWeight:400 }}>
          {params.get('edit') ? 'Edit Entry' : 'New Entry'}
        </h1>
        <div style={{ fontSize:14, color:'var(--ink-light)', marginTop:3 }}>Log your daily attachment activities</div>
      </div>

      <form className="card" onSubmit={handleSave}>

        <div className="row2" style={{ marginBottom:'1rem' }}>
          <div className="field" style={{ marginBottom:0 }}>
            <label>Date *</label>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} required />
          </div>
          <div className="field" style={{ marginBottom:0 }}>
            <label>Week Number *</label>
            <select value={week} onChange={e=>setWeek(e.target.value)} required>
              <option value="">Select week…</option>
              {Array.from({length:12},(_,i)=>i+1).map(w=>(
                <option key={w} value={w}>Week {w}</option>
              ))}
            </select>
          </div>
        </div>

        {weekChecking && (
          <div style={{ background:'var(--cream-dark)', borderRadius:'var(--radius)', padding:'10px 14px', fontSize:13, color:'var(--ink-light)', marginBottom:'1rem', display:'flex', alignItems:'center', gap:8 }}>
            <div className="spinner" style={{ width:16, height:16, borderWidth:2 }} /> Checking payment status…
          </div>
        )}
        {weekPaid && (
          <div style={{ background:'var(--green-light)', border:'1px solid rgba(22,101,52,0.2)', borderRadius:'var(--radius)', padding:'10px 14px', fontSize:13, color:'var(--green)', marginBottom:'1rem', display:'flex', alignItems:'center', gap:8 }}>
            <i className="ti ti-circle-check-filled" /> Week {week} payment confirmed — you can save entries.
          </div>
        )}
        {weekUnpaid && (
          <div style={{ background:'var(--gold-light)', border:'1px solid rgba(180,83,9,0.2)', borderRadius:'var(--radius)', padding:'12px 14px', fontSize:13, color:'var(--gold)', marginBottom:'1rem' }}>
            <div style={{ fontWeight:600, marginBottom:6, display:'flex', alignItems:'center', gap:6 }}>
              <i className="ti ti-lock" /> Week {week} not paid
            </div>
            <div style={{ marginBottom:10 }}>You need to pay <strong>KES 40</strong> to save entries for Week {week}.</div>
            <button type="button" className="btn btn-green btn-sm" onClick={handlePay} disabled={paying}>
              <i className="ti ti-credit-card" /> {paying ? 'Opening payment…' : 'Pay KES 40 via Paystack'}
            </button>
          </div>
        )}

        <div className="field">
          <label>Activities / Tasks Performed *</label>
          <textarea
            value={activities}
            onChange={e=>setActivities(e.target.value)}
            placeholder="AM: Type a short description of what you did…&#10;PM: e.g. installed scanner drivers and connected to desktop"
            style={{ minHeight:110 }}
            required
          />
        </div>

        <div className="field">
          <label>Skills Gained / Observations *</label>
          <textarea value={skills} onChange={e=>setSkills(e.target.value)} placeholder="What did you learn or observe today?" required />
        </div>

        <div className="field" style={{ marginBottom:0 }}>
          <label>Challenges Faced <span style={{ fontWeight:400, color:'var(--ink-faint)' }}>(optional)</span></label>
          <textarea value={challenges} onChange={e=>setChallenges(e.target.value)} placeholder="Any difficulties encountered?" style={{ minHeight:64 }} />
        </div>

        <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:'1.25rem' }}>
          <button type="button" className="btn btn-ghost" onClick={() => { setActivities(''); setSkills(''); setChallenges('') }}>
            <i className="ti ti-x" /> Clear
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving || !paymentOk}>
            <i className="ti ti-check" /> {saving ? 'Saving…' : 'Save Entry'}
          </button>
        </div>
      </form>
    </div>
  )
}