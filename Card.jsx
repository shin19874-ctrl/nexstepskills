import { Link } from 'react-router-dom'
import { Video, BookOpen, Briefcase, Calendar } from 'lucide-react'
import { TYPES, fmt, isOpen } from '../lib/config'

export const ICONS = { Video, BookOpen, Briefcase }

export function Poster({ type, url, className = '' }) {
  const Icon = ICONS[TYPES[type].icon]
  return url
    ? <img src={url} alt="" loading="lazy" className={`object-cover ${className}`} />
    : <div className={`flex items-center justify-center bg-gradient-to-br from-navy-900 via-navy-700 to-ocean-600 ${className}`}><Icon className="h-10 w-10 text-ocean-200" /></div>
}

export const OpenBadge = ({ open }) => (
  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${open ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{open ? 'Registration open' : 'Registration closed'}</span>
)

export default function Card({ type, item }) {
  const cfg = TYPES[type]
  const open = isOpen(type, item)
  const meta = cfg.fields.filter((f) => f.card && f.n !== cfg.sub && item[f.n])
  return (
    <Link to={`/${type}/${item.id}`} className="card group flex flex-col overflow-hidden transition hover:border-ocean-300 hover:shadow-md">
      <Poster type={type} url={item.poster_url} className="aspect-[16/9] w-full" />
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-ocean-700">{cfg.label}</span><OpenBadge open={open} />
        </div>
        <h3 className="text-lg font-semibold leading-snug group-hover:text-ocean-700">{item.title}</h3>
        {item[cfg.sub] && <p className="mt-1 text-sm text-slate-500">{item[cfg.sub]}</p>}
        <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-4 text-xs text-slate-500">
          {meta.map((f) => (
            <span key={f.n} className="inline-flex items-center gap-1">
              {(f.t === 'datetime' || f.t === 'date') && <Calendar className="h-3.5 w-3.5" />}
              {f.t === 'datetime' || f.t === 'date' ? fmt(item[f.n], f.t) : item[f.n]}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
