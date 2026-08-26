import {Navigate, Outlet, useLocation} from 'react-router-dom'
import {useAdminAuth} from './AdminAuthProvider'

export function RequireAdmin() {
  const {loading, session, isAdmin} = useAdminAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="admin-loading" role="status">
        Checking access…
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/admin/login" replace state={{from: location.pathname}} />
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
