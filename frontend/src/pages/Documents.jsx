import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { Plus, FileText, Folder, Calendar, Trash2, Upload, Paperclip, ExternalLink } from 'lucide-react'

export default function Documents() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState([])
  const [conferences, setConferences] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'Speech',
    conference_id: '',
    file: null
  })

  useEffect(() => {
    fetchConferences()
    fetchDocuments()
  }, [])

  async function fetchConferences() {
    const { data, error } = await supabase.from('conferences').select('id, name')
    if (error) console.error('Error fetching conferences:', error)
    if (data) setConferences(data)
  }

  async function fetchDocuments() {
    const { data, error } = await supabase
      .from('documents')
      .select('*, conferences(name)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching documents:', error)
    } else if (data) {
      setDocuments(data)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    try {
      if (!formData.conference_id) {
        throw new Error('Please select a conference.')
      }

      let fileUrl = null

      // Upload file to Supabase Storage if attached
      if (formData.file) {
        const fileExt = formData.file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, formData.file)

        if (uploadError) {
          throw new Error('Failed to upload file: ' + uploadError.message)
        }

        const { data: publicUrlData } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName)

        fileUrl = publicUrlData.publicUrl
      }

      const payload = {
        title: formData.title,
        category: formData.category,
        conference_id: formData.conference_id,
        file_url: fileUrl,
        user_id: user.id
      }

      const { error: insertError } = await supabase.from('documents').insert([payload])

      if (insertError) {
        throw new Error(insertError.message)
      }

      // Reset and refresh
      setShowModal(false)
      fetchDocuments()
      setFormData({ title: '', category: 'Speech', conference_id: '', file: null })
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (window.confirm('Are you sure you want to delete this document?')) {
      const { error } = await supabase.from('documents').delete().eq('id', id)
      if (error) {
        alert('Failed to delete: ' + error.message)
      } else {
        fetchDocuments()
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Document Management</h1>
          <p className="text-slate-400 text-sm mt-1">
            Upload and organize your MUN conference document files.
          </p>
        </div>
        <button
          onClick={() => {
            setErrorMessage('')
            setShowModal(true)
          }}
          className="inline-flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-500/10 text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Document</span>
        </button>
      </div>

      {/* Document List */}
      {documents.length === 0 ? (
        <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mb-4 text-emerald-400">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">No documents yet</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-sm">
            Upload your first document to start managing conference files.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 hover:border-slate-700/80 transition shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-base text-white leading-snug truncate">{doc.title}</h3>
                  <span className="text-[11px] font-medium bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex-shrink-0">
                    {doc.category}
                  </span>
                </div>
                {doc.conferences?.name && (
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Folder className="w-3.5 h-3.5 text-slate-500" />
                    <span>{doc.conferences.name}</span>
                  </p>
                )}

                {doc.file_url ? (
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-2 rounded-xl border border-emerald-500/20 transition w-full justify-center"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>View / Download File</span>
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </a>
                ) : (
                  <p className="text-xs text-slate-500 italic">No file attached.</p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {new Date(doc.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-slate-500 hover:text-red-400 transition"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Document Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-lg font-bold mb-4 text-white">Add New Document</h2>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Document Title *</label>
                <input
                  required
                  placeholder="e.g. Position Paper - UNHRC"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Speech">Speech</option>
                    <option value="Position Paper">Position Paper</option>
                    <option value="Resolution Draft">Resolution Draft</option>
                    <option value="Research Note">Research Note</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Conference *</label>
                  <select
                    required
                    value={formData.conference_id}
                    onChange={(e) => setFormData({ ...formData, conference_id: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Select Conference --</option>
                    {conferences.map((conf) => (
                      <option key={conf.id} value={conf.id}>
                        {conf.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Upload File (PDF / Word / TXT)</label>
                <div className="relative border border-dashed border-slate-700 rounded-xl p-4 bg-slate-800/40 hover:bg-slate-800/60 transition text-center cursor-pointer">
                  <input
                    type="file"
                    onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-1 text-slate-400">
                    <Upload className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-medium">
                      {formData.file ? formData.file.name : 'Click or drop file to upload'}
                    </span>
                  </div>
                </div>
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
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold text-xs transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}