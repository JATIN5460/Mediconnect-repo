import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, UserRound, Calendar,
  BarChart3, Settings, HardDrive, ClipboardList,
  LogOut, Menu, X, UserCog, Building2
} from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'
import { logoutApi } from '../../api/auth.api'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/doctors',      icon: UserRound,        label: 'Doctors'      },
  { to: '/patients',     icon: Users,            label: 'Patients'     },
  { to: '/appointments', icon: Calendar,         label: 'Appointments' },
  { to: '/analytics',    icon: BarChart3,        label: 'Analytics'    },
]

const adminItems = [
  {
    to: '/settings', icon: Settings, label: 'Settings',
    roles: ['super_admin', 'clinic_owner', 'admin'],
  },
  {
    to: '/backup', icon: HardDrive, label: 'Backup',
    roles: ['super_admin', 'clinic_owner'],
  },
  {
    to: '/audit', icon: ClipboardList, label: 'Audit Logs',
    roles: ['super_admin', 'clinic_owner'],
  },
  {
    to: '/admins', icon: UserCog, label: 'Admin Accounts',
    roles: ['super_admin', 'clinic_owner'],
  },
  {
    to: '/clinics', icon: Building2, label: 'Clinics',
    roles: ['super_admin'],
  },
]

const Sidebar = () => {
  const { user, logout } = useAuthStore()
  const navigate         = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    try { await logoutApi() } catch {}
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const filteredAdminItems = adminItems.filter(
    item => item.roles.includes(user?.role || '')
  )

  const roleLabel: Record<string, string> = {
    super_admin:  'Super Admin',
    clinic_owner: 'Clinic Owner',
    admin:        'Admin',
    viewer:       'Viewer',
  }

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm text-white">
            M
          </div>
          <div>
            <p className="font-semibold text-sm text-white">MediConnect</p>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden text-gray-400 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-xs text-gray-500 uppercase tracking-wider px-3 mb-2">Main</p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ' +
              (isActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white')
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}

        {filteredAdminItems.length > 0 && (
          <>
            <p className="text-xs text-gray-500 uppercase tracking-wider px-3 mt-4 mb-2">
              Admin
            </p>
            {filteredAdminItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ' +
                  (isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white')
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="px-3 py-4 border-t border-gray-700">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">
              {roleLabel[user?.role || ''] || user?.role}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors w-full"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </div>
  )

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg shadow-lg"
      >
        <Menu size={20} />
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className={
        'fixed lg:static inset-y-0 left-0 z-50 flex flex-col w-64 min-h-screen bg-gray-900 text-white transition-transform duration-200 ' +
        (mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')
      }>
        <NavContent />
      </div>
    </>
  )
}

export default Sidebar
