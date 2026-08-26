import {useState, type FormEvent} from 'react'
import {Link, Navigate, useLocation, useNavigate} from 'react-router-dom'
import {LockKeyhole} from 'lucide-react'
import {signInWithPassword} from '../../lib/auth/session'
import {useAdminAuth} from '../../lib/auth/AdminAuthProvider'
import '../../components/admin/AdminShell.css'
import './AdminLoginPage.css'

export default function AdminLoginPage() {
  const {loading, isAdmin, session} = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const from = (location.state as {from?: string} | null)?.from || '/admin'

  if (!loading && session && isAdmin) {
    return <Navigate to={from} replace />
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const {error: authError} = await signInWithPassword(email.trim(), password)
      if (authError) {
        setError(authError.message)
        return
      }
      navigate(from, {replace: true})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login__atmosphere" aria-hidden="true" />

      <div className="admin-login__stage">
        <aside className="admin-login__brand">
          <Link to="/" className="admin-login__logo-link">
            <img
              src="/images/logo/United_Properties_v2.1.svg"
              alt="United Properties"
              className="admin-login__logo"
            />
          </Link>
          <p className="admin-login__brand-kicker">Private staff access</p>
          <h1 className="admin-login__brand-title">
            Property management,
            <span> refined.</span>
          </h1>
          <p className="admin-login__brand-copy">
            Sign in to manage listings, media, enquiries, and website content for United Properties.
          </p>
          <ul className="admin-login__brand-points">
            <li>Listings & lifecycle</li>
            <li>Website content</li>
            <li>Client enquiries</li>
          </ul>
        </aside>

        <form className="admin-login__card" onSubmit={(e) => void onSubmit(e)} noValidate>
          <div className="admin-login__card-brand">
            <img
              src="/images/logo/United_Properties_v2.1.svg"
              alt="United Properties"
              className="admin-login__card-logo"
            />
            <p className="admin-login__eyebrow">Staff CMS</p>
          </div>

          <div className="admin-login__card-head">
            <span className="admin-login__seal" aria-hidden="true">
              <LockKeyhole size={18} strokeWidth={1.75} />
            </span>
            <div>
              <h2 className="admin-login__title">Welcome back</h2>
              <p className="admin-login__lede">Enter your staff credentials to continue.</p>
            </div>
          </div>

          <div className="admin-login__fields">
            <label className="admin-login__field" htmlFor="admin-email">
              <span>Email address</span>
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                required
                placeholder="name@unitedproperties.eu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="admin-login__field" htmlFor="admin-password">
              <span>Password</span>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          </div>

          {error ? (
            <p className="admin-login__error" role="alert">
              {error}
            </p>
          ) : null}

          <button className="admin-login__submit" type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in to CMS'}
          </button>

          <p className="admin-login__footnote">
            Access is restricted to authorised United Properties staff.
          </p>
        </form>
      </div>
    </div>
  )
}
