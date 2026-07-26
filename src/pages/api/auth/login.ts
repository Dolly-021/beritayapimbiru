import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const email = String(form.get('email') || '');
  const password = String(form.get('password') || '');

  const client = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY
  );

  const { data, error } = await client.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    return redirect('/admin/login?error=1');
  }

  // Simpan token di cookie httpOnly supaya tidak bisa diakses lewat JS di browser (XSS-safe).
  cookies.set('sb-access-token', data.session.access_token, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: data.session.expires_in,
  });
  cookies.set('sb-refresh-token', data.session.refresh_token, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 hari
  });

  return redirect('/admin');
};
