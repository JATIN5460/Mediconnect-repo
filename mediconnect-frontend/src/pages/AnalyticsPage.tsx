import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import Topbar from '../components/layout/Topbar'
import {
  getMonthlyTrendApi,
  getTopDoctorsApi,
  getStatusBreakdownApi,
  getDashboardStatsApi,
} from '../api/analytics.api'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280']

const AnalyticsPage = () => {
  const currentYear  = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const [year, setYear]   = useState(currentYear)
  const [month, setMonth] = useState(currentMonth)

  const { data: statsData } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn:  getDashboardStatsApi,
  })

  const { data: trendData, isLoading: trendLoading } = useQuery({
    queryKey: ['monthly-trend', year, month],
    queryFn:  () => getMonthlyTrendApi(year, month),
  })

  const { data: topDoctorsData, isLoading: doctorsLoading } = useQuery({
    queryKey: ['top-doctors'],
    queryFn:  () => getTopDoctorsApi(10),
  })

  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ['status-breakdown'],
    queryFn:  getStatusBreakdownApi,
  })

  const trend      = trendData?.data?.trend || []
  const topDoctors = topDoctorsData?.data?.doctors || []
  const breakdown  = statusData?.data?.breakdown || []
  const stats      = statsData?.data

  const months = [
    'Jan','Feb','Mar','Apr','May','Jun',
    'Jul','Aug','Sep','Oct','Nov','Dec'
  ]

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Analytics" />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Appointments', value: stats?.appointments?.total ?? 0,     color: 'text-blue-600' },
            { label: 'Completed',          value: stats?.appointments?.completed ?? 0,  color: 'text-green-600' },
            { label: 'Cancelled',          value: stats?.appointments?.cancelled ?? 0,  color: 'text-red-500' },
            { label: 'Cancellation Rate',  value: `${stats?.appointments?.cancellationRate ?? 0}%`, color: 'text-amber-600' },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className={`text-2xl font-bold mt-1 ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Monthly trend chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-gray-800">Monthly Trend</h2>
            <div className="flex items-center gap-2">
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {months.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {trendLoading ? (
            <div className="h-64 bg-gray-50 rounded-xl animate-pulse" />
          ) : trend.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
              No data for this period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '12px'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  name="Total"
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  name="Completed"
                />
                <Line
                  type="monotone"
                  dataKey="cancelled"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  name="Cancelled"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top doctors + Status breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Top doctors bar chart */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-6">Top Doctors</h2>
            {doctorsLoading ? (
              <div className="h-64 bg-gray-50 rounded-xl animate-pulse" />
            ) : topDoctors.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topDoctors} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="appointments" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Appointments" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Status breakdown pie chart */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-6">Status Breakdown</h2>
            {statusLoading ? (
              <div className="h-64 bg-gray-50 rounded-xl animate-pulse" />
            ) : breakdown.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={breakdown}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                  >
                    {breakdown.map((_: any, index: number) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '12px'
                    }}
                    formatter={(value: any, name: any) => [value, name]}
                  />
                  <Legend
                    formatter={(value) => (
                      <span style={{ fontSize: '12px', color: '#6b7280', textTransform: 'capitalize' }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage