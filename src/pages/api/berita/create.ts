import type { APIRoute } from 'astro';
import { supabaseServer, getSession } from '../../../lib/supabase';
import { uploadThumbnail } from '../../../lib/storage';

export const prerender = false;

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const session = await getSession(cookies);
  if (!session) return redirect('/admin/login');

  const form = await request.formData();
  const judul = String(form.get('judul') || '').trim();
  const kategori = String(form.get('kategori') || 'pengumuman');
  const ringkasan = String(form.get('ringkasan') || '').trim();
  const konten = String(form.get('konten') || '').trim();
  const published = form.get('published') === 'on';
  const tanggal = String(form.get('tanggal') || new Date().toISOString().slice(0, 10));

  if (!judul || !ringkasan || !konten) {
    return redirect('/admin/berita/new?error=Semua+field+wajib+diisi');
  }

  const client = await supabaseServer(cookies);

  let thumbnail_url: string | null = null;
  const file = form.get('thumbnail_file');
  if (file instanceof File && file.size > 0) {
    try {
      thumbnail_url = await uploadThumbnail(client, file);
    } catch (e: any) {
      return redirect(`/admin/berita/new?error=${encodeURIComponent('Gagal unggah gambar: ' + e.message)}`);
    }
  }

  const slug = `${slugify(judul)}-${Date.now().toString(36)}`;

  const { error } = await client.from('berita').insert({
    judul,
    slug,
    kategori,
    ringkasan,
    konten,
    thumbnail_url,
    published,
    tanggal,
    created_by: session.user.id,
  });

  if (error) {
    return redirect(`/admin/berita/new?error=${encodeURIComponent(error.message)}`);
  }

  return redirect('/admin?sukses=Berita+ditambahkan');
};
