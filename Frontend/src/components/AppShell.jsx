import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/invoices', label: 'Invoices', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { to: '/invoices/new', label: 'New Invoice', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
  { to: '/business-profile', label: 'Business Profile', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
]

export default function AppShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user } = useUser()
  const { signOut } = useClerk()
  const navigate = useNavigate()

  const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
      isActive
        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm border border-blue-100'
        : 'text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-md'
    }`

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      <div className="lg:flex">
        {sidebarOpen && (
          <aside className="hidden lg:block w-72 bg-white/80 backdrop-blur-xl border-r border-gray-200/60 transition-all duration-500">
            <div className="px-6 py-8 h-full flex flex-col justify-between">
              <div>
                <div className="mb-12 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">AI</div>
                  <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">InvoiceAI</span>
                </div>
                <nav className="space-y-2">
                  {navItems.map(item => (
                    <NavLink key={item.to} to={item.to} end={item.to === '/invoices'} className={linkClass}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} /></svg>
                      <span className="flex-1">{item.label}</span>
                    </NavLink>
                  ))}
                </nav>
              </div>
              <div className="border-t border-gray-200/60 pt-6">
                <div className="flex items-center gap-3 mb-4 px-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                  </div>
                </div>
                <button onClick={() => { signOut(); navigate('/') }} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-300 group">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </aside>
        )}

        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 px-4 sm:px-6 lg:px-8 min-h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl border border-gray-200 bg-white/50 hover:bg-white transition-all duration-300">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:flex p-2 rounded-xl border border-gray-200 bg-white/50 hover:bg-white transition-all duration-300">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={sidebarOpen ? 'M11 19l-7-7 7-7m8 14l-7-7 7-7' : 'M13 5l7 7-7 7M5 5l7 7-7 7'} /></svg>
              </button>
              <div className="hidden sm:block">
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">Welcome back, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{user?.firstName || 'User'}</span></h2>
                <p className="text-xs text-gray-500">Manage your invoices and business profile</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/invoices/new')} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                <span className="hidden sm:inline">New Invoice</span>
              </button>
            </div>
          </header>

          {mobileOpen && (
            <div className="lg:hidden fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
              <aside className="absolute inset-y-0 left-0 w-80 bg-white/95 backdrop-blur-xl border-r border-gray-200/60 p-6 overflow-auto">
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">AI</div>
                    <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">InvoiceAI</span>
                  </div>
                  <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg border border-gray-200 hover:bg-white transition-all duration-300">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <nav className="space-y-2">
                  {navItems.map(item => (
                    <NavLink key={item.to} to={item.to} end={item.to === '/invoices'} onClick={() => setMobileOpen(false)} className={linkClass}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} /></svg>
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </nav>
                <div className="mt-8 border-t border-gray-200/60 pt-6">
                  <button onClick={() => { signOut(); navigate('/') }} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    <span>Sign Out</span>
                  </button>
                </div>
              </aside>
            </div>
          )}

          <main className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
