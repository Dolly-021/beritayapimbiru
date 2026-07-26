import type { SupabaseClient } from '@supabase/supabase-js';

const BUCKET = 'berita-images';

/**
 * Upload file gambar thumbnail ke bucket "berita-images".
 * Mengembalikan public URL, atau null kalau tidak ada file yang dipilih.
 * Melempar error kalau upload gagal (misalnya format/ukuran tidak valid).
 */
export async function uploadThumbnail(client: SupabaseClient, file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await client.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || 'image/jpeg',
  });

  if (error) throw error;

  const { data } = client.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadFasilitasGambar(client: SupabaseClient, file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `fasilitas-${crypto.randomUUID()}.${ext}`;

  const { error } = await client.storage.from('fasilitas-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || 'image/jpeg',
  });

  if (error) throw error;

  const { data } = client.storage.from('fasilitas-images').getPublicUrl(path);
  return data.publicUrl;
}

