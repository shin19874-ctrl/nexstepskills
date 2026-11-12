import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { supabase, siteUrl, asset } from '../lib/supabase'
import { useAuth } from '../components/Auth'
import { ErrorBox, Spinner } from '../components/ui'

function Shell({ title, sub, children }) {
  return (
    <div className="container-x flex justify-center py-14">
      <div className="card w-full max-w-md p-7 shadow-sm">
        <img src={asset('favicon.png')} alt="" className="mb-3 h-10 w-auto" />
        <h1 className="text-2xl font-bold">{title}</h1>
        {sub && <p className="mt-1 text-sm text-slate-500">{sub}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}
const nice = (m = '') => /invalid login/i.test(m) ? 'Incorrect email or password.' : /not confirmed/i.test(m) ? 'Please verify your email first. Check your inbox for the link.' : /already registered/i.test(m) ? 'An account with this email already exists. Try logging in.' : /rate limit/i.test(m) ? 'Too many attempts. Please wait a few minutes.' : m

export function Login() {
  const { user, loading } = useAuth()
  const nav = useNavigate(); const loc = useLocation()
  const [f, setF] = useState({ email: '', password: '' }); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  if (loading) return <Spinner />
  if (user) return <Navigate to={loc.state?.from || '/dashboard'} replace />
  const go = async (e) => {
    e.preventDefault(); setBusy(true); setErr('')
    const { error } = await supabase.auth.signInWithPassword(f)
    setBusy(false)
    if (error) setErr(nice(error.message)); else nav(loc.state?.from || '/dashboard', { replace: true })
  }
  return (
    <Shell title="Welcome back" sub="Log in to apply and track your applications.">
      <form onSubmit={go} className="space-y-4">
        <div><label className="label">Email</label><input type="email" required className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" /></div>
        <div><label className="label">Password</label><input type="password" required className="input" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete="current-password" /></div>
        <ErrorBox>{err}</ErrorBox>
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
        <div className="flex justify-between text-sm"><Link to="/forgot-password" className="text-ocean-700 hover:underline">Forgot password?</Link><Link to="/signup" className="text-ocean-700 hover:underline">Create account</Link></div>
      </form>
    </Shell>
  )
}

export function Signup() {
  const { user, loading } = useAuth()
  const [f, setF] = useState({ name: '', email: '', password: '' }); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false); const [sent, setSent] = useState(false)
  if (loading) return <Spinner />
  if (user) return <Navigate to="/dashboard" replace />
  const go = async (e) => {
    e.preventDefault(); setErr('')
    if (f.password.length < 8) return setErr('Password must be at least 8 characters.')
    setBusy(true)
    const { data, error } = await supabase.auth.signUp({ email: f.email, password: f.password, options: { data: { full_name: f.name }, emailRedirectTo: siteUrl() + 'login' } })
    setBusy(false)
    if (error) return setErr(nice(error.message))
    if (data.user && data.user.identities?.length === 0) return setErr(nice('already registered'))
    setSent(true)
  }
  if (sent) return (
    <Shell title="Check your email">
      <div className="text-center"><MailCheck className="mx-auto h-12 w-12 text-aqua-500" /><p className="mt-3 text-sm text-slate-600">We sent a verification link to <b>{f.email}</b>. Click it, then log in.</p><Link to="/login" className="btn-primary mt-5">Go to log in</Link></div>
    </Shell>
  )
  return (
    <Shell title="Create your account" sub="Join NexStep to apply for webinars, courses and internships.">
      <form onSubmit={go} className="space-y-4">
        <div><label className="label">Full name</label><input required className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" /></div>
        <div><label className="label">Email</label><input type="email" required className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" /></div>
        <div><label className="label">Password</label><input type="password" required minLength={8} className="input" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete="new-password" placeholder="At least 8 characters" /></div>
        <ErrorBox>{err}</ErrorBox>
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Creating…' : 'Sign up'}</button>
        <p className="text-center text-sm">Already have an account? <Link to="/login" className="text-ocean-700 hover:underline">Log in</Link></p>
      </form>
    </Shell>
  )
}

export function Forgot() {
  const [email, setEmail] = useState(''); const [busy, setBusy] = useState(false); const [sent, setSent] = useState(false); const [err, setErr] = useState('')
  const go = async (e) => {
    e.preventDefault(); setBusy(true); setErr('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: siteUrl() + 'reset-password' })
    setBusy(false); if (error) setErr(nice(error.message)); else setSent(true)
  }
  return (
    <Shell title="Reset your password" sub="We will email you a link to choose a new password.">
      {sent ? <p className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">If an account exists for <b>{email}</b>, a reset link is on its way.</p> : (
        <form onSubmit={go} className="space-y-4">
          <div><label className="label">Email</label><input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <ErrorBox>{err}</ErrorBox>
          <button className="btn-primary w-full" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</button>
        </form>
      )}
      <p className="mt-4 text-center text-sm"><Link to="/login" className="text-ocean-700 hover:underline">Back to log in</Link></p>
    </Shell>
  )
}

export function Reset() {
  const { user, loading } = useAuth()
  const nav = useNavigate()
  const [pw, setPw] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  if (loading) return <Spinner />
  const go = async (e) => {
    e.preventDefault(); setErr('')
    if (pw.length < 8) return setErr('Password must be at least 8 characters.')
    setBusy(true)
    const { error } = await supabase.auth.updateUser({ password: pw })
    setBusy(false); if (error) setErr(error.message); else nav('/dashboard', { replace: true })
  }
  return (
    <Shell title="Choose a new password">
      {!user ? <p className="text-sm text-slate-600">This reset link is invalid or has expired. <Link to="/forgot-password" className="text-ocean-700 hover:underline">Request a new one</Link>.</p> : (
        <form onSubmit={go} className="space-y-4">
          <div><label className="label">New password</label><input type="password" required minLength={8} className="input" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" /></div>
          <ErrorBox>{err}</ErrorBox>
          <button className="btn-primary w-full" disabled={busy}>{busy ? 'Saving…' : 'Save password'}</button>
        </form>
      )}
    </Shell>
  )
}
