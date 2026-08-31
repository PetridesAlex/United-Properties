import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type {Session, User} from '@supabase/supabase-js'
import type {Profile} from '../../types/cms'
import {fetchCurrentProfile, isAdminRole, signOut as authSignOut} from '../auth/session'
import {supabase} from '../supabase/client'

type AdminAuthState = {
  loading: boolean
  profileLoading: boolean
  session: Session | null
  user: User | null
  profile: Profile | null
  isAdmin: boolean
  refreshProfile: () => Promise<Profile | null>
  signOut: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthState | null>(null)

export function AdminAuthProvider({children}: {children: ReactNode}) {
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const hasProfileRef = useRef(false)

  const loadProfile = useCallback(async (): Promise<Profile | null> => {
    const blockUi = !hasProfileRef.current
    if (blockUi) setProfileLoading(true)
    try {
      const next = await fetchCurrentProfile()
      hasProfileRef.current = Boolean(next)
      setProfile(next)
      return next
    } finally {
      if (blockUi) setProfileLoading(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    async function init() {
      if (!supabase) {
        if (mounted) setLoading(false)
        return
      }

      const {data} = await supabase.auth.getSession()
      if (!mounted) return
      setSession(data.session)

      if (data.session) {
        await loadProfile()
      }
      if (mounted) setLoading(false)
    }

    void init()

    if (!supabase) return

    const {data: sub} = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (nextSession) {
        void loadProfile()
      } else {
        hasProfileRef.current = false
        setProfile(null)
        setProfileLoading(false)
      }
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [loadProfile])

  const value = useMemo<AdminAuthState>(
    () => ({
      loading,
      profileLoading,
      session,
      user: session?.user ?? null,
      profile,
      isAdmin: Boolean(
        profile?.active && isAdminRole(profile.role),
      ),
      refreshProfile: loadProfile,
      signOut: async () => {
        await authSignOut()
        hasProfileRef.current = false
        setProfile(null)
        setSession(null)
      },
    }),
    [loading, profileLoading, session, profile, loadProfile],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
