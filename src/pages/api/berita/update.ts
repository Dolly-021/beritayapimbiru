import type { APIRoute } from 'astro';
import { supabaseServer, getSession } from '../../../lib/supabase';
import { uploadThumbnail } from '../../../lib/storage';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const session = await getSession(cookies);
  if (!session) return redirect('/admin/login');

  const form = await request.formData();
  const id = String(form.get('id') || '');
  const judul = String(form.get('judul') || '').trim();
  const kategori = String(form.get('kategori') || 'pengumuman');
  const ringkasan = String(form.get('ringkasan') || '').trim();
  const konten = String(form.get('konten') || '').trim();
  const published = form.get('published') === 'on';
  const tanggal = String(form.get('tanggal') || '');

  if (!id) return redirect('/admin');

  const client = await supabaseServer(cookies);

  // Kalau admin pilih file baru, upload & pakai itu. Kalau tidak, pertahankan gambar lama.
  let thumbnail_url = String(form.get('thumbnail_url_lama') || '').trim() || null;
  const file = form.get('thumbnail_file');
  if (file instanceof File && file.size > 0) {
    try {
      thumbnail_url = await uploadThumbnail(client, file);
    } catch (e: any) {
      return redirect(`/admin/berita/${id}/edit?error=${encodeURIComponent('Gagal unggah gambar: ' + e.message)}`);
    }
  }

  const { error } = await client
    .from('berita')
    .update({ judul, kategori, ringkasan, konten, thumbnail_url, published, tanggal })
    .eq('id', id);

  if (error) {
    return redirect(`/admin/berita/${id}/edit?error=${encodeURIComponent(error.message)}`);
  }

  return redirect('/admin?sukses=Berita+diperbarui');
};
