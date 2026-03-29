import { useState, useEffect } from 'react'
import { WifiOff } from 'lucide-react'

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [show, setShow]         = useState(false)

  useEffect(() => {
    const handleOnline  = () => { setIsOnline(true);  setShow(true); setTimeout(() => setShow(false), 3000) }
    const handleOffline = () => { setIsOnline(false); setShow(true) }

    window.addEventListener('online',  handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online',  handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!show) return null

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium shadow-lg transition-all ${
      isOnline
        ? 'bg-green-500 text-white'
        : 'bg-gray-900 text-white'
    }`}>
      {!isOnline && <WifiOff size={15} />}
      {isOnline ? 'Back online' : 'No internet connection'}
    </div>
  )
}

export default NetworkStatus