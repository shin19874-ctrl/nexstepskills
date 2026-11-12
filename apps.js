import { supabase } from './supabase'
import { TYPES } from './config'

// Loads applications from all three tables into one list. RLS decides what the caller may see
// (own rows for users, everything for the admin).
export async function fetchApps(userId) {
  const out = []
  for (const [type, c] of Object.entries(TYPES)) {
    let q = supabase.from(c.appTable).select(`*, ${c.table}(title)`).order('created_at', { ascending: false })
    if (userId) q = q.eq('user_id', userId)
    const { data, error } = await q
    if (error) throw error
    ;(data || []).forEach((a) => out.push({ ...a, type, itemTitle: a[c.table]?.title || '(deleted)' }))
  }
  return out.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}
