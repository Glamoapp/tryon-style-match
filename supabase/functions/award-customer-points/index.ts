import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

// Points tiers based on spend
function calculatePoints(amount: number): number {
  if (amount >= 2000) return 100
  if (amount >= 1000) return 50
  if (amount >= 500) return 20
  return 10
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization') || ''
    const jwt = authHeader.replace('Bearer ', '')
    if (!jwt) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Verify the caller
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    })
    const { data: userData, error: userErr } = await userClient.auth.getUser()
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const userId = userData.user.id

    const body = await req.json().catch(() => ({}))
    const action = body?.action as string
    const admin = createClient(supabaseUrl, serviceKey)

    if (action === 'award') {
      const amount = Number(body?.amount)
      const description = String(body?.description || 'Booking reward')
      const bookingId = body?.bookingId ? String(body.bookingId) : null
      if (!Number.isFinite(amount) || amount < 0 || amount > 100000) {
        return new Response(JSON.stringify({ error: 'Invalid amount' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // If bookingId is provided, ensure it belongs to caller and is completed
      if (bookingId) {
        const { data: booking } = await admin
          .from('bookings')
          .select('id, customer_id, status')
          .eq('id', bookingId)
          .maybeSingle()
        if (!booking || booking.customer_id !== userId) {
          return new Response(JSON.stringify({ error: 'Invalid booking' }), {
            status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
        // Prevent double-awarding for same booking
        const { data: existing } = await admin
          .from('point_transactions')
          .select('id')
          .eq('booking_id', bookingId)
          .eq('transaction_type', 'earned')
          .maybeSingle()
        if (existing) {
          return new Response(JSON.stringify({ ok: true, alreadyAwarded: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
      }

      const points = calculatePoints(amount)
      await admin.from('point_transactions').insert({
        user_id: userId, points, transaction_type: 'earned', description, booking_id: bookingId,
      })
      const { data: current } = await admin
        .from('customer_points')
        .select('total_points, lifetime_points')
        .eq('user_id', userId)
        .maybeSingle()
      const total = (current?.total_points || 0) + points
      const lifetime = (current?.lifetime_points || 0) + points
      if (current) {
        await admin.from('customer_points')
          .update({ total_points: total, lifetime_points: lifetime, updated_at: new Date().toISOString() })
          .eq('user_id', userId)
      } else {
        await admin.from('customer_points').insert({
          user_id: userId, total_points: total, lifetime_points: lifetime,
        })
      }
      return new Response(JSON.stringify({ ok: true, points, total }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'redeem') {
      const points = Number(body?.points)
      const description = String(body?.description || 'Redemption')
      if (!Number.isInteger(points) || points <= 0 || points > 100000) {
        return new Response(JSON.stringify({ error: 'Invalid points' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      const { data: current } = await admin
        .from('customer_points')
        .select('total_points, lifetime_points')
        .eq('user_id', userId)
        .maybeSingle()
      if (!current || current.total_points < points) {
        return new Response(JSON.stringify({ error: 'Insufficient balance' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      await admin.from('point_transactions').insert({
        user_id: userId, points: -points, transaction_type: 'redeemed', description,
      })
      const newTotal = current.total_points - points
      await admin.from('customer_points')
        .update({ total_points: newTotal, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
      return new Response(JSON.stringify({ ok: true, total: newTotal }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'ensure_balance') {
      const { data: existing } = await admin.from('customer_points')
        .select('id').eq('user_id', userId).maybeSingle()
      if (!existing) {
        await admin.from('customer_points').insert({
          user_id: userId, total_points: 0, lifetime_points: 0,
        })
      }
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
