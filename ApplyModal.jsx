import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Modal, ErrorBox } from './ui'
import { useAuth } from './Auth'
import { supabase, sendEmail } from '../lib/supabase'
import { LEVELS, TYPES } from '../lib/config'

const SUCCESS = {
  webinars: ['Application Submitted Successfully!', 'Thank you for applying to NexStep. Your application has been received. Please wait while your seat is being confirmed. You will receive an email with further details regarding your registration.'],
  courses: ['Your application has been successfully submitted!', 'Thank you for choosing NexStep. Your application is under review. You will receive an email with further instructions and confirmation of your enrollment.'],
  internships: ['Your application has been successfully submitted!', 'Thank you for applying through NexStep. Your application is under review. You will receive an email with further instructions.'],
}

export default function ApplyModal({ type, item, onClose, onDone }) {
  const cfg = TYPES[type]
  const { user, profile } = useAuth()
  const [f, setF] = useState({ full_name: profile?.full_name || '', phone: profile?.phone || '', college: '', degree: '', year_of_study: LEVELS[0], reason: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault(); setErr('')
    if (f.reason.trim().length < 10) return setErr('Please write at least 10 characters in your answer.')
    if (!/^[0-9+() -]{7,20}$/.test(f.phone.trim())) return setErr('Enter a valid phone number (digits, +, spaces or dashes).')
    setBusy(true)
    const { data, error } = await supabase.from(cfg.appTable)
      .insert({ ...f, full_name: f.full_name.trim(), user_id: user.id, email: user.email, [cfg.fk]: item.id }).select('id').single()
    setBusy(false)
    if (error) {
      return setErr(error.code === '23505' ? 'You have already applied for this. Check your dashboard for its status.' : error.message.includes('closed') ? 'Applications are closed for this opportunity.' : 'Could not submit your application. Please try again.')
    }
    setDone(true); onDone?.()
    sendEmail('submitted', cfg.appTable, data.id)
  }

  if (done) return (
    <Modal title="Application received" onClose={onClose}>
      <div className="py-4 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-aqua-500" />
        <h3 className="mt-4 text-xl font-semibold">{SUCCESS[type][0]}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">{SUCCESS[type][1]}</p>
        <button className="btn-primary mt-6" onClick={onClose}>Done</button>
      </div>
    </Modal>
  )
  return (
    <Modal title={`Apply: ${item.title}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div><label className="label">Full name</label><input required className="input" value={f.full_name} onChange={set('full_name')} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Email</label><input className="input" value={user.email} disabled /></div>
          <div><label className="label">Phone number</label><input required type="tel" className="input" value={f.phone} onChange={set('phone')} placeholder="+91 98765 43210" /></div>
        </div>
        <div><label className="label">College / University</label><input required className="input" value={f.college} onChange={set('college')} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Current course / degree</label><input required className="input" value={f.degree} onChange={set('degree')} placeholder="e.g. B.Tech Computer Science" /></div>
          <div><label className="label">Year of study</label><select className="input" value={f.year_of_study} onChange={set('year_of_study')}>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select></div>
        </div>
        <div><label className="label">{cfg.why}</label><textarea required rows={4} maxLength={2000} className="input" value={f.reason} onChange={set('reason')} /></div>
        <ErrorBox>{err}</ErrorBox>
        <div className="flex justify-end gap-2"><button type="button" className="btn-outline" onClick={onClose}>Cancel</button><button className="btn-primary" disabled={busy}>{busy ? 'Submitting…' : 'Submit application'}</button></div>
      </form>
    </Modal>
  )
}
