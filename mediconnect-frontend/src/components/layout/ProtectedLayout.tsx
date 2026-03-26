import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

const ProtectedLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 lg:ml-0">
        <Outlet />
      </div>
    </div>
  )
}

export default ProtectedLayout