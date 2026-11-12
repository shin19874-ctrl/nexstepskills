import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { TYPES } from '../lib/config'
import Card from '../components/Card'
import { Empty, ErrorBox, Spinner } from '../components/ui'

const INTRO = {
  webinars: 'Expert-led sessions you can join live. Apply and we will confirm your seat by email.',
  courses: 'Structured courses to build practical, job-ready skills.',
  internships: 'Hands-on experience with real organizations, handpicked by NexStep.',
}

export default function Listing() {
  const { type } = useParams()
  const cfg = TYPES[type]
  const [items, setItems] = useState(null)
  const [err, setErr] = useState('')
  const [q, setQ] = useState('')

  useEffect(() => {
    if (!cfg) return
    setItems(null); setErr('')
    supabase.from(cfg.table).select('*').eq('published', true).order('created_at', { ascending: false })
      .then(({ data, error }) => { if (error) setErr('Could not load this page. Please refresh.'); setItems(data || []) })
  }, [type])

  if (!cfg) return <div className="container-x py-24 text-center"><h1 className="text-3xl font-bold">Page not found</h1></div>
  const shown = (items || []).filter((i) => `${i.title} ${i[cfg.sub] || ''} ${i.description || ''}`.toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="container-x py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-3xl font-bold sm:text-4xl">{cfg.plural}</h1><p className="mt-2 max-w-xl text-slate-600">{INTRO[type]}</p></div>
        <input className="input sm:max-w-xs" placeholder={`Search ${cfg.plural.toLowerCase()}…`} value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
      </div>
      <div className="mt-8"><ErrorBox>{err}</ErrorBox></div>
      {!items ? <Spinner /> : shown.length === 0 ? (
        <Empty title={q ? 'No matches' : `No ${cfg.plural.toLowerCase()} yet`} text={q ? 'Try a different search.' : 'New opportunities are added regularly. Check back soon.'} />
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{shown.map((i) => <Card key={i.id} type={type} item={i} />)}</div>
      )}
    </div>
  )
}
