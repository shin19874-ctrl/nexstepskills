import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Menu, X, Mail, Linkedin, AlertTriangle } from 'lucide-react'
import { useAuth } from './Auth'
import { asset, configured } from '../lib/supabase'

const links = [['/', 'Home'], ['/webinars', 'Webinars'], ['/courses', 'Courses'], ['/internships', 'Internships']]

function Navbar() {
  const { user, isAdmin, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const nav = useNavigate()
  const cls = ({ isActive }) => `rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'text-ocean-700' : 'text-slate-600 hover:text-navy-900'}`
  const out = async () => { await signOut(); setOpen(false); nav('/') }
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between">
        <Link to="/" aria-label="NexStep home"><img src={asset('logo-word.jpg')} alt="NexStep" className="h-9 w-auto" /></Link>
        <nav className="hidden items-center gap-1 md:flex">{links.map(([to, l]) => <NavLink key={to} to={to} end={to === '/'} className={cls}>{l}</NavLink>)}</nav>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (<>
            {isAdmin && <Link to="/admin" className="btn-dark btn-sm">Admin</Link>}
            <Link to="/dashboard" className="btn-outline btn-sm">My dashboard</Link>
            <button onClick={out} className="btn btn-sm text-slate-600 hover:text-navy-900">Log out</button>
          </>) : (<>
            <Link to="/login" className="btn-outline btn-sm">Log in</Link>
            <Link to="/signup" className="btn-primary btn-sm">Sign up</Link>
          </>)}
        </div>
        <button className="md:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <div className="border-t border-slate-100 bg-white px-4 py-3 md:hidden" onClick={() => setOpen(false)}>
          <div className="flex flex-col">
            {links.map(([to, l]) => <NavLink key={to} to={to} end={to === '/'} className={cls}>{l}</NavLink>)}
            {user ? (<>
              <Link to="/dashboard" className="px-3 py-2 text-sm font-medium">My dashboard</Link>
              {isAdmin && <Link to="/admin" className="px-3 py-2 text-sm font-medium">Admin</Link>}
              <button onClick={out} className="px-3 py-2 text-left text-sm font-medium">Log out</button>
            </>) : (
              <div className="mt-2 flex gap-2"><Link to="/login" className="btn-outline flex-1">Log in</Link><Link to="/signup" className="btn-primary flex-1">Sign up</Link></div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

function Footer() {
  return (
    <footer className="mt-20 bg-navy-900 text-slate-300">
      <div className="container-x grid gap-10 py-12 md:grid-cols-3">
        <div>
          <img src={asset('logo-word.jpg')} alt="NexStep" className="h-9 rounded bg-white px-2 py-1" />
          <p className="mt-4 max-w-xs text-sm text-slate-400">Skills, webinars, courses and internships to help you become future-ready.</p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">Explore</h3>
          <ul className="space-y-2 text-sm">{links.map(([to, l]) => <li key={to}><Link to={to} className="hover:text-white">{l}</Link></li>)}</ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">Contact</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="mailto:shin19874@gmail.com" className="inline-flex items-center gap-2 hover:text-white"><Mail className="h-4 w-4" />shin19874@gmail.com</a></li>
            <li><a href="https://www.linkedin.com/company/nexstep-skills" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-white"><Linkedin className="h-4 w-4" />NexStep on LinkedIn</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-slate-400">© {new Date().getFullYear()} NexStep. All rights reserved. Founded by Shin.</div>
    </footer>
  )
}

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      {!configured && (
        <div className="flex items-center justify-center gap-2 bg-amber-100 px-4 py-2 text-center text-sm text-amber-900">
          <AlertTriangle className="h-4 w-4 shrink-0" /> Supabase is not connected yet. Add your keys (see README, step 3).
        </div>
      )}
      <Navbar />
      <main className="flex-1"><Outlet /></main>
      <Footer />
    </div>
  )
}
