import { NavLink, useNavigate } from 'react-router-dom'
import {
  Sprout,
  LayoutDashboard,
  FileText,
  ShieldCheck,
  FilePlus,
  LogOut,
  X,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const farmerNav = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/farmer-dashboard' },
  { label: 'Policies', icon: FileText, to: '/policies' },
  { label: 'My Claims', icon: ShieldCheck, to: '/claims' },
  { label: 'Submit Claim', icon: FilePlus, to: '/submit-claim' },
]

const adminNav = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin-dashboard' },
  { label: 'Policies', icon: FileText, to: '/admin/policies' },
  { label: 'Claims', icon: ShieldCheck, to: '/admin/claims' },
]

function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const navItems = user?.role === 'Admin' ? adminNav : farmerNav

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-gray-200 transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">AgriInsure</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer with user info + logout */}
        <div className="px-3 py-4 border-t border-gray-100 space-y-3">
          {user && (
            <div className="px-3">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
