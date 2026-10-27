begin;

-- 1. Table des utilisateurs administrateurs
create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'editor')) default 'editor',
  full_name text,
  created_at timestamptz not null default now(),
  last_sign_in_at timestamptz
);

create index if not exists admin_users_email_idx on public.admin_users (email);

alter table public.admin_users enable row level security;

-- Fonctions utilitaires SECURITY DEFINER
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_admin_or_editor()
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users
    where id = auth.uid() and role in ('admin', 'editor')
  );
$$;

create or replace function public.current_admin_role()
returns text
language sql
security definer
set search_path = ''
as $$
  select coalesce(
    (select role from public.admin_users where id = auth.uid()),
    null
  );
$$;

create or replace function public.get_current_admin()
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', u.id,
    'email', u.email,
    'role', u.role,
    'full_name', u.full_name,
    'created_at', u.created_at,
    'last_sign_in_at', u.last_sign_in_at
  )
  from public.admin_users u
  where u.id = auth.uid();
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

revoke all on function public.is_admin_or_editor() from public;
grant execute on function public.is_admin_or_editor() to anon, authenticated;

revoke all on function public.current_admin_role() from public;
grant execute on function public.current_admin_role() to anon, authenticated;

revoke all on function public.get_current_admin() from public;
grant execute on function public.get_current_admin() to authenticated;

-- Politiques RLS pour admin_users
drop policy if exists "Admins can view all admin users" on public.admin_users;
create policy "Admins can view all admin users"
  on public.admin_users for select
  to authenticated
  using (public.is_admin_or_editor());

drop policy if exists "Admins can manage admin users" on public.admin_users;
create policy "Admins can manage admin users"
  on public.admin_users for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 2. Évolution de public.club_applications
alter table public.club_applications
  add column if not exists status text not null default 'new' check (status in ('new', 'reviewing', 'accepted', 'rejected')),
  add column if not exists admin_notes text default '',
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz;

create index if not exists club_applications_status_idx on public.club_applications (status);
create index if not exists club_applications_created_idx on public.club_applications (created_at desc);

alter table public.club_applications enable row level security;

