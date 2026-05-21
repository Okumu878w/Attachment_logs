import { supabase } from './supabase'

const PAYSTACK_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY
const WEEKLY_AMOUNT_KES = 40

export function loadPaystack() {
  return new Promise((resolve) => {
    if (window.PaystackPop) { resolve(); return }
    const s = document.createElement('script')
    s.src = 'https://js.paystack.co/v1/inline.js'
    s.onload = resolve
    document.body.appendChild(s)
  })
}

export async function payForWeek({ userId, email, week, onSuccess, onClose }) {
  await loadPaystack()
  const ref = `attachlog_${userId}_w${week}_${Date.now()}`

  console.log('Setting up Paystack with:', { key: PAYSTACK_KEY, email, week, ref })

 const handler = window.PaystackPop.setup({
  key: PAYSTACK_KEY,
  email,
  amount: WEEKLY_AMOUNT_KES * 80,
  currency: 'KES',
  ref,
  metadata: { user_id: userId, week },
  callback: function(response) {          // ← remove async, use regular function
    console.log('✅ callback fired:', response)
    supabase.from('payments').upsert({
      user_id: userId,
      week,
      reference: response.reference,
      amount: WEEKLY_AMOUNT_KES,
      currency: 'KES',
      status: 'success',
      paid_at: new Date().toISOString(),
    }, { onConflict: 'user_id,week' })
    .then(({ data, error }) => {
      console.log('Supabase result:', data, 'Error:', error)
      onSuccess && onSuccess(response)
    })
  },
  onClose: function() {                   // ← regular function here too
    console.log('❌ Payment closed')
    onClose && onClose()
  }
})

  console.log('Handler created:', handler)
  handler.openIframe()
}

export async function checkPayment(userId, week) {
  const { data } = await supabase
    .from('payments')
    .select('id')
    .eq('user_id', userId)
    .eq('week', week)
    .eq('status', 'success')
    .maybeSingle()
  return !!data
}

export async function getUserPayments(userId) {
  const { data } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .order('week', { ascending: true })
  return data || []
}
