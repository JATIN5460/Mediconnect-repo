import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, UserRound, Calendar,
  BarChart3, Settings, HardDrive, ClipboardList, LogOut
} from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'
import { logoutApi } from '../../api/auth.api'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/doctors',       icon: UserRound,        label: 'Doctors' },
  { to: '/patients',      icon: Users,            label: 'Patients' },
  { to: '/appointments',  icon: Calendar,         label: 'Appointments' },
  { to: '/analytics',     icon: BarChart3,        label: 'Analytics' },
]

const adminItems = [
  { to: '/settings',  icon: Settings,       label: 'Settings' },
  { to: '/backup',    icon: HardDrive,      label: 'Backup' },
  { to: '/audit',     icon: ClipboardList,  label: 'Audit Logs' },
]

const Sidebar = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logoutApi()
    } catch {}
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <div className="flex flex-col w-64 min-h-screen bg-gray-900 text-white">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">
          M
        </div>
        <div>
          <p className="font-semibold text-sm">MediConnect</p>
          <p className="text-xs text-gray-400">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-xs text-gray-500 uppercase tracking-wider px-3 mb-2">Main</p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}

        {(user?.role === 'super_admin' || user?.role === 'admin') && (
          <>
            <p className="text-xs text-gray-500 uppercase tracking-wider px-3 mt-4 mb-2">Admin</p>
            {adminItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`
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
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.role}</p>
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
}

export default Sidebar