-- Révoquer tout accès direct pour les utilisateurs anonymes (l'insertion publique passe uniquement par submit_club_application)
revoke all on table public.club_applications from anon;

drop policy if exists "Admins can view applications" on public.club_applications;
create policy "Admins can view applications"
  on public.club_applications for select
  to authenticated
  using (public.is_admin_or_editor());

drop policy if exists "Admins can update applications" on public.club_applications;
create policy "Admins can update applications"
  on public.club_applications for update
  to authenticated
  using (public.is_admin_or_editor())
  with check (public.is_admin_or_editor());

drop policy if exists "SuperAdmins can delete applications" on public.club_applications;
create policy "SuperAdmins can delete applications"
  on public.club_applications for delete
  to authenticated
  using (public.is_admin());

-- 3. Table des départements
create table if not exists public.departments (
  id text primary key,
  act text not null,
  title text not null,
  color text not null,
  accent text not null,
  copy text not null,
  chips jsonb not null default '[]'::jsonb,
  visual text not null default 'technical',
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.departments enable row level security;

drop policy if exists "Public can view departments" on public.departments;
create policy "Public can view departments"
  on public.departments for select
  to public
  using (true);

drop policy if exists "Admins can manage departments" on public.departments;
create policy "Admins can manage departments"
  on public.departments for all
  to authenticated
  using (public.is_admin_or_editor())
  with check (public.is_admin_or_editor());

-- 4. Table des membres de l'équipe (Bureau)
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  department_id text not null,
  color text not null default '#4285f4',
  image_url text,
  initials text not null,
  featured boolean not null default false,
  linkedin_url text default '',
  email text default '',
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists team_members_dept_idx on public.team_members (department_id, display_order);

alter table public.team_members enable row level security;

drop policy if exists "Public can view team members" on public.team_members;
create policy "Public can view team members"
  on public.team_members for select
  to public
  using (true);

drop policy if exists "Admins can manage team members" on public.team_members;
create policy "Admins can manage team members"
  on public.team_members for all
  to authenticated
  using (public.is_admin_or_editor())
  with check (public.is_admin_or_editor());

-- 5. Table des événements
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'upcoming' check (type in ('upcoming', 'past')),
  title text not null,
  tag text not null default 'Workshop',
  desc_text text not null,
  event_date timestamptz,
  location text default 'ISITCom',
  art text not null default '//',
  color text not null default '#a8c7fa',
  image_url text,
  registration_link text default '',
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_type_order_idx on public.events (type, display_order);

alter table public.events enable row level security;

drop policy if exists "Public can view events" on public.events;
create policy "Public can view events"
  on public.events for select
  to public
  using (true);

drop policy if exists "Admins can manage events" on public.events;
create policy "Admins can manage events"
  on public.events for all
  to authenticated
  using (public.is_admin_or_editor())
  with check (public.is_admin_or_editor());

-- 6. Table de la galerie d'images
create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  alt text not null,
  image_url text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists gallery_order_idx on public.gallery_images (display_order);

alter table public.gallery_images enable row level security;

drop policy if exists "Public can view gallery" on public.gallery_images;
create policy "Public can view gallery"
  on public.gallery_images for select
  to public
  using (true);

drop policy if exists "Admins can manage gallery" on public.gallery_images;
create policy "Admins can manage gallery"
  on public.gallery_images for all
  to authenticated
  using (public.is_admin_or_editor())
  with check (public.is_admin_or_editor());

-- 7. Table des compteurs statistiques
create table if not exists public.site_stats (
  id text primary key,
  value integer not null,
  suffix text not null default '+',
  label text not null,
  display_order integer not null default 0
);

alter table public.site_stats enable row level security;

drop policy if exists "Public can view site stats" on public.site_stats;
create policy "Public can view site stats"
  on public.site_stats for select
  to public
  using (true);

drop policy if exists "Admins can manage site stats" on public.site_stats;
create policy "Admins can manage site stats"
  on public.site_stats for all
  to authenticated
  using (public.is_admin_or_editor())
  with check (public.is_admin_or_editor());

-- 8. Table des paramètres généraux du site
create table if not exists public.site_settings (
  id text primary key default 'current',
  applications_open boolean not null default true,
  applications_closed_message text default 'Applications are currently closed. Follow our social channels to know when the next cycle opens!',
  contact_email text default 'hello@isitcomgoogleclub.tn',
  instagram_url text default 'https://www.instagram.com/isitcomgoogleclub2/',
  linkedin_url text default 'https://www.linkedin.com/company/isitcom-google-club/',
  facebook_url text default '',
  mission_text text default 'We bring curious students together to learn practical skills, share brave ideas, and create projects that make campus life more connected.',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.site_settings enable row level security;

drop policy if exists "Public can view site settings" on public.site_settings;
create policy "Public can view site settings"
  on public.site_settings for select
  to public
  using (true);

drop policy if exists "Admins can manage site settings" on public.site_settings;
create policy "Admins can manage site settings"
  on public.site_settings for all
  to authenticated
  using (public.is_admin_or_editor())
  with check (public.is_admin_or_editor());

-- 9. Journal d'audit pour les actions d'administration
create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  user_email text,
  action text not null,
  target_table text not null,
  target_id text,
  details jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_created_idx on public.audit_log (created_at desc);

alter table public.audit_log enable row level security;

drop policy if exists "Admins can view audit log" on public.audit_log;
create policy "Admins can view audit log"
  on public.audit_log for select
  to authenticated
  using (public.is_admin_or_editor());

drop policy if exists "Admins can insert audit log" on public.audit_log;
create policy "Admins can insert audit log"
  on public.audit_log for insert
  to authenticated
  with check (public.is_admin_or_editor());

-- Fonction d'aide pour consigner un log d'audit
create or replace function public.log_admin_action(
  p_action text,
  p_target_table text,
  p_target_id text default null,
  p_details jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_email text;
begin
  select email into v_user_email from auth.users where id = auth.uid();
  insert into public.audit_log (user_id, user_email, action, target_table, target_id, details)
  values (auth.uid(), v_user_email, p_action, p_target_table, p_target_id, p_details);
end;
$$;

revoke all on function public.log_admin_action(text, text, text, jsonb) from public;
grant execute on function public.log_admin_action(text, text, text, jsonb) to authenticated;

-- 10. RPC pour les KPIs du dashboard
create or replace function public.get_admin_dashboard_kpis()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  total_apps integer;
  new_apps integer;
  accepted_apps integer;
  reviewing_apps integer;
  rejected_apps integer;
  upcoming_events_count integer;
  team_count integer;
  daily_trend jsonb;
  dept_distribution jsonb;
begin
  if not public.is_admin_or_editor() then
    raise exception 'Unauthorized';
  end if;

  select count(*) into total_apps from public.club_applications;
  select count(*) into new_apps from public.club_applications where status = 'new';
  select count(*) into accepted_apps from public.club_applications where status = 'accepted';
  select count(*) into reviewing_apps from public.club_applications where status = 'reviewing';
  select count(*) into rejected_apps from public.club_applications where status = 'rejected';

  select count(*) into upcoming_events_count from public.events where type = 'upcoming';
  select count(*) into team_count from public.team_members;

  -- Tendance des 30 derniers jours
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'date', d.day::text,
        'count', coalesce(c.cnt, 0)
      ) order by d.day asc
    ),
    '[]'::jsonb
  ) into daily_trend
  from (
    select generate_series(
      (current_date - interval '29 days')::date,
      current_date,
      interval '1 day'
    )::date as day
  ) d
  left join (
    select (created_at at time zone 'UTC')::date as day, count(*) as cnt
    from public.club_applications
    where created_at >= now() - interval '30 days'
    group by 1
  ) c on d.day = c.day;

  -- Répartition par département souhaité
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'department', coalesce(department, 'Unspecified'),
        'count', cnt
      ) order by cnt desc
    ),
    '[]'::jsonb
  ) into dept_distribution
  from (
    select department, count(*) as cnt
    from public.club_applications
    group by department
  ) dist;

  return jsonb_build_object(
    'total_applications', total_apps,
    'new_applications', new_apps,
    'accepted_applications', accepted_apps,
    'reviewing_applications', reviewing_apps,
    'rejected_applications', rejected_apps,
    'acceptance_rate', case when total_apps > 0 then round((accepted_apps::numeric / total_apps::numeric) * 100, 1) else 0 end,
    'upcoming_events', upcoming_events_count,
    'team_members', team_count,
    'daily_trend', daily_trend,
    'department_distribution', dept_distribution
  );
