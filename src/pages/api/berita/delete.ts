import type { APIRoute } from 'astro';
import { supabaseServer, getSession } from '../../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const session = await getSession(cookies);
  if (!session) return redirect('/admin/login');

  const form = await request.formData();
  const id = String(form.get('id') || '');
  if (!id) return redirect('/admin');

  const client = await supabaseServer(cookies);
  await client.from('berita').delete().eq('id', id);

  return redirect('/admin?sukses=Berita+dihapus');
};
