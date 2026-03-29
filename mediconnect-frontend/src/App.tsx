import NetworkStatus from './components/shared/NetworkStatus'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary   from './components/shared/ErrorBoundary'
import AuthGuard       from './guards/AuthGuard'
import ProtectedLayout from './components/layout/ProtectedLayout'

const LoginPage        = lazy(() => import('./pages/LoginPage'))
const DashboardPage    = lazy(() => import('./pages/DashboardPage'))
const DoctorsPage      = lazy(() => import('./pages/DoctorsPage'))
const DoctorDetailPage = lazy(() => import('./pages/DoctorDetailPage'))
const PatientsPage     = lazy(() => import('./pages/PatientsPage'))
const AppointmentsPage = lazy(() => import('./pages/AppointmentsPage'))
const AnalyticsPage    = lazy(() => import('./pages/AnalyticsPage'))
const SettingsPage     = lazy(() => import('./pages/SettingsPage'))
const BackupPage       = lazy(() => import('./pages/BackupPage'))
const AuditLogsPage    = lazy(() => import('./pages/AuditLogsPage'))
const AdminsPage       = lazy(() => import('./pages/AdminsPage'))
const NotFoundPage     = lazy(() => import('./pages/NotFoundPage'))

const PageLoader = () => (
  <div className="flex items-center justify-center h-full min-h-screen">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-400">Loading...</p>
    </div>
  </div>
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <AuthGuard>
                    <ProtectedLayout />
                  </AuthGuard>
                }
              >
                <Route index                   element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard"        element={<DashboardPage />} />
                <Route path="doctors"          element={<DoctorsPage />} />
                <Route path="doctors/:id"      element={<DoctorDetailPage />} />
                <Route path="patients"         element={<PatientsPage />} />
                <Route path="appointments"     element={<AppointmentsPage />} />
                <Route path="analytics"        element={<AnalyticsPage />} />
                <Route path="settings"         element={<SettingsPage />} />
                <Route path="backup"           element={<BackupPage />} />
                <Route path="audit"            element={<AuditLogsPage />} />
                <Route path="admins"           element={<AdminsPage />} />
                <Route path="*"               element={<NotFoundPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontSize: '13px',
              borderRadius: '10px',
              border: '1px solid #e5e7eb',
            },
          }}
        />
      </QueryClientProvider>
      <NetworkStatus />
    </ErrorBoundary>
  )
}

export default App