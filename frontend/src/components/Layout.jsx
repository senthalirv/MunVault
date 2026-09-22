import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, Globe, FileText, Cpu, MessageSquare, Network, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { signOut, user } = useAuth()

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Conferences', path: '/conferences', icon: Globe },
    { name: 'Documents', path: '/documents', icon: FileText },
    { name: 'AI Analyst', path: '/analyst', icon: Cpu },
    { name: 'MUN Coach', path: '/coach', icon: MessageSquare },
    { name: 'Connections', path: '/connections', icon: Network },
  ]

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/80 backdrop-blur-md border-r border-slate-800 flex flex-col justify-between p-4 flex-shrink-0">
        <div>
          <div className="flex items-center space-x-3 px-2 py-3 border-b border-slate-800 mb-6">
            <div className="bg-emerald-500 text-slate-950 font-bold px-2.5 py-1 rounded-lg text-sm shadow-lg shadow-emerald-500/20">
              MV
            </div>
            <span className="text-lg font-bold tracking-tight text-white">MUNVault</span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800/80">
          <div className="px-3 py-2 mb-2 bg-slate-950/40 rounded-xl border border-slate-800/50">
            <p className="text-[10px] uppercase font-semibold text-slate-500">Account</p>
            <p className="text-xs font-medium text-slate-300 truncate">{user?.email}</p>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center space-x-3 px-3.5 py-2 text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-8 space-y-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}