import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { TYPES, fmt, isOpen } from '../lib/config'
import { useAuth } from '../components/Auth'
import ApplyModal from '../components/ApplyModal'
import { OpenBadge, Poster } from '../components/Card'
import { Spinner, StatusBadge } from '../components/ui'

export default function Detail() {
  const { type, id } = useParams()
  const cfg = TYPES[type]
  const { user } = useAuth()
  const nav = useNavigate()
  const [item, setItem] = useState(undefined)
  const [mine, setMine] = useState(null)
  const [apply, setApply] = useState(false)

  const loadMine = async () => {
    if (!user || !cfg) return
    const { data } = await supabase.from(cfg.appTable).select('status').eq(cfg.fk, id).eq('user_id', user.id).maybeSingle()
    setMine(data)
  }
  useEffect(() => { if (cfg) supabase.from(cfg.table).select('*').eq('id', id).maybeSingle().then(({ data }) => setItem(data)) }, [type, id])
  useEffect(() => { loadMine() }, [user, type, id])

  if (!cfg) return <div className="container-x py-24 text-center"><h1 className="text-3xl font-bold">Page not found</h1></div>
  if (item === undefined) return <Spinner />
  if (!item) return <div className="container-x py-24 text-center"><h1 className="text-2xl font-bold">This listing is not available</h1><Link to={`/${type}`} className="btn-primary mt-6">Back to {cfg.plural.toLowerCase()}</Link></div>

  const open = isOpen(type, item)
  const external = type === 'internships' && item.apply_type === 'external'
  const isUrl = /^https?:\/\//i.test(item.apply_link || '')
  const facts = cfg.fields.filter((f) => !['title', 'description', 'apply_type', 'apply_link'].includes(f.n) && f.t !== 'textarea' && item[f.n])
  const longs = cfg.fields.filter((f) => f.t === 'textarea' && f.n !== 'description' && item[f.n])
  const onApply = () => user ? setApply(true) : nav('/login', { state: { from: `/${type}/${id}` } })

  return (
    <div className="container-x py-10">
      <Link to={`/${type}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-navy-900"><ArrowLeft className="h-4 w-4" />All {cfg.plural.toLowerCase()}</Link>
      <div className="mt-5 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Poster type={type} url={item.poster_url} className="aspect-[16/9] w-full rounded-xl" />
          <div className="mt-6 flex items-center gap-3"><span className="text-sm font-medium text-ocean-700">{cfg.label}</span><OpenBadge open={open} /></div>
          <h1 className="mt-2 text-3xl font-bold">{item.title}</h1>
          {item.description && <p className="mt-4 whitespace-pre-line leading-relaxed">{item.description}</p>}
          {longs.map((f) => <section key={f.n} className="mt-6"><h2 className="text-lg font-semibold">{f.l}</h2><p className="mt-2 whitespace-pre-line leading-relaxed">{item[f.n]}</p></section>)}
        </div>
        <aside className="card h-fit p-6 lg:sticky lg:top-24">
          <dl className="space-y-3 text-sm">
            {facts.map((f) => (
              <div key={f.n}><dt className="text-slate-500">{f.l}</dt><dd className="font-medium text-navy-900">{f.t === 'datetime' || f.t === 'date' ? fmt(item[f.n], f.t) : item[f.n]}</dd></div>
            ))}
          </dl>
          <div className="mt-6 border-t border-slate-100 pt-5">
            {mine ? (
              <div className="text-sm"><p className="mb-2 text-slate-600">You have applied. Current status:</p><StatusBadge status={mine.status} /></div>
            ) : !open ? (
              <button className="btn-outline w-full" disabled>Registration closed</button>
            ) : external ? (
              isUrl ? <a href={item.apply_link} target="_blank" rel="noreferrer noopener" className="btn-primary w-full">Apply on website <ExternalLink className="h-4 w-4" /></a>
                : <div className="rounded-lg bg-ocean-50 p-3 text-sm"><b>How to apply:</b><p className="mt-1 whitespace-pre-line">{item.apply_link || 'Instructions coming soon.'}</p></div>
            ) : (
              <button className="btn-primary w-full" onClick={onApply}>Apply now</button>
            )}
            {!user && open && !external && <p className="mt-2 text-center text-xs text-slate-500">You will be asked to log in first.</p>}
          </div>
        </aside>
      </div>
      {apply && <ApplyModal type={type} item={item} onClose={() => setApply(false)} onDone={loadMine} />}
    </div>
  )
}
