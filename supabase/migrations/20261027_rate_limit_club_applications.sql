begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.club_application_rate_limits (
  id bigint generated always as identity primary key,
  ip_address inet not null,
  email text not null,
  submitted_at timestamptz not null default now()
);

revoke all on table private.club_application_rate_limits from public, anon, authenticated;

create index if not exists club_application_rate_limits_ip_submitted_idx
  on private.club_application_rate_limits (ip_address, submitted_at desc);

create index if not exists club_application_rate_limits_email_submitted_idx
  on private.club_application_rate_limits (email, submitted_at desc);

create or replace function public.submit_club_application(
  p_full_name text,
  p_email text,
  p_study_year text,
  p_field_of_study text,
  p_department text,
  p_motivation text,
  p_website text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_headers jsonb;
  raw_ip text;
  request_ip inet;
  normalized_email text := lower(btrim(p_email));
  recent_ip_count integer;
  daily_ip_count integer;
  recent_email_count integer;
begin
  -- Bots commonly fill every input. Return a fake success without storing data.
  if nullif(btrim(p_website), '') is not null then
    return jsonb_build_object('accepted', true);
  end if;

  request_headers := coalesce(
    nullif(current_setting('request.headers', true), ''),
    '{}'
  )::jsonb;

  raw_ip := btrim(split_part(coalesce(
    request_headers ->> 'cf-connecting-ip',
    request_headers ->> 'x-forwarded-for',
    request_headers ->> 'x-real-ip',
    ''
  ), ',', 1));

  begin
    request_ip := nullif(raw_ip, '')::inet;
  exception
    when invalid_text_representation then
      request_ip := null;
  end;

  -- Fail closed: public submissions must arrive through the Supabase gateway.
  if request_ip is null then
    raise sqlstate 'PGRST' using
      message = jsonb_build_object(
        'code', 'CLIENT_IP_REQUIRED',
        'message', 'The request could not be verified.',
        'details', null,
        'hint', null
      )::text,
      detail = jsonb_build_object(
        'status', 400,
        'status_text', 'Bad Request'
      )::text;
  end if;

  -- Serialize submissions for the same IP and email to prevent burst races.
  perform pg_advisory_xact_lock(hashtextextended('ip:' || request_ip::text, 0));
  perform pg_advisory_xact_lock(hashtextextended('email:' || normalized_email, 0));

  delete from private.club_application_rate_limits
  where submitted_at < now() - interval '24 hours';

  select count(*) into recent_ip_count
  from private.club_application_rate_limits
  where ip_address = request_ip
    and submitted_at >= now() - interval '10 minutes';

  select count(*) into daily_ip_count
  from private.club_application_rate_limits
  where ip_address = request_ip
    and submitted_at >= now() - interval '24 hours';

  select count(*) into recent_email_count
  from private.club_application_rate_limits
  where email = normalized_email
    and submitted_at >= now() - interval '24 hours';

  if recent_email_count >= 1 then
    raise sqlstate 'PGRST' using
      message = jsonb_build_object(
        'code', 'RATE_LIMITED',
        'message', 'An application from this email was already received recently.',
        'details', null,
        'hint', null
      )::text,
      detail = jsonb_build_object(
        'status', 429,
        'status_text', 'Too Many Requests',
        'headers', jsonb_build_object('Retry-After', '86400')
      )::text;
  end if;

  if recent_ip_count >= 5 then
    raise sqlstate 'PGRST' using
      message = jsonb_build_object(
        'code', 'RATE_LIMITED',
        'message', 'Too many applications were sent from this network.',
        'details', null,
        'hint', null
      )::text,
      detail = jsonb_build_object(
        'status', 429,
        'status_text', 'Too Many Requests',
        'headers', jsonb_build_object('Retry-After', '600')
      )::text;
  end if;

  if daily_ip_count >= 25 then
    raise sqlstate 'PGRST' using
      message = jsonb_build_object(
        'code', 'RATE_LIMITED',
        'message', 'The daily application limit for this network was reached.',
        'details', null,
        'hint', null
      )::text,
      detail = jsonb_build_object(
        'status', 429,
        'status_text', 'Too Many Requests',
        'headers', jsonb_build_object('Retry-After', '86400')
      )::text;
  end if;

  insert into public.club_applications (
    full_name,
    email,
    study_year,
    field_of_study,
    department,
    motivation
  ) values (
    btrim(p_full_name),
    normalized_email,
    p_study_year,
    btrim(p_field_of_study),
    p_department,
    nullif(btrim(p_motivation), '')
  );

  insert into private.club_application_rate_limits (
    ip_address,
    email
  ) values (
    request_ip,
    normalized_email
  );

  return jsonb_build_object('accepted', true);
end;
$$;

-- The browser may call only the protected RPC, never the table directly.
revoke all on table public.club_applications from anon, authenticated;
revoke insert (
  full_name,
  email,
  study_year,
  field_of_study,
  department,
  motivation
) on table public.club_applications from anon, authenticated;
drop policy if exists "Public can submit club applications" on public.club_applications;

revoke all on function public.submit_club_application(text, text, text, text, text, text, text) from public;
grant execute on function public.submit_club_application(text, text, text, text, text, text, text)
  to anon, authenticated;

notify pgrst, 'reload schema';

commit;