end;
$$;

revoke all on function public.get_admin_dashboard_kpis() from public;
grant execute on function public.get_admin_dashboard_kpis() to authenticated;

-- 11. RPC pour consulter le monitoring de sécurité (rate-limiting sans exposer les IPs complètes)
create or replace function public.mask_ip(ip text)
returns text
language sql
immutable
as $$
  select case
    when ip like '%.%.%.%' then
      split_part(ip, '.', 1) || '.' || split_part(ip, '.', 2) || '.***.***'
    when ip like '%:%' then
      substr(ip, 1, 9) || ':****'
    else '***.***.***'
  end;
$$;

create or replace function public.get_blocked_attempts_summary()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  total_tracked integer;
  last_24h_count integer;
  recent_records jsonb;
begin
  if not public.is_admin_or_editor() then
    raise exception 'Unauthorized';
  end if;

  select count(*) into total_tracked from private.club_application_rate_limits;
  select count(*) into last_24h_count from private.club_application_rate_limits
  where submitted_at >= now() - interval '24 hours';

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', r.id,
        'email_hash', substr(md5(r.email), 1, 10),
        'ip_masked', mask_ip(r.ip_address::text),
        'submitted_at', r.submitted_at
      ) order by r.submitted_at desc
    ),
    '[]'::jsonb
  ) into recent_records
  from (
    select id, email, ip_address, submitted_at
    from private.club_application_rate_limits
    order by submitted_at desc
    limit 50
  ) r;

  return jsonb_build_object(
    'total_tracked', total_tracked,
    'last_24h_count', last_24h_count,
    'recent_events', recent_records
  );
end;
$$;

revoke all on function public.get_blocked_attempts_summary() from public;
grant execute on function public.get_blocked_attempts_summary() to authenticated;

-- 12. Configuration du bucket Storage club-media (si le schéma storage existe)
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'storage' and table_name = 'buckets') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values (
      'club-media',
      'club-media',
      true,
      5242880,
      array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    )
    on conflict (id) do update set public = true;
  end if;
end $$;

-- Politiques de stockage
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'storage' and table_name = 'objects') then
    drop policy if exists "Public read on club-media" on storage.objects;
    create policy "Public read on club-media"
      on storage.objects for select
      to public
      using (bucket_id = 'club-media');

    drop policy if exists "Admins upload to club-media" on storage.objects;
    create policy "Admins upload to club-media"
      on storage.objects for insert
      to authenticated
      with check (bucket_id = 'club-media' and public.is_admin_or_editor());

    drop policy if exists "Admins update on club-media" on storage.objects;
    create policy "Admins update on club-media"
      on storage.objects for update
      to authenticated
      using (bucket_id = 'club-media' and public.is_admin_or_editor());

    drop policy if exists "Admins delete from club-media" on storage.objects;
    create policy "Admins delete from club-media"
      on storage.objects for delete
      to authenticated
      using (bucket_id = 'club-media' and public.is_admin_or_editor());
  end if;
end $$;

notify pgrst, 'reload schema';

commit;
