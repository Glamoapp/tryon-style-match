import { createClient } from 'npm:@supabase/supabase-js@2'
import { sendTemplateEmail } from './send-email.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

function json(data: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function logClient() {
  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) return null
  return createClient(url, key)
}

async function logSend(
  templateName: string,
  recipient: string,
  status: 'sent' | 'suppressed' | 'failed',
  errorMessage?: string,
) {
  const supabase = logClient()
  if (!supabase) return
  const { error } = await supabase.from('email_send_log').insert({
    template_name: templateName,
    recipient_email: recipient,
    status,
    error_message: errorMessage ?? null,
  })
  if (error) {
    console.error('Failed to write email_send_log', {
      code: error.code,
      message: error.message,
    })
  }
}

/**
 * Builds an edge-function handler that sends ONE fixed template.
 * The browser can never choose the template — only the recipient's data.
 */
export function serveTemplateEndpoint(templateName: string) {
  Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }
    if (req.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405)
    }

    let recipientEmail: string
    let idempotencyKey: string | undefined
    let templateData: Record<string, unknown> = {}
    try {
      const body = await req.json()
      recipientEmail = String(body.recipientEmail ?? body.recipient_email ?? '').trim()
      idempotencyKey = body.idempotencyKey ?? body.idempotency_key
      if (body.templateData && typeof body.templateData === 'object') {
        templateData = body.templateData
      }
    } catch {
      return json({ error: 'Invalid JSON in request body' }, 400)
    }

    if (!recipientEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(recipientEmail)) {
      return json({ error: 'A valid recipientEmail is required' }, 400)
    }

    try {
      const result = await sendTemplateEmail(templateName, recipientEmail, {
        templateData,
        idempotencyKey,
      })
      if (!result.sent) {
        await logSend(templateName, recipientEmail, 'suppressed')
        return json({ success: false, reason: 'recipient_suppressed' })
      }
      await logSend(templateName, recipientEmail, 'sent')
      return json({ success: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error('Email send failed', { templateName, message })
      await logSend(templateName, recipientEmail, 'failed', message)
      return json({ error: 'Failed to send email' }, 500)
    }
  })
}
