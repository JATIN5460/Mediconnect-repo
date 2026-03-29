import toast from 'react-hot-toast'

export const handleApiError = (err: any, fallback = 'Something went wrong'): string => {
  if (!navigator.onLine) {
    toast.error('No internet connection')
    return 'No internet connection'
  }

  const message = err?.response?.data?.message || fallback

  if (err?.response?.status === 403) {
    toast.error('You do not have permission to perform this action')
    return 'Forbidden'
  }

  if (err?.response?.status === 404) {
    toast.error('Resource not found')
    return 'Not found'
  }

  if (err?.response?.status >= 500) {
    toast.error('Server error. Please try again later.')
    return 'Server error'
  }

  toast.error(message)
  return message
}