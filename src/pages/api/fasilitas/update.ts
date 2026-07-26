import type { APIRoute } from 'astro';
import { supabaseServer, getSession } from '../../../lib/supabase';
import { uploadFasilitasGambar } from '../../../lib/storage';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const session = await getSession(cookies);
  if (!session) return redirect('/admin/login');

  const form = await request.formData();
  const id = String(form.get('id') || '');
  const judul = String(form.get('judul') || '').trim();
  const deskripsi = String(form.get('deskripsi') || '').trim();
  const icon = String(form.get('icon') || 'building').trim();
  const urutan = Number(form.get('urutan') || 0);

  if (!id || !judul || !deskripsi) {
    return redirect(`/admin/fasilitas/${id}/edit?error=Judul+dan+deskripsi+wajib+diisi`);
  }

  const client = await supabaseServer(cookies);
  
  // Ambil data existing dulu untuk gambar_url jika tidak diupload yang baru
  const { data: existing } = await client.from('fasilitas').select('gambar_url').eq('id', id).single();
  let gambar_url: string | null = existing?.gambar_url || null;

  const file = form.get('gambar_file');
  if (file instanceof File && file.size > 0) {
    try {
      gambar_url = await uploadFasilitasGambar(client, file);
    } catch (e: any) {
      return redirect(`/admin/fasilitas/${id}/edit?error=${encodeURIComponent('Gagal unggah gambar: ' + e.message)}`);
    }
  }

  const { error } = await client.from('fasilitas').update({
    judul,
    deskripsi,
    icon,
    urutan,
    gambar_url,
  }).eq('id', id);

  if (error) {
    return redirect(`/admin/fasilitas/${id}/edit?error=${encodeURIComponent(error.message)}`);
  }

  return redirect('/admin/fasilitas?sukses=Fasilitas+berhasil+diperbarui');
};
