function readNamedKey(envName,fallbackEnv){const raw=Deno.env.get(envName);if(raw){try{const parsed=JSON.parse(raw);if(parsed?.default)return parsed.default}catch{}}return Deno.env.get(fallbackEnv)||''}
const getPublishableKey=()=>readNamedKey('SUPABASE_PUBLISHABLE_KEYS','SUPABASE_ANON_KEY');
const getSecretKey=()=>readNamedKey('SUPABASE_SECRET_KEYS','SUPABASE_SERVICE_ROLE_KEY');
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const allowedOrigins = new Set(
  (Deno.env.get('SITE_ORIGINS') || 'http://localhost:5173')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
)

const corsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin && allowedOrigins.has(origin) ? origin : 'null',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin'
})
const json = (body: unknown, status = 200, origin: string | null = null) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin')
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(origin) })
  if (origin && !allowedOrigins.has(origin)) return json({ error: 'Origin not allowed.' }, 403, origin)

  try {
    const authHeader = req.headers.get('Authorization') || ''
    const anon = getPublishableKey()
    const service = getSecretKey()
    const url = Deno.env.get('SUPABASE_URL')
    if (!anon || !service || !url) return json({ error: 'Server configuration is incomplete.' }, 500, origin)

    const userClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } })
    const adminClient = createClient(url, service)
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return json({ error: 'Authentication required.' }, 401, origin)

    const { data: caller } = await adminClient.from('jyc_admins').select('role,is_active').eq('user_id', user.id).maybeSingle()
    if (!caller?.is_active) return json({ error: 'Administrator access is inactive.' }, 403, origin)

    const contentLength = Number(req.headers.get('Content-Length') || 0)
    if (contentLength > 20000) return json({ error: 'Request is too large.' }, 413, origin)
    const raw = await req.text()
    if (new TextEncoder().encode(raw).byteLength > 20000) return json({ error: 'Request is too large.' }, 413, origin)
    let body: any
    try { body = JSON.parse(raw) } catch { return json({ error: 'Invalid JSON request.' }, 400, origin) }

    if (body.action === 'health') {
      const { error: dbError } = await adminClient.from('jyc_admins').select('user_id').limit(1)
      return json({ ok: !dbError, database: dbError ? 'error' : 'ok', service: 'admin-management' }, dbError ? 500 : 200, origin)
    }

    if (caller.role !== 'super_admin') return json({ error: 'Only Super Admin can manage administrators.' }, 403, origin)
    if (body.action === 'list') {
      const { data, error } = await adminClient.from('jyc_admins').select('user_id,role,display_name,is_active,club_id').order('display_name')
      if (error) throw error
      const ids = (data || []).map((x: any) => x.user_id)
      const emails = new Map<string, string>()
      for (const id of ids) {
        const { data: u } = await adminClient.auth.admin.getUserById(id)
        if (u?.user?.email) emails.set(id, u.user.email)
      }
      return json({ admins: (data || []).map((x: any) => ({ ...x, email: emails.get(x.user_id) || '' })) }, 200, origin)
    }

    if (body.action === 'invite') {
      const email = String(body.email || '').trim().toLowerCase()
      const role = String(body.role || 'jyc_admin')
      const club_id = body.club_id ? String(body.club_id) : null
      if (!email || !email.includes('@')) return json({ error: 'Valid email is required.' }, 400, origin)
      if (!['super_admin','jyc_admin','clubs_admin','events_admin','gallery_admin','content_admin','club_admin'].includes(role)) return json({ error: 'Invalid role.' }, 400, origin)
      if (role === 'club_admin' && !club_id) return json({ error: 'Club Admin requires a club ID.' }, 400, origin)
      const { data: invited, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, { data: { invited_by_jyc: true } })
      if (inviteError) throw inviteError
      const { error: upsertError } = await adminClient.from('jyc_admins').upsert({ user_id: invited.user.id, role, club_id, is_active: true, display_name: email.split('@')[0] }, { onConflict: 'user_id' })
      if (upsertError) throw upsertError
      return json({ ok: true, user_id: invited.user.id }, 200, origin)
    }

    if (body.action === 'update') {
      const user_id = String(body.user_id || '')
      const role = String(body.role || 'jyc_admin')
      const active = Boolean(body.is_active)
      if (!user_id || !['super_admin','jyc_admin','clubs_admin','events_admin','gallery_admin','content_admin','club_admin'].includes(role)) return json({ error: 'Invalid administrator update.' }, 400, origin)

      if (user_id === user.id && (role !== 'super_admin' || !active)) {
        return json({ error: 'For safety, the Super Admin account cannot remove its own Super Admin access.' }, 400, origin)
      }

      const { count: superCount } = await adminClient.from('jyc_admins').select('user_id', { count: 'exact', head: true }).eq('role', 'super_admin').eq('is_active', true)
      const { data: target } = await adminClient.from('jyc_admins').select('role,is_active').eq('user_id', user_id).maybeSingle()
      if (target?.role === 'super_admin' && target.is_active && (role !== 'super_admin' || !active) && (superCount || 0) <= 1) {
        return json({ error: 'The last active Super Admin cannot be removed.' }, 400, origin)
      }

      const { error } = await adminClient.from('jyc_admins').update({
        role,
        is_active: active,
        club_id: role === 'club_admin' ? (body.club_id || null) : null
      }).eq('user_id', user_id)
      if (error) throw error
      return json({ ok: true }, 200, origin)
    }

    return json({ error: 'Unknown action.' }, 400, origin)
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Server error.' }, 500, origin)
  }
})
