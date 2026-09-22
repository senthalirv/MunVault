import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Conferences from './pages/Conferences'
import Documents from './pages/Documents'
import AIAnalyst from './pages/AIAnalyst'
import MUNCoach from './pages/MUNCoach'
import Connections from './pages/Connections'

export default function App() {
  const { user } = useAuth()

  if (!user) {
    return <Login />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="conferences" element={<Conferences />} />
          <Route path="documents" element={<Documents />} />
          <Route path="analyst" element={<AIAnalyst />} />
          <Route path="coach" element={<MUNCoach />} />
          <Route path="connections" element={<Connections />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}