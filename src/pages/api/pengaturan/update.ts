import type { APIRoute } from 'astro';
import { supabaseServer, getSession } from '../../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const session = await getSession(cookies);
  if (!session) return redirect('/admin/login');

  const form = await request.formData();
  const payload = {
    nama_sekolah: String(form.get('nama_sekolah') || ''),
    tagline: String(form.get('tagline') || ''),
    alamat: String(form.get('alamat') || ''),
    whatsapp: String(form.get('whatsapp') || ''),
    telepon: String(form.get('telepon') || ''),
    email: String(form.get('email') || ''),
    gelombang_ppdb_teks: String(form.get('gelombang_ppdb_teks') || ''),
    link_form_ppdb: String(form.get('link_form_ppdb') || '#'),
  };

  const client = await supabaseServer(cookies);
  const { error } = await client.from('pengaturan_situs').update(payload).eq('id', 1);

  if (error) {
    return redirect(`/admin/pengaturan?error=${encodeURIComponent(error.message)}`);
  }
  return redirect('/admin/pengaturan?sukses=Pengaturan+disimpan');
};
