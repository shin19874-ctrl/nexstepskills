import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BadgeCheck, Compass, GraduationCap, Handshake } from 'lucide-react'
import { supabase, asset } from '../lib/supabase'
import { TYPES } from '../lib/config'
import Card, { ICONS } from '../components/Card'
import { Empty, Spinner } from '../components/ui'
import { useAuth } from '../components/Auth'

const WHY = [
  [GraduationCap, 'Practical skills', 'Learning designed around what employers and teams actually need.'],
  [Handshake, 'Opportunities in one place', 'Webinars, courses and internships you can apply to with a single profile.'],
  [BadgeCheck, 'Curated and verified', 'Every listing is reviewed and published by the NexStep team.'],
  [Compass, 'Clear next steps', 'Track every application and see its status from your dashboard.'],
]
const BLURB = { webinars: 'Join live, expert-led sessions.', courses: 'Build skills step by step.', internships: 'Get real work experience.' }

export default function Home() {
  const { user } = useAuth()
  const [feat, setFeat] = useState(null)
  useEffect(() => {
    Promise.all(Object.keys(TYPES).map((type) =>
      supabase.from(TYPES[type].table).select('*').eq('published', true).order('created_at', { ascending: false }).limit(2)
        .then(({ data }) => (data || []).map((item) => ({ type, item })))
    )).then((r) => setFeat(r.flat()))
  }, [])

  return (
    <>
      <section className="bg-gradient-to-b from-ocean-50 to-white">
        <div className="container-x grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          <div>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">Your Next Step Starts Here.</h1>
            <p className="mt-5 max-w-lg text-lg text-slate-600">Discover opportunities, develop practical skills, and build a future you're excited about.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#featured" className="btn-primary px-6 py-3">Explore Opportunities</a>
              <Link to={user ? '/dashboard' : '/signup'} className="btn-outline px-6 py-3">Get Started</Link>
            </div>
          </div>
          <div className="mx-auto w-full max-w-sm rounded-3xl border border-ocean-100 bg-white p-6 shadow-sm">
            <img src={asset('logo.jpg')} alt="NexStep: Learn, Connect, Grow" className="w-full" />
          </div>
        </div>
      </section>

      <section id="featured" className="container-x py-16">
        <h2 className="text-2xl font-bold sm:text-3xl">Featured opportunities</h2>
        {!feat ? <Spinner /> : feat.length === 0 ? (
          <div className="mt-6"><Empty title="Opportunities are coming soon" text="The NexStep team is preparing the first webinars, courses and internships. Create an account so you're ready." /></div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{feat.map(({ type, item }) => <Card key={type + item.id} type={type} item={item} />)}</div>
        )}
      </section>

      <section className="bg-slate-50 py-16">
        <div className="container-x">
          <h2 className="text-2xl font-bold sm:text-3xl">Explore by category</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {Object.entries(TYPES).map(([type, c]) => {
              const Icon = ICONS[c.icon]
              return (
                <Link key={type} to={`/${type}`} className="card group p-6 transition hover:border-ocean-300 hover:shadow-md">
                  <Icon className="h-8 w-8 text-ocean-600" />
                  <h3 className="mt-4 text-xl font-semibold">{c.plural}</h3>
                  <p className="mt-1 text-sm text-slate-600">{BLURB[type]}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-ocean-700">Browse {c.plural.toLowerCase()} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="container-x py-16">
        <h2 className="text-2xl font-bold sm:text-3xl">Why NexStep</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {WHY.map(([Icon, t, d]) => (
            <div key={t}><Icon className="h-6 w-6 text-aqua-500" /><h3 className="mt-3 font-semibold">{t}</h3><p className="mt-1 text-sm text-slate-600">{d}</p></div>
          ))}
        </div>
      </section>

      <section className="container-x">
        <div className="rounded-2xl bg-navy-900 p-8 text-white sm:p-12">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">About NexStep</h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-slate-300">NexStep is an independent skill-development and career-opportunities platform founded by Shin. We help students and young professionals become future-ready through relevant skills, practical learning, expert-led webinars, courses and internship opportunities.</p>
          <Link to={user ? '/dashboard' : '/signup'} className="btn mt-6 bg-white text-navy-900 hover:bg-ocean-100">{user ? 'Open my dashboard' : 'Create a free account'}</Link>
        </div>
      </section>
    </>
  )
}
