// One place that describes webinars, courses and internships, so pages and admin forms stay small.
export const LEVELS = ['1st year', '2nd year', '3rd year', '4th year', 'Postgraduate', 'Graduated', 'Other']

export const TYPES = {
  webinars: {
    label: 'Webinar', plural: 'Webinars', table: 'webinars', appTable: 'webinar_applications', fk: 'webinar_id',
    deadline: 'registration_deadline', sub: 'speaker', icon: 'Video',
    why: 'Why do you want to attend this webinar?',
    fields: [
      { n: 'title', l: 'Title', t: 'text', full: true, req: true },
      { n: 'description', l: 'Description', t: 'textarea', full: true },
      { n: 'speaker', l: 'Speaker', t: 'text', card: true },
      { n: 'event_date', l: 'Date & time', t: 'datetime', card: true },
      { n: 'duration', l: 'Duration', t: 'text', ph: 'e.g. 90 minutes', card: true },
      { n: 'mode', l: 'Mode', t: 'select', o: ['Online', 'Offline'] },
      { n: 'location', l: 'Venue / meeting details', t: 'text' },
      { n: 'eligibility', l: 'Eligibility', t: 'text' },
      { n: 'registration_deadline', l: 'Registration deadline', t: 'datetime' },
      { n: 'requirements', l: 'Registration requirements', t: 'textarea', full: true },
    ],
  },
  courses: {
    label: 'Course', plural: 'Courses', table: 'courses', appTable: 'course_applications', fk: 'course_id',
    deadline: 'registration_deadline', sub: 'instructor', icon: 'BookOpen',
    why: 'Why do you want to join this course?',
    fields: [
      { n: 'title', l: 'Course name', t: 'text', full: true, req: true },
      { n: 'description', l: 'Description', t: 'textarea', full: true },
      { n: 'instructor', l: 'Instructor', t: 'text', card: true },
      { n: 'duration', l: 'Duration', t: 'text', ph: 'e.g. 6 weeks', card: true },
      { n: 'start_date', l: 'Start date', t: 'date', card: true },
      { n: 'mode', l: 'Mode', t: 'select', o: ['Online', 'Offline', 'Hybrid'] },
      { n: 'fee', l: 'Course fee', t: 'text', ph: 'e.g. Free or ₹999' },
      { n: 'eligibility', l: 'Eligibility', t: 'text' },
      { n: 'registration_deadline', l: 'Registration deadline', t: 'datetime' },
      { n: 'details', l: 'Course details / syllabus', t: 'textarea', full: true },
    ],
  },
  internships: {
    label: 'Internship', plural: 'Internships', table: 'internships', appTable: 'internship_applications', fk: 'internship_id',
    deadline: 'deadline', sub: 'company', icon: 'Briefcase',
    why: 'Why are you a good fit for this internship?',
    fields: [
      { n: 'title', l: 'Internship title', t: 'text', full: true, req: true },
      { n: 'company', l: 'Company / organization', t: 'text', card: true },
      { n: 'description', l: 'Description', t: 'textarea', full: true },
      { n: 'responsibilities', l: 'Responsibilities', t: 'textarea', full: true },
      { n: 'skills', l: 'Required skills', t: 'text', full: true, ph: 'e.g. Excel, Communication' },
      { n: 'eligibility', l: 'Eligibility', t: 'text' },
      { n: 'duration', l: 'Duration', t: 'text', ph: 'e.g. 3 months', card: true },
      { n: 'work_mode', l: 'Work mode', t: 'select', o: ['Remote', 'On-site', 'Hybrid'], card: true },
      { n: 'stipend', l: 'Stipend', t: 'text', ph: 'e.g. ₹5,000/month or Unpaid' },
      { n: 'deadline', l: 'Application deadline', t: 'datetime' },
      { n: 'apply_type', l: 'How do people apply?', t: 'select', o: ['nexstep', 'external'], labels: { nexstep: 'Through NexStep', external: 'External link' } },
      { n: 'apply_link', l: 'External link or instructions', t: 'text', full: true, showIf: (f) => f.apply_type === 'external' },
    ],
  },
}

export const STATUS = {
  pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-700 ring-amber-200' },
  under_review: { label: 'Under review', cls: 'bg-sky-50 text-sky-700 ring-sky-200' },
  accepted: { label: 'Accepted', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  rejected: { label: 'Rejected', cls: 'bg-red-50 text-red-700 ring-red-200' },
}

export const isOpen = (type, item) => {
  const d = item[TYPES[type].deadline]
  return item.published && (!d || new Date(d) > new Date())
}
export const fmt = (v, t = 'datetime') => {
  if (!v) return '—'
  const d = new Date(v)
  return t === 'date' ? d.toLocaleDateString(undefined, { dateStyle: 'medium' }) : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}
export const toLocalInput = (iso) => {
  if (!iso) return ''
  const d = new Date(iso); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16)
}
