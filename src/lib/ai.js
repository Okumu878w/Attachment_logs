import { supabase } from './supabase'

/**
 * Calls the Supabase Edge Function `expand-activity` which uses Claude AI
 * to expand a short activity note into a ~40-word professional paragraph.
 */
export async function expandActivity(shortText) {
  const { data, error } = await supabase.functions.invoke('expand-activity', {
    body: { activity: shortText }
  })
  if (error) throw new Error(error.message)
  return data.expanded
}
