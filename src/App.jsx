<<<<<<< HEAD
import React from 'react'
=======
import React, { useState } from 'react'
>>>>>>> 10ebc388965faedd4040a4c75a3fb2b43733df69
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import Toast from './components/Toast'
import { useToast } from './hooks/useToast'

import LoginPage     from './pages/LoginPage'
import Dashboard     from './pages/Dashboard'
import NewEntry      from './pages/NewEntry'
import Entries       from './pages/Entries'
import WeeklySummary from './pages/WeeklySummary'
import Payments      from './pages/Payments'
import Profile       from './pages/Profile'
<<<<<<< HEAD
import Schemes       from './pages/Schemes'
=======
>>>>>>> 10ebc388965faedd4040a4c75a3fb2b43733df69

function AppShell() {
  const { user, loading } = useAuth()
  const { toast, showToast } = useToast()

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:14 }}>
      <div className="spinner" />
      <div style={{ fontSize:14, color:'var(--ink-light)' }}>Loading…</div>
    </div>
  )

  if (!user) return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage showToast={showToast} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toast toast={toast} />
    </>
  )

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <Routes>
          <Route path="/dashboard" element={<Dashboard     showToast={showToast} />} />
          <Route path="/new-entry" element={<NewEntry      showToast={showToast} />} />
          <Route path="/entries"   element={<Entries       showToast={showToast} />} />
          <Route path="/weekly"    element={<WeeklySummary showToast={showToast} />} />
          <Route path="/payments"  element={<Payments      showToast={showToast} />} />
          <Route path="/profile"   element={<Profile       showToast={showToast} />} />
<<<<<<< HEAD
          <Route path="/schemes"   element={<Schemes       showToast={showToast} />} />
=======
>>>>>>> 10ebc388965faedd4040a4c75a3fb2b43733df69
          <Route path="*"          element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
      <BottomNav />
      <Toast toast={toast} />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}
