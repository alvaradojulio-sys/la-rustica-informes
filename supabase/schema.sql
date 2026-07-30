-- ============================================================
-- La Rústica — schema de Supabase
-- Ejecutar en: Supabase → SQL Editor → New query → pegar todo → Run
-- ============================================================

create table if not exists public.visitas (
  id text primary key,
  fecha date not null,
  hora time not null,
  cliente text not null default 'Cliente sin identificar',
  motivo text,
  lat double precision,
  lon double precision,
  maps_url text,
  transcripcion text,
  informe text,
  estado text not null default 'borrador',
  fotos_urls text[] default '{}',
  creado timestamptz not null default now()
);

alter table public.visitas enable row level security;

-- Nota de seguridad: estas políticas dejan que cualquiera con la URL + anon key
-- (ambas públicas, van embebidas en el frontend) pueda leer y escribir visitas.
-- Es el mismo nivel de confianza que tenía el Apps Script "cualquier usuario".
-- Si más adelante querés restringirlo, cambiá "using (true)" por una condición
-- real de autenticación (Supabase Auth) y agregá login a la app.
create policy "lectura publica de visitas" on public.visitas
  for select using (true);
create policy "insercion publica de visitas" on public.visitas
  for insert with check (true);
create policy "actualizacion publica de visitas" on public.visitas
  for update using (true);

-- Bucket de fotos
insert into storage.buckets (id, name, public)
values ('fotos-informes', 'fotos-informes', true)
on conflict (id) do nothing;

create policy "lectura publica de fotos" on storage.objects
  for select using (bucket_id = 'fotos-informes');
create policy "subida publica de fotos" on storage.objects
  for insert with check (bucket_id = 'fotos-informes');
