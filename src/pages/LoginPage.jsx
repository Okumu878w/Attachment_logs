import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginPage({ showToast }) {
  const [tab, setTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  // Login fields
  const [email, setEmail] = useState('')
  const [pass, setPass]   = useState('')

  // Signup fields
  const [sName, setSName]       = useState('')
  const [sEmail, setSEmail]     = useState('')
  const [sPass, setSPass]       = useState('')
  const [sProg, setSProg]       = useState('')
  const [sReg, setSReg]         = useState('')
  const [sUni, setSUni]         = useState('')

  async function doLogin(e) {
    e.preventDefault(); setErr(''); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
    setLoading(false)
    if (error) setErr(error.message)
  }

  async function doSignup(e) {
    e.preventDefault(); setErr(''); setLoading(true)
    if (!sName || !sEmail || !sPass) { setErr('Name, email and password are required.'); setLoading(false); return }
    if (sPass.length < 6) { setErr('Password must be at least 6 characters.'); setLoading(false); return }
    const { data, error } = await supabase.auth.signUp({
      email: sEmail, password: sPass,
      options: { data: { full_name: sName } }
    })
    if (error) { setErr(error.message); setLoading(false); return }
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id, email: sEmail,
        full_name: sName, programme: sProg,
        reg_number: sReg, university: sUni,
      })
    }
    showToast('Account created! Welcome to AttachLog.')
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    border: '1px solid var(--border-mid)', borderRadius: 'var(--radius)',
    fontSize: 14, fontFamily: 'Outfit, sans-serif',
    background: 'white', color: 'var(--ink)', outline: 'none',
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--cream)', padding: '1rem', position: 'relative', overflow: 'hidden',
    }}>
      {/* decorative blobs */}
      <div style={{ position:'absolute', width:600, height:600, background:'radial-gradient(circle,rgba(180,83,9,0.07) 0%,transparent 70%)', top:-100, right:-100, borderRadius:'50%', pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:400, height:400, background:'radial-gradient(circle,rgba(15,118,110,0.06) 0%,transparent 70%)', bottom:-80, left:-80, borderRadius:'50%', pointerEvents:'none' }} />

      <div className="login-card" style={{ background:'white', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:'2.5rem', width:'100%', maxWidth:420, boxShadow:'var(--shadow-lg)', position:'relative', zIndex:1, animation:'fadeUp .4s ease both' }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'2rem' }}>
          <div style={{ width:40, height:40, background:'var(--ink)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', color:'white' }}>
            <i className="ti ti-notebook" style={{ fontSize:18 }} />
          </div>
          <span style={{ fontFamily:'Playfair Display,serif', fontSize:22 }}>AttachLog</span>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', background:'var(--cream-dark)', borderRadius:10, padding:3, marginBottom:'1.5rem' }}>
          {['login','signup'].map((t,i) => (
            <button key={t} onClick={() => { setTab(t); setErr('') }} style={{
              flex:1, padding:'8px', border:'none', borderRadius:8,
              fontSize:14, fontWeight:500, fontFamily:'Outfit,sans-serif', cursor:'pointer',
              background: tab===t ? 'white' : 'transparent',
              color: tab===t ? 'var(--ink)' : 'var(--ink-light)',
              boxShadow: tab===t ? 'var(--shadow-sm)' : 'none',
              transition:'all .2s',
            }}>{i===0 ? 'Sign in' : 'Create account'}</button>
          ))}
        </div>

        {err && <div style={{ background:'var(--red-light)', color:'var(--red)', borderRadius:'var(--radius)', padding:'10px 14px', fontSize:13, marginBottom:'1rem' }}>{err}</div>}

        {tab === 'login' ? (
          <form onSubmit={doLogin}>
            <div className="field"><label>Email</label><input style={inputStyle} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required /></div>
            <div className="field"><label>Password</label><input style={inputStyle} type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" autoComplete="current-password" required /></div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
          </form>
        ) : (
          <form onSubmit={doSignup} style={{ maxHeight:'60vh', overflowY:'auto', paddingRight:4 }}>
            <div className="field"><label>Full Name</label><input style={inputStyle} type="text" value={sName} onChange={e=>setSName(e.target.value)} placeholder="e.g. John Kamau" required /></div>
            <div className="field"><label>Email</label><input style={inputStyle} type="email" value={sEmail} onChange={e=>setSEmail(e.target.value)} placeholder="you@example.com" required /></div>
            <div className="field"><label>Password</label><input style={inputStyle} type="password" value={sPass} onChange={e=>setSPass(e.target.value)} placeholder="Min. 6 characters" required /></div>
            <div className="field"><label>Programme</label><input style={inputStyle} type="text" value={sProg} onChange={e=>setSProg(e.target.value)} placeholder="e.g. BSc. Computer Science" /></div>
            <div className="row2">
              <div className="field"><label>Reg No.</label><input style={inputStyle} type="text" value={sReg} onChange={e=>setSReg(e.target.value)} placeholder="CS/001/2022" /></div>
              <div className="field"><label>University</label><input style={inputStyle} type="text" value={sUni} onChange={e=>setSUni(e.target.value)} placeholder="e.g. UoN" /></div>
            </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</button>
          </form>
        )}
      </div>
    </div>
  )
}
