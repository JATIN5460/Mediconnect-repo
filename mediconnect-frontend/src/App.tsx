import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary    from './components/shared/ErrorBoundary'
import AuthGuard        from './guards/AuthGuard'
import ProtectedLayout  from './components/layout/ProtectedLayout'
import LoginPage        from './pages/LoginPage'
import DashboardPage    from './pages/DashboardPage'
import DoctorsPage      from './pages/DoctorsPage'
import DoctorDetailPage from './pages/DoctorDetailPage'
import PatientsPage     from './pages/PatientsPage'
import AppointmentsPage from './pages/AppointmentsPage'
import AnalyticsPage    from './pages/AnalyticsPage'
import SettingsPage     from './pages/SettingsPage'
import BackupPage       from './pages/BackupPage'
import AuditLogsPage    from './pages/AuditLogsPage'
import NotFoundPage     from './pages/NotFoundPage'

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
              <Route path="*"                element={<NotFoundPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
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
    </ErrorBoundary>
  )
}

export default App