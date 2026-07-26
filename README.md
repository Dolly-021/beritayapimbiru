# Portal Sekolah — Astro 

Landing page profil & berita sekolah, dengan 2 peran pengguna:
- **Client** (pengunjung cpublik) — tidak perlu login, hanya bisa melihat halaman utama dan berita yang sudah dipublikasikan.
- **Admin** — login di `/admin/login`, bisa menambah/mengubah/menghapus berita dan mengubah pengaturan situs (kontak, info PPDB, dll) di `/admin`.

## Struktur Peran

| Peran  | Akses                                                             |
|--------|--------------------------------------------------------------------|
| Client | Baca halaman utama & berita published — tanpa login                |
| Admin  | Login via Supabase Auth → kelola berita (CRUD) & pengaturan situs  |

Proteksi akses admin ditangani di `src/middleware.ts` (redirect ke `/admin/login` jika belum login) **dan** di level database lewat Row Level Security di `supabase/schema.sql` — jadi tetap aman walau seseorang mencoba memanggil API secara langsung.

## Fitur Tambahan

- **Upload gambar thumbnail**: di form tambah/ubah berita, admin tinggal pilih file gambar (JPG/PNG/WebP) — otomatis terunggah ke Supabase Storage bucket `berita-images` dan URL publiknya disimpan ke database. Tidak perlu upload manual/tempel URL lagi.
- **Halaman detail berita**: setiap kartu berita di halaman utama kini bisa diklik dan membuka halaman detail lengkap di `/berita/<slug>`, lengkap dengan gambar besar, isi berita penuh, tombol bagikan ke WhatsApp/Facebook, dan rekomendasi 3 berita lain. Hanya berita yang `published = true` yang bisa diakses publik.
