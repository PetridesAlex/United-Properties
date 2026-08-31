import {Navigate, Outlet, useLocation} from 'react-router-dom'
import AdminEntryLoader from '../../components/admin/AdminEntryLoader'
import {useAdminAuth} from './AdminAuthProvider'

export function RequireAdmin() {
  const {loading, profileLoading, session, profile, isAdmin} = useAdminAuth()
  const location = useLocation()

  // Only block on the initial session check — never remount the CMS on later profile refreshes.
  if (loading) {
    return <AdminEntryLoader subtitle="Verifying your access" />
  }

  if (!session) {
    return <Navigate to="/admin/login" replace state={{from: location.pathname}} />
  }

  // First profile fetch only (no cached profile yet). Token refresh must not wipe the page.
  if (!profile && profileLoading) {
    return <AdminEntryLoader subtitle="Verifying your access" />
  }

  if (!isAdmin) {
    return (
      <div className="admin-denied">
        <h1>Access denied</h1>
        <p>
          Your account is signed in but is not an active administrator. Ask a super admin to
          activate your profile in Supabase.
        </p>
      </div>
    )
  }

  return <Outlet />
}
