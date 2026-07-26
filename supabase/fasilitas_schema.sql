-- ============================================================
-- SKEMA TAMBAHAN FASILITAS (Jalankan ini jika database utama sudah ada)
-- ============================================================

-- 1) Tabel fasilitas sekolah
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

drop policy if exists "Publik bisa baca fasilitas" on public.fasilitas;
create policy "Publik bisa baca fasilitas"
  on public.fasilitas for select
  using (true);

drop policy if exists "Admin bisa tambah fasilitas" on public.fasilitas;
create policy "Admin bisa tambah fasilitas"
  on public.fasilitas for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "Admin bisa ubah fasilitas" on public.fasilitas;
create policy "Admin bisa ubah fasilitas"
  on public.fasilitas for update
  using (auth.role() = 'authenticated');

drop policy if exists "Admin bisa hapus fasilitas" on public.fasilitas;
create policy "Admin bisa hapus fasilitas"
  on public.fasilitas for delete
  using (auth.role() = 'authenticated');

drop trigger if exists trg_fasilitas_updated_at on public.fasilitas;
create trigger trg_fasilitas_updated_at
  before update on public.fasilitas
  for each row execute procedure public.set_updated_at();

-- 2) Storage bucket untuk fasilitas
insert into storage.buckets (id, name, public)
values ('fasilitas-images', 'fasilitas-images', true)
on conflict (id) do nothing;

drop policy if exists "Publik bisa lihat gambar fasilitas" on storage.objects;
create policy "Publik bisa lihat gambar fasilitas"
  on storage.objects for select
  using (bucket_id = 'fasilitas-images');

drop policy if exists "Admin bisa upload gambar fasilitas" on storage.objects;
create policy "Admin bisa upload gambar fasilitas"
  on storage.objects for insert
  with check (bucket_id = 'fasilitas-images' and auth.role() = 'authenticated');

drop policy if exists "Admin bisa hapus gambar fasilitas" on storage.objects;
create policy "Admin bisa hapus gambar fasilitas"
  on storage.objects for delete
  using (bucket_id = 'fasilitas-images' and auth.role() = 'authenticated');
