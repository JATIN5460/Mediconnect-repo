const statusConfig: Record<string, { label: string; className: string }> = {
  scheduled:    { label: 'Scheduled',   className: 'bg-blue-50 text-blue-600' },
  confirmed:    { label: 'Confirmed',   className: 'bg-green-50 text-green-600' },
  'in-progress':{ label: 'In Progress', className: 'bg-yellow-50 text-yellow-600' },
  completed:    { label: 'Completed',   className: 'bg-purple-50 text-purple-600' },
  cancelled:    { label: 'Cancelled',   className: 'bg-red-50 text-red-500' },
  'no-show':    { label: 'No Show',     className: 'bg-gray-100 text-gray-500' },
}

const StatusBadge = ({ status }: { status: string }) => {
  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-500' }
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}

export default StatusBadge