import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { Plus, Globe, Calendar, UserCheck, FolderPlus } from 'lucide-react'

export default function Conferences() {
  const { user } = useAuth()
  const [conferences, setConferences] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    committee: '',
    portfolio: '',
    agenda: '',
    start_date: '',
    venue: ''
  })

  useEffect(() => {
    fetchConferences()
  }, [])

  async function fetchConferences() {
    const { data, error } = await supabase
      .from('conferences')
      .select('*')
      .order('created_at', { ascending: false })
      
    if (!error && data) {
      setConferences(data)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('conferences')
      .insert([{ ...formData, user_id: user.id }])

    setLoading(false)

    if (!error) {
      setShowModal(false)
      fetchConferences()
      setFormData({ name: '', committee: '', portfolio: '', agenda: '', start_date: '', venue: '' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Conferences Workspace</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your past, present, and upcoming MUN conferences.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-500/10 text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Conference</span>
        </button>
      </div>

      {/* Empty State vs Cards */}
      {conferences.length === 0 ? (
        <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mb-4 text-emerald-400">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">No conferences added yet</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-sm">
            Create your first workspace to start organizing research, speeches, and practice sessions.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-5 inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3.5 py-2 rounded-lg border border-slate-700 transition"
          >
            <FolderPlus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Create First Conference</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {conferences.map((conf) => (
            <div
              key={conf.id}
              className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 hover:border-slate-700/80 transition shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-base text-emerald-400 leading-snug">{conf.name}</h3>
                  <span className="text-[11px] font-medium bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700/60 flex-shrink-0">
                    {conf.committee}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <p className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Portfolio: <strong className="text-slate-100">{conf.portfolio}</strong></span>
                  </p>
                  {conf.agenda && (
                    <p className="flex items-center gap-2 text-slate-400">
                      <Globe className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="truncate">{conf.agenda}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {conf.start_date || 'Undated'}
                </span>
                <span className="text-emerald-400 hover:underline cursor-pointer font-medium">Open Workspace →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold mb-4 text-white">Add New Conference</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Conference Name</label>
                <input
                  required
                  placeholder="e.g. Imperium MUN 2026"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Committee</label>
                  <input
                    required
                    placeholder="e.g. UNHRC"
                    value={formData.committee}
                    onChange={(e) => setFormData({ ...formData, committee: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Portfolio / Country</label>
                  <input
                    required
                    placeholder="e.g. United Kingdom"
                    value={formData.portfolio}
                    onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Agenda Topic</label>
                <textarea
                  placeholder="e.g. Addressing Human Rights Violations in Conflict Zones"
                  value={formData.agenda}
                  onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold text-xs transition"
                >
                  {loading ? 'Saving...' : 'Save Conference'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}