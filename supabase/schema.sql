-- ============================================================
-- SKEMA DATABASE — Landing Page & Portal Informasi Sekolah
-- Jalankan file ini di Supabase Dashboard > SQL Editor
-- ============================================================

-- 1) Tabel profil pengguna (menyimpan role: admin)
--    Baris di sini dibuat otomatis setiap kali ada user baru
--    lewat trigger di bawah. Semua akun yang terdaftar via
--    Supabase Auth diperlakukan sebagai admin (client/pengunjung
--    publik tidak perlu login sama sekali).
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Admin bisa lihat profil sendiri"
  on public.profiles for select
  using (auth.uid() = id);

-- Trigger: setiap user baru di auth.users otomatis dapat baris profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2) Tabel berita / pengumuman sekolah
create table if not exists public.berita (
  id uuid primary key default gen_random_uuid(),
  judul text not null,
  slug text not null unique,
  kategori text not null check (kategori in ('prestasi', 'pengumuman', 'ekstrakurikuler')),
  ringkasan text not null,
  konten text not null,
  thumbnail_url text,
  published boolean not null default true,
  tanggal date not null default current_date,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.berita enable row level security;

-- Client (publik, tanpa login) hanya boleh membaca berita yang published
create policy "Publik bisa baca berita published"
  on public.berita for select
  using (published = true);

-- Admin (sudah login) boleh baca semua, termasuk draft
create policy "Admin bisa baca semua berita"
  on public.berita for select
  using (auth.role() = 'authenticated');

-- Hanya admin (authenticated) yang boleh tambah/ubah/hapus berita
create policy "Admin bisa tambah berita"
  on public.berita for insert
  with check (auth.role() = 'authenticated');

create policy "Admin bisa ubah berita"
  on public.berita for update
  using (auth.role() = 'authenticated');

create policy "Admin bisa hapus berita"
  on public.berita for delete
  using (auth.role() = 'authenticated');

-- Auto-update kolom updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_berita_updated_at on public.berita;
create trigger trg_berita_updated_at
  before update on public.berita
  for each row execute procedure public.set_updated_at();


-- 3) Tabel pengaturan situs (dikelola admin: judul, alamat, kontak, dll)
create table if not exists public.pengaturan_situs (
  id int primary key default 1 check (id = 1), -- single row settings
  nama_sekolah text not null default 'SMA Cendekia Nusantara',
  tagline text not null default 'Terakreditasi A · Medan',
  alamat text not null default 'Jl. Pendidikan Raya No. 45, Medan, Sumatera Utara 20112',
  whatsapp text not null default '6281234567890',
  telepon text not null default '(061) 123-4567',
  email text not null default 'info@cendekianusantara.sch.id',
  gelombang_ppdb_teks text not null default 'Gelombang 1: 1 Agustus – 15 September 2026',
  link_form_ppdb text not null default '#',
  updated_at timestamptz not null default now()
);

insert into public.pengaturan_situs (id) values (1)
  on conflict (id) do nothing;

alter table public.pengaturan_situs enable row level security;

create policy "Publik bisa baca pengaturan situs"
  on public.pengaturan_situs for select
  using (true);

create policy "Admin bisa ubah pengaturan situs"
  on public.pengaturan_situs for update
  using (auth.role() = 'authenticated');

drop trigger if exists trg_pengaturan_updated_at on public.pengaturan_situs;
create trigger trg_pengaturan_updated_at
  before update on public.pengaturan_situs
  for each row execute procedure public.set_updated_at();


-- 4) (Opsional) Storage bucket untuk thumbnail berita.
--    Jalankan lewat Dashboard > Storage, atau via SQL berikut:
insert into storage.buckets (id, name, public)
values ('berita-images', 'berita-images', true)
on conflict (id) do nothing;

create policy "Publik bisa lihat gambar berita"
  on storage.objects for select
  using (bucket_id = 'berita-images');

create policy "Admin bisa upload gambar berita"
  on storage.objects for insert
  with check (bucket_id = 'berita-images' and auth.role() = 'authenticated');

create policy "Admin bisa hapus gambar berita"
  on storage.objects for delete
  using (bucket_id = 'berita-images' and auth.role() = 'authenticated');


-- 5) Tabel fasilitas sekolah
create table if not exists public.fasilitas (
  id uuid primary key default gen_random_uuid(),
  judul text not null,
  deskripsi text not null,
  gambar_url text,
  icon text default 'building',
  urutan int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fasilitas enable row level security;

create policy "Publik bisa baca fasilitas"
  on public.fasilitas for select
  using (true);

create policy "Admin bisa tambah fasilitas"
  on public.fasilitas for insert
  with check (auth.role() = 'authenticated');

create policy "Admin bisa ubah fasilitas"
  on public.fasilitas for update
  using (auth.role() = 'authenticated');

create policy "Admin bisa hapus fasilitas"
  on public.fasilitas for delete
  using (auth.role() = 'authenticated');

drop trigger if exists trg_fasilitas_updated_at on public.fasilitas;
create trigger trg_fasilitas_updated_at
  before update on public.fasilitas
  for each row execute procedure public.set_updated_at();

-- Storage bucket untuk fasilitas
insert into storage.buckets (id, name, public)
values ('fasilitas-images', 'fasilitas-images', true)
on conflict (id) do nothing;

create policy "Publik bisa lihat gambar fasilitas"
  on storage.objects for select
  using (bucket_id = 'fasilitas-images');

create policy "Admin bisa upload gambar fasilitas"
  on storage.objects for insert
  with check (bucket_id = 'fasilitas-images' and auth.role() = 'authenticated');

create policy "Admin bisa hapus gambar fasilitas"
  on storage.objects for delete
  using (bucket_id = 'fasilitas-images' and auth.role() = 'authenticated');


-- ============================================================
-- CARA MEMBUAT AKUN ADMIN PERTAMA:
-- Buka Supabase Dashboard > Authentication > Users > Add user
-- (isi email & password admin). Baris di tabel `profiles` akan
-- otomatis terbuat lewat trigger di atas.
-- ============================================================

