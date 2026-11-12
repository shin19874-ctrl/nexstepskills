import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
export const configured = Boolean(url && key)
// Only the public "anon" key is used here. Security is enforced by Row Level Security in the database.
export const supabase = createClient(url || 'https://placeholder.supabase.co', key || 'placeholder')

export const siteUrl = () => window.location.origin + import.meta.env.BASE_URL
export const asset = (p) => import.meta.env.BASE_URL + p

// Asks the "send-email" function to send a branded email. Returns true/false; never throws.
export async function sendEmail(type, table, id) {
  try {
    const { error } = await supabase.functions.invoke('send-email', { body: { type, table, id } })
    return !error
  } catch { return false }
}
