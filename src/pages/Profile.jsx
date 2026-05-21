import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function Profile({ showToast }) {
  const { user, profile, refreshProfile } = useAuth()
  const [form, setForm] = useState({ full_name:'', programme:'', reg_number:'', university:'', organisation:'', start_date:'', end_date:'' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile) setForm({
      full_name:    profile.full_name    || '',
      programme:    profile.programme   || '',
      reg_number:   profile.reg_number  || '',
      university:   profile.university  || '',
      organisation: profile.organisation|| '',
      start_date:   profile.start_date  || '',
      end_date:     profile.end_date    || '',
    })
  }, [profile])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('profiles').upsert({ id: user.id, email: user.email, ...form })
    setSaving(false)
    if (error) { showToast('Error: ' + error.message, 'error'); return }
    await refreshProfile()
    showToast('Profile saved!')
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ marginBottom:'1.75rem' }}>
        <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:28, fontWeight:400 }}>My Profile</h1>
        <div style={{ fontSize:14, color:'var(--ink-light)', marginTop:3 }}>Your personal and attachment details</div>
      </div>
      <form className="card" onSubmit={save}>
        <div className="field"><label>Full Name</label><input type="text" value={form.full_name} onChange={set('full_name')} placeholder="e.g. John Kamau" /></div>
        <div className="field"><label>Email</label><input type="email" value={user?.email || ''} disabled style={{ opacity:.6, cursor:'not-allowed' }} /></div>
        <div className="field"><label>Programme / Course</label><input type="text" value={form.programme} onChange={set('programme')} placeholder="e.g. BSc. Computer Science" /></div>
        <div className="row2">
          <div className="field"><label>Registration No.</label><input type="text" value={form.reg_number} onChange={set('reg_number')} placeholder="CS/001/2022" /></div>
          <div className="field"><label>University</label><input type="text" value={form.university} onChange={set('university')} placeholder="e.g. UoN" /></div>
        </div>
        <div className="field"><label>Organisation / Attachment Company</label><input type="text" value={form.organisation} onChange={set('organisation')} placeholder="e.g. Kenya Power" /></div>
        <div className="row2">
          <div className="field"><label>Attachment Start Date</label><input type="date" value={form.start_date} onChange={set('start_date')} /></div>
          <div className="field"><label>Attachment End Date</label><input type="date" value={form.end_date} onChange={set('end_date')} /></div>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'0.5rem' }}>
          <button className="btn btn-primary" type="submit" disabled={saving}><i className="ti ti-check" /> {saving ? 'Saving…' : 'Save Profile'}</button>
        </div>
      </form>
    </div>
  )
}
