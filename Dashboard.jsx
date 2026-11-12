import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { fetchApps } from '../lib/apps'
import { TYPES, fmt } from '../lib/config'
import { useAuth } from '../components/Auth'
import { Empty, ErrorBox, Spinner, StatusBadge, useToast } from '../components/ui'

export default function Dashboard() {
  const { user, profile, refresh } = useAuth()
  const toast = useToast()
  const [apps, setApps] = useState(null)
  const [err, setErr] = useState('')
  const [p, setP] = useState({ full_name: '', phone: '' })
  const [busy, setBusy] = useState(false)

  useEffect(() => { fetchApps(user.id).then(setApps).catch(() => { setErr('Could not load your applications.'); setApps([]) }) }, [user.id])
  useEffect(() => { setP({ full_name: profile?.full_name || '', phone: profile?.phone || '' }) }, [profile])

  const save = async (e) => {
    e.preventDefault(); setBusy(true)
    const { error } = await supabase.from('profiles').update({ full_name: p.full_name.trim(), phone: p.phone.trim() }).eq('id', user.id)
    setBusy(false)
    if (error) toast('Could not save your profile.', 'err'); else { toast('Profile saved'); refresh() }
  }

  return (
    <div className="container-x grid gap-8 py-10 lg:grid-cols-3">
      <aside className="card h-fit p-6">
        <h2 className="text-lg font-semibold">My profile</h2>
        <form onSubmit={save} className="mt-4 space-y-4">
          <div><label className="label">Email</label><input className="input" value={user.email} disabled /></div>
          <div><label className="label">Full name</label><input className="input" value={p.full_name} onChange={(e) => setP({ ...p, full_name: e.target.value })} /></div>
          <div><label className="label">Phone</label><input className="input" value={p.phone} onChange={(e) => setP({ ...p, phone: e.target.value })} /></div>
          <button className="btn-primary w-full" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button>
        </form>
      </aside>
      <section className="lg:col-span-2">
        <h1 className="text-2xl font-bold">My applications</h1>
        <p className="mt-1 text-sm text-slate-500">Everything you've applied for, with its current status.</p>
        <div className="mt-5"><ErrorBox>{err}</ErrorBox></div>
        {!apps ? <Spinner /> : apps.length === 0 ? (
          <Empty title="No applications yet" text="Browse opportunities and apply. They will show up here.">
            <Link to="/webinars" className="btn-primary">Browse webinars</Link>
          </Empty>
        ) : (
          <ul className="space-y-3">
            {apps.map((a) => (
              <li key={a.type + a.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-ocean-700">{TYPES[a.type].label}</p>
                  <Link to={`/${a.type}/${a[TYPES[a.type].fk]}`} className="block truncate font-semibold text-navy-900 hover:text-ocean-700">{a.itemTitle}</Link>
                  <p className="text-xs text-slate-500">Applied {fmt(a.created_at)}</p>
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
