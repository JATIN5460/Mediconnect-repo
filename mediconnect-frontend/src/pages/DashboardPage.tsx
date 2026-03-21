import { useEffect, useState } from 'react'
import { UserRound, Users, Calendar, Clock } from 'lucide-react'
import Topbar from '../components/layout/Topbar'
import api from '../api/axios'

interface Stats {
  doctors: { total: number; active: number }
  appointments: {
    total: number
    today: number
    pending: number
    completed: number
    cancelled: number
    cancellationRate: number
  }
}

const StatCard = ({
  title, value, icon: Icon, color
}: {
  title: string
  value: number | string
  icon: any
  color: string
}) => (
  <div className="bg-white rounded-xl border border-gray-100 p-6 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
)

const DashboardPage = () => {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/analytics/dashboard')
        if (res.data.success) setStats(res.data.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Dashboard" />
      <div className="flex-1 p-6">

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 h-24 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Doctors"
              value={stats?.doctors.total ?? 0}
              icon={UserRound}
              color="bg-blue-500"
            />
            <StatCard
              title="Today's Appointments"
              value={stats?.appointments.today ?? 0}
              icon={Calendar}
              color="bg-green-500"
            />
            <StatCard
              title="Pending"
              value={stats?.appointments.pending ?? 0}
              icon={Clock}
              color="bg-amber-500"
            />
            <StatCard
              title="Completed"
              value={stats?.appointments.completed ?? 0}
              icon={Users}
              color="bg-purple-500"
            />
          </div>
        )}

        <div className="mt-6 bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Total Appointments</p>
              <p className="text-xl font-bold text-gray-800">{stats?.appointments.total ?? 0}</p>
            </div>
            <div>
              <p className="text-gray-500">Cancelled</p>
              <p className="text-xl font-bold text-red-500">{stats?.appointments.cancelled ?? 0}</p>
            </div>
            <div>
              <p className="text-gray-500">Cancellation Rate</p>
              <p className="text-xl font-bold text-gray-800">{stats?.appointments.cancellationRate ?? 0}%</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default DashboardPage