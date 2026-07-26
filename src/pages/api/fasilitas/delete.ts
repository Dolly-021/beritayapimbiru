import type { APIRoute } from 'astro';
import { supabaseServer, getSession } from '../../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const session = await getSession(cookies);
  if (!session) return redirect('/admin/login');

  const form = await request.formData();
  const id = String(form.get('id') || '');

  if (!id) {
    return redirect('/admin/fasilitas?error=ID+fasilitas+tidak+valid');
  }

  const client = await supabaseServer(cookies);
  const { error } = await client.from('fasilitas').delete().eq('id', id);

  if (error) {
    return redirect(`/admin/fasilitas?error=${encodeURIComponent(error.message)}`);
  }

  return redirect('/admin/fasilitas?sukses=Fasilitas+berhasil+dihapus');
};
