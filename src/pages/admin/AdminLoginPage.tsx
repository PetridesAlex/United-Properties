import {useEffect, useRef, useState, type FormEvent} from 'react'
import {Link, Navigate, useLocation, useNavigate} from 'react-router-dom'
import {ArrowRight, AlertCircle, LockKeyhole, ShieldCheck} from 'lucide-react'
import GlitterWarp from '../../components/GlitterWarp/GlitterWarp'
import AdminEntryLoader from '../../components/admin/AdminEntryLoader'
import {signInWithPassword, isAdminRole} from '../../lib/auth/session'
import {useAdminAuth} from '../../lib/auth/AdminAuthProvider'
import '../../components/GlitterWarp/GlitterWarp.css'
import '../../components/admin/AdminEntryLoader.css'
import '../../components/admin/AdminShell.css'
import './AdminLoginPage.css'

type LoginErrorCopy = {
  title: string
  detail: string
}

function loginErrorCopy(raw: string): LoginErrorCopy {
  const lower = raw.toLowerCase()

  if (
    lower.includes('invalid login credentials') ||
    lower.includes('invalid credentials') ||
    lower.includes('wrong password') ||
    lower.includes('incorrect password')
  ) {
    return {
      title: 'Oops — looks like a mistype',
      detail: 'Please double-check your email and password, then try again.',
    }
  }

  if (lower.includes('email not confirmed')) {
    return {
      title: 'Email not verified yet',
      detail: 'Confirm your staff email before signing in.',
    }
  }

  if (lower.includes('too many requests') || lower.includes('rate limit')) {
    return {
      title: 'Too many attempts',
      detail: 'Please wait a moment and try again.',
    }
  }

  return {
    title: 'Could not sign you in',
    detail: 'Something went wrong. Please try again in a moment.',
  }
}

const ENTRY_DELAY_MS = 4000

export default function AdminLoginPage() {
  const {loading, isAdmin, session, refreshProfile, signOut} = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const emailRef = useRef<HTMLInputElement>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<LoginErrorCopy | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [entering, setEntering] = useState(false)
  const [portalOpen, setPortalOpen] = useState(false)

  const from = (location.state as {from?: string} | null)?.from || '/admin'

  useEffect(() => {
    if (!portalOpen) return
    const id = window.requestAnimationFrame(() => emailRef.current?.focus())
    return () => window.cancelAnimationFrame(id)
  }, [portalOpen])

  useEffect(() => {
    if (!portalOpen) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setPortalOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [portalOpen])

  if (entering) {
    return <AdminEntryLoader durationMs={ENTRY_DELAY_MS} subtitle="Welcome back" />
  }

  if (!loading && session && isAdmin) {
    return <Navigate to={from} replace />
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const {error: authError} = await signInWithPassword(email.trim(), password)
      if (authError) {
        setError(loginErrorCopy(authError.message))
        return
      }

      setEntering(true)
      const started = Date.now()
      const profile = await refreshProfile()
      const remaining = ENTRY_DELAY_MS - (Date.now() - started)
      if (remaining > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, remaining))
      }

      if (!profile?.active || !isAdminRole(profile.role)) {
        setEntering(false)
        await signOut()
        setError({
          title: 'Access not enabled',
          detail: 'Your account is signed in but admin access is not active yet.',
        })
        return
      }

      navigate(from, {replace: true})
    } catch (err) {
      setEntering(false)
      setError(
        loginErrorCopy(err instanceof Error ? err.message : 'Could not sign in'),
      )
    } finally {
      setSubmitting(false)
    }
  }

  function openPortal() {
    setError(null)
    setPortalOpen(true)
  }

  function closePortal() {
    if (submitting) return
    setPortalOpen(false)
  }

  return (
    <div className={`admin-login${portalOpen ? ' is-portal-open' : ''}`}>
      <GlitterWarp
        className="admin-login__glitter"
        width="100%"
        height="100%"
        speed={1.2}
        color="#d5b59a"
        density={15}
        brightness={1.5}
        starSize={0.12}
        turbulence={0.5}
        focalDepth={0.03}
      />

      <div className="admin-login__overlay" aria-hidden="true" />

      <div className="admin-login__stage">
        <section className="admin-login__gate" aria-label="Staff access gate">
          <Link to="/" className="admin-login__logo-link">
            <img
              src="/images/logo/United_Properties_v2.1.svg"
              alt="United Properties"
              className="admin-login__logo"
            />
          </Link>

          <p className="admin-login__brand-kicker">Private staff access</p>

          <div className="admin-login__secure-badge" aria-hidden="true">
            <span className="admin-login__secure-ring" />
            <span className="admin-login__secure-icon">
              <LockKeyhole size={22} strokeWidth={1.85} />
            </span>
          </div>

          <p className="admin-login__secure-label">
            <ShieldCheck size={15} strokeWidth={2} aria-hidden />
            Extra-secure login portal
          </p>

          {!portalOpen ? (
            <button type="button" className="admin-login__portal-trigger" onClick={openPortal}>
              <span className="admin-login__portal-trigger-copy">
                <strong className="admin-login__portal-trigger-title">
                  <span className="admin-login__portal-trigger-title-text" aria-hidden="true">
                    United Properties
                  </span>
                  <span className="sr-only">United Properties — open staff portal</span>
                </strong>
                <em>Authorised personnel only</em>
              </span>
              <span className="admin-login__portal-trigger-icon" aria-hidden>
                <ArrowRight size={20} strokeWidth={2.1} />
              </span>
            </button>
          ) : null}
        </section>

        <div
          className="admin-login__portal-backdrop"
          aria-hidden={!portalOpen}
          onClick={closePortal}
        />

        <section
          className="admin-login__portal"
          aria-label="Staff sign in"
          aria-hidden={!portalOpen}
        >
          <form className="admin-login__card" onSubmit={(e) => void onSubmit(e)} noValidate>
            <label className="admin-login__field" htmlFor="admin-email">
              <input
                ref={emailRef}
                id="admin-email"
                type="email"
                autoComplete="username"
                required
                aria-label="Email address"
                placeholder="Email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError(null)
                }}
              />
            </label>
            <label className="admin-login__field" htmlFor="admin-password">
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                required
                aria-label="Password"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (error) setError(null)
                }}
                aria-invalid={error ? true : undefined}
              />
            </label>

            {error ? (
              <div className="admin-login__error" role="alert" aria-live="polite">
                <span className="admin-login__error-icon" aria-hidden>
                  <AlertCircle size={18} strokeWidth={2} />
                </span>
                <div className="admin-login__error-copy">
                  <strong>{error.title}</strong>
                  <p>{error.detail}</p>
                </div>
              </div>
            ) : null}

            <button className="admin-login__submit" type="submit" disabled={submitting}>
              {submitting ? 'Logging in…' : 'Login'}
            </button>

            <button
              type="button"
              className="admin-login__portal-close"
              onClick={closePortal}
              disabled={submitting}
            >
              Back to gate
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
