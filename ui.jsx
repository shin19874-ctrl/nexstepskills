import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, Loader2, X, Inbox } from 'lucide-react'
import { STATUS } from '../lib/config'

export const Spinner = ({ label = 'Loading…' }) => (
  <div className="flex items-center justify-center gap-2 py-16 text-slate-500"><Loader2 className="h-5 w-5 animate-spin" />{label}</div>
)
export const Empty = ({ title, text, children }) => (
  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-14 text-center">
    <Inbox className="mx-auto h-9 w-9 text-slate-400" />
    <h3 className="mt-3 text-base font-semibold">{title}</h3>
    {text && <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">{text}</p>}
    {children && <div className="mt-4">{children}</div>}
  </div>
)
export const StatusBadge = ({ status }) => {
  const s = STATUS[status] || STATUS.pending
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${s.cls}`}>{s.label}</span>
}
export const ErrorBox = ({ children }) => children ? (
  <div role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 px-3.5 py-3 text-sm text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{children}</div>
) : null

export function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', k); document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', k); document.body.style.overflow = '' }
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy-900/60 p-4 sm:items-center" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" className={`pop my-6 w-full ${wide ? 'max-w-3xl' : 'max-w-xl'} rounded-2xl bg-white shadow-xl`}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

const ToastCtx = createContext(() => {})
export const useToast = () => useContext(ToastCtx)
export function ToastProvider({ children }) {
  const [t, setT] = useState(null)
  const show = useCallback((msg, kind = 'ok') => { setT({ msg, kind }); setTimeout(() => setT(null), 4500) }, [])
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {t && (
        <div role="status" className={`pop fixed bottom-5 left-1/2 z-[60] flex max-w-[92vw] -translate-x-1/2 items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${t.kind === 'ok' ? 'bg-navy-900' : 'bg-red-600'}`}>
          {t.kind === 'ok' ? <CheckCircle2 className="h-4 w-4 text-aqua-400" /> : <AlertCircle className="h-4 w-4" />}{t.msg}
        </div>
      )}
    </ToastCtx.Provider>
  )
}
