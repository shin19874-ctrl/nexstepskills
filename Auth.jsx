import { createContext, useContext, useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Spinner } from './ui'

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = async (s) => {
    if (!s) { setProfile(null); setIsAdmin(false); return }
    const [p, a] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', s.user.id).maybeSingle(),
      supabase.rpc('is_admin'),
    ])
    setProfile(p.data); setIsAdmin(a.data === true)
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => { setSession(data.session); await load(data.session); setLoading(false) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); setTimeout(() => load(s), 0) })
    return () => subscription.unsubscribe()
  }, [])

  const value = { session, user: session?.user ?? null, profile, isAdmin, loading, refresh: () => load(session), signOut: () => supabase.auth.signOut() }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// Page guard. The real protection is in the database (RLS); this just keeps people out of screens they can't use.
export function Protected({ admin, children }) {
  const { user, isAdmin, loading } = useAuth()
  const loc = useLocation()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />
  if (admin && !isAdmin) return <Navigate to="/" replace />
  return children
}
