# Portal Sekolah — Astro + Supabase

Landing page profil & berita sekolah, dengan 2 peran pengguna:
- **Client** (pengunjung publik) — tidak perlu login, hanya bisa melihat halaman utama dan berita yang sudah dipublikasikan.
- **Admin** — login di `/admin/login`, bisa menambah/mengubah/menghapus berita dan mengubah pengaturan situs (kontak, info PPDB, dll) di `/admin`.

## 1. Setup Supabase

1. Buat project baru di https://supabase.com.
2. Buka **SQL Editor**, jalankan seluruh isi file `supabase/schema.sql`. Ini akan membuat:
   - tabel `berita` (dengan Row Level Security: publik hanya bisa baca yang `published = true`, hanya admin yang login yang bisa tambah/ubah/hapus)
   - tabel `pengaturan_situs` (info kontak, nama sekolah, dll)
   - tabel `profiles` (menandai user yang login sebagai admin)
   - storage bucket `berita-images` untuk upload thumbnail
3. Buat akun admin pertama: **Authentication > Users > Add user**, isi email & password. (Client/pengunjung publik tidak butuh akun sama sekali.)
4. Salin **Project URL** dan **anon public key** dari **Project Settings > API**.

## 2. Setup Project

```bash
npm install
cp .env.example .env
```

Isi `.env` dengan nilai dari Supabase:

```
PUBLIC_SUPABASE_URL=...
PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # opsional, untuk kebutuhan admin lanjutan
```

## 3. Jalankan

```bash
npm run dev
```

- Halaman utama (client): `http://localhost:4321/`
- Login admin: `http://localhost:4321/admin/login`
- Dashboard admin: `http://localhost:4321/admin`

## 4. Build untuk produksi

```bash
npm run build
npm run preview
```

Karena ada halaman `/admin` yang butuh cek sesi login di server, project ini pakai **SSR** (`output: 'server'` dengan adapter `@astrojs/node`). Saat deploy, jalankan `node ./dist/server/entry.mjs` atau gunakan platform yang mendukung Node/Astro SSR (Vercel, Netlify, Railway, VPS, dll — tinggal ganti adapter di `astro.config.mjs` sesuai platform tujuan).

## Struktur Peran

| Peran  | Akses                                                             |
|--------|--------------------------------------------------------------------|
| Client | Baca halaman utama & berita published — tanpa login                |
| Admin  | Login via Supabase Auth → kelola berita (CRUD) & pengaturan situs  |

Proteksi akses admin ditangani di `src/middleware.ts` (redirect ke `/admin/login` jika belum login) **dan** di level database lewat Row Level Security di `supabase/schema.sql` — jadi tetap aman walau seseorang mencoba memanggil API secara langsung.

## Fitur Tambahan

- **Upload gambar thumbnail**: di form tambah/ubah berita, admin tinggal pilih file gambar (JPG/PNG/WebP) — otomatis terunggah ke Supabase Storage bucket `berita-images` dan URL publiknya disimpan ke database. Tidak perlu upload manual/tempel URL lagi.
- **Halaman detail berita**: setiap kartu berita di halaman utama kini bisa diklik dan membuka halaman detail lengkap di `/berita/<slug>`, lengkap dengan gambar besar, isi berita penuh, tombol bagikan ke WhatsApp/Facebook, dan rekomendasi 3 berita lain. Hanya berita yang `published = true` yang bisa diakses publik.
