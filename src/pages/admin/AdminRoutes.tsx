import {Navigate, Route, Routes, useParams} from 'react-router-dom'
import {Toaster} from 'react-hot-toast'
import {AdminAuthProvider} from '../../lib/auth/AdminAuthProvider'
import {RequireAdmin} from '../../lib/auth/RequireAdmin'
import AdminShell from '../../components/admin/AdminShell'
import AdminLoginPage from './AdminLoginPage'
import AdminDashboardPage from './AdminDashboardPage'
import AdminPropertiesPage from './AdminPropertiesPage'
import AdminPropertyEditPage from './AdminPropertyEditPage'
import AdminContentPage from './AdminContentPage'
import AdminMediaPage from './AdminMediaPage'
import AdminEnquiriesPage from './AdminEnquiriesPage'
import AdminClientsPage from './AdminClientsPage'
import AdminClientEditPage from './AdminClientEditPage'
import AdminClientProfilePage from './AdminClientProfilePage'
import AdminTeamActivityPage from './AdminTeamActivityPage'
import AdminSettingsPage from './AdminSettingsPage'
import AdminBazarakiPage from './AdminBazarakiPage'
import AdminCalendarPage from './AdminCalendarPage'

function ClientEditRedirect() {
  const {id} = useParams()
  return <Navigate to={`/admin/clients/${id}`} replace />
}

export default function AdminRoutes() {
  return (
    <AdminAuthProvider>
      <Toaster position="top-right" toastOptions={{duration: 3200}} />
      <Routes>
        <Route path="login" element={<AdminLoginPage />} />
        <Route element={<RequireAdmin />}>
          <Route element={<AdminShell />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="properties" element={<AdminPropertiesPage />} />
            <Route path="properties/new" element={<AdminPropertyEditPage />} />
            <Route path="properties/:id/edit" element={<AdminPropertyEditPage />} />
            <Route path="content" element={<AdminContentPage />} />
            <Route path="media" element={<AdminMediaPage />} />
            <Route path="calendar" element={<AdminCalendarPage />} />
            <Route path="clients" element={<AdminClientsPage />} />
            <Route path="clients/new" element={<AdminClientEditPage />} />
            <Route path="clients/:id" element={<AdminClientProfilePage />} />
            <Route path="clients/:id/edit" element={<ClientEditRedirect />} />
            <Route path="activity" element={<AdminTeamActivityPage />} />
            <Route path="enquiries" element={<AdminEnquiriesPage />} />
            <Route path="bazaraki" element={<AdminBazarakiPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminAuthProvider>
  )
}
