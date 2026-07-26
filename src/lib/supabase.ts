import { createClient } from '@supabase/supabase-js';
import type { AstroCookies } from 'astro';

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

/**
 * Client publik — dipakai di halaman client (landing page) untuk
 * membaca data yang boleh diakses tanpa login (berita published,
 * pengaturan situs). Aman dipakai di browser karena hanya pakai
 * anon key + RLS yang membatasi apa yang bisa dibaca/ditulis.
 */
export const supabase = createClient(url, anonKey);

/**
 * Client untuk konteks server (dipakai di halaman .astro dan API
 * routes bagian admin). Membawa token akses dari cookie sesi agar
 * query berjalan sebagai user yang sedang login (auth.role() =
 * 'authenticated'), sehingga RLS pada tabel `berita` mengizinkan
 * insert/update/delete.
 */
export async function supabaseServer(cookies: AstroCookies) {
  const accessToken = cookies.get('sb-access-token')?.value;
  const refreshToken = cookies.get('sb-refresh-token')?.value;

  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (accessToken && refreshToken) {
    // Set token supaya request berikutnya dianggap "authenticated" oleh RLS.
    await client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  return client;
}

/** Ambil session saat ini dari cookie (dipakai untuk cek login di admin pages). */
export async function getSession(cookies: AstroCookies) {
  const accessToken = cookies.get('sb-access-token')?.value;
  const refreshToken = cookies.get('sb-refresh-token')?.value;
  if (!accessToken || !refreshToken) return null;

  const client = createClient(url, anonKey);
  const { data, error } = await client.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (error) return null;
  return data.session;
}
