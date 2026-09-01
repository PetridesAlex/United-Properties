-- CRM clients: persistent contacts + auto-link from website inquiries

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null default '',
  email text,
  phone text,
  notes text,
  source text not null default 'website'
    check (source in ('website', 'manual')),
  status text not null default 'active'
    check (status in ('active', 'archived')),
  last_contact_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists clients_email_unique_idx
  on public.clients (lower(email))
  where email is not null and btrim(email) <> '';

create index if not exists clients_phone_idx
  on public.clients (regexp_replace(phone, '\s+', '', 'g'))
  where phone is not null and btrim(phone) <> '';

create index if not exists clients_last_contact_idx
  on public.clients (last_contact_at desc nulls last);

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

alter table public.inquiries
  add column if not exists client_id uuid references public.clients (id) on delete set null;

create index if not exists inquiries_client_id_idx
  on public.inquiries (client_id);

-- ---------------------------------------------------------------------------
-- Auto-upsert client from inquiry insert
-- ---------------------------------------------------------------------------
create or replace function public.upsert_client_from_inquiry()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_phone text;
  v_first text;
  v_last text;
  v_parts text[];
  v_client_id uuid;
begin
  v_email := nullif(lower(btrim(coalesce(new.email, ''))), '');
  v_phone := nullif(regexp_replace(coalesce(new.phone, ''), '\s+', '', 'g'), '');

  v_parts := regexp_split_to_array(btrim(coalesce(new.full_name, '')), '\s+');
  if array_length(v_parts, 1) is null or v_parts[1] = '' then
    v_first := 'Unknown';
    v_last := '';
  else
    v_first := v_parts[1];
    if array_length(v_parts, 1) > 1 then
      v_last := array_to_string(v_parts[2:array_length(v_parts, 1)], ' ');
    else
      v_last := '';
    end if;
  end if;

  if v_email is not null then
    select id into v_client_id
    from public.clients
    where lower(email) = v_email
    limit 1;
  end if;

  if v_client_id is null and v_phone is not null then
    select id into v_client_id
    from public.clients
    where regexp_replace(coalesce(phone, ''), '\s+', '', 'g') = v_phone
    limit 1;
  end if;

  if v_client_id is not null then
    update public.clients
    set
      first_name = case when btrim(first_name) = '' or first_name = 'Unknown' then v_first else first_name end,
      last_name = case when btrim(last_name) = '' then v_last else last_name end,
      email = coalesce(email, v_email),
      phone = coalesce(nullif(btrim(coalesce(phone, '')), ''), new.phone),
      last_contact_at = greatest(coalesce(last_contact_at, new.created_at), new.created_at),
      updated_at = now()
    where id = v_client_id;
  else
    begin
      insert into public.clients (
        first_name,
        last_name,
        email,
        phone,
        source,
        status,
        last_contact_at
      )
      values (
        v_first,
        v_last,
        v_email,
        nullif(btrim(coalesce(new.phone, '')), ''),
        'website',
        'active',
        new.created_at
      )
      returning id into v_client_id;
    exception
      when unique_violation then
        if v_email is not null then
          select id into v_client_id
          from public.clients
          where lower(email) = v_email
          limit 1;
        end if;
        if v_client_id is not null then
          update public.clients
          set last_contact_at = greatest(coalesce(last_contact_at, new.created_at), new.created_at)
          where id = v_client_id;
        end if;
    end;
  end if;

  new.client_id := v_client_id;
  return new;
end;
$$;

drop trigger if exists inquiries_upsert_client on public.inquiries;
create trigger inquiries_upsert_client
  before insert on public.inquiries
  for each row
  execute function public.upsert_client_from_inquiry();

-- ---------------------------------------------------------------------------
-- Backfill existing inquiries into clients
-- ---------------------------------------------------------------------------
do $$
declare
  rec record;
  v_email text;
  v_phone text;
  v_first text;
  v_last text;
  v_parts text[];
  v_client_id uuid;
begin
  for rec in
    select *
    from public.inquiries
    where client_id is null
    order by created_at asc
  loop
    v_email := nullif(lower(btrim(coalesce(rec.email, ''))), '');
    v_phone := nullif(regexp_replace(coalesce(rec.phone, ''), '\s+', '', 'g'), '');

    v_parts := regexp_split_to_array(btrim(coalesce(rec.full_name, '')), '\s+');
    if array_length(v_parts, 1) is null or v_parts[1] = '' then
      v_first := 'Unknown';
      v_last := '';
    else
      v_first := v_parts[1];
      if array_length(v_parts, 1) > 1 then
        v_last := array_to_string(v_parts[2:array_length(v_parts, 1)], ' ');
      else
        v_last := '';
      end if;
    end if;

    v_client_id := null;

    if v_email is not null then
      select id into v_client_id
      from public.clients
      where lower(email) = v_email
      limit 1;
    end if;

    if v_client_id is null and v_phone is not null then
      select id into v_client_id
      from public.clients
      where regexp_replace(coalesce(phone, ''), '\s+', '', 'g') = v_phone
      limit 1;
    end if;

    if v_client_id is null then
      insert into public.clients (
        first_name,
        last_name,
        email,
        phone,
        source,
        status,
        last_contact_at,
        created_at
      )
      values (
        v_first,
        v_last,
        v_email,
        nullif(btrim(coalesce(rec.phone, '')), ''),
        'website',
        'active',
        rec.created_at,
        rec.created_at
      )
      returning id into v_client_id;
    else
      update public.clients
      set
        last_contact_at = greatest(coalesce(last_contact_at, rec.created_at), rec.created_at),
        email = coalesce(email, v_email),
        phone = coalesce(nullif(btrim(coalesce(phone, '')), ''), rec.phone),
        updated_at = now()
      where id = v_client_id;
    end if;

    update public.inquiries
    set client_id = v_client_id
    where id = rec.id;
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.clients enable row level security;

drop policy if exists "Editors manage clients" on public.clients;
create policy "Editors manage clients"
  on public.clients for all
  to authenticated
  using (public.is_property_editor())
  with check (public.is_property_editor());

grant select, insert, update, delete on table public.clients to authenticated;
