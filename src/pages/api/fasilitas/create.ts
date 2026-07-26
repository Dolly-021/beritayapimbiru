import type { APIRoute } from 'astro';
import { supabaseServer, getSession } from '../../../lib/supabase';
import { uploadFasilitasGambar } from '../../../lib/storage';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const session = await getSession(cookies);
  if (!session) return redirect('/admin/login');

  const form = await request.formData();
  const judul = String(form.get('judul') || '').trim();
  const deskripsi = String(form.get('deskripsi') || '').trim();
  const icon = String(form.get('icon') || 'building').trim();
  const urutan = Number(form.get('urutan') || 0);

  if (!judul || !deskripsi) {
    return redirect('/admin/fasilitas/new?error=Judul+dan+deskripsi+wajib+diisi');
  }

  const client = await supabaseServer(cookies);
  let gambar_url: string | null = null;

  const file = form.get('gambar_file');
  if (file instanceof File && file.size > 0) {
    try {
      gambar_url = await uploadFasilitasGambar(client, file);
    } catch (e: any) {
      return redirect(`/admin/fasilitas/new?error=${encodeURIComponent('Gagal unggah gambar: ' + e.message)}`);
    }
  }

  const { error } = await client.from('fasilitas').insert({
    judul,
    deskripsi,
    icon,
    urutan,
    gambar_url,
  });

  if (error) {
    return redirect(`/admin/fasilitas/new?error=${encodeURIComponent(error.message)}`);
  }

  return redirect('/admin/fasilitas?sukses=Fasilitas+berhasil+ditambahkan');
};
