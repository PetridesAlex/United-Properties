-- 7-digit property reference numbers (e.g. 1000001) for CMS + Bazaraki.

create or replace function public.next_property_reference()
returns text
language plpgsql
as $$
declare
  n bigint;
begin
  n := nextval('public.property_reference_seq');
  -- Keep a stable 7-digit range: 1000001, 1000002, ...
  return (1000000 + n)::text;
end;
$$;

-- One-time: convert legacy UP-0001 style refs to 7-digit numbers.
create or replace function public.migrate_property_references_to_7digit()
returns void
language plpgsql
as $$
declare
  r record;
  next_n bigint;
  new_ref text;
begin
  for r in
    select id, reference_number
    from public.properties
    where reference_number ~* '^UP-[0-9]+$'
    order by created_at asc nulls last, id asc
  loop
    next_n := coalesce(
      nullif(regexp_replace(r.reference_number, '^UP-0*', '', 'i'), '')::bigint,
      nextval('public.property_reference_seq')
    );
    new_ref := (1000000 + next_n)::text;

    -- Avoid collisions with an already-converted row
    while exists (select 1 from public.properties where reference_number = new_ref) loop
      next_n := nextval('public.property_reference_seq');
      new_ref := (1000000 + next_n)::text;
    end loop;

    update public.properties
    set reference_number = new_ref
    where id = r.id;
  end loop;

  -- Align sequence above the highest numeric reference in use
  perform setval(
    'public.property_reference_seq',
    greatest(
      coalesce(
        (
          select max(reference_number::bigint) - 1000000
          from public.properties
          where reference_number ~ '^[0-9]{7}$'
        ),
        0
      ),
      1
    ),
    true
  );
end;
$$;

-- Temporarily allow reference updates for the migration, then re-lock.
alter table public.properties disable trigger properties_protect_reference;
select public.migrate_property_references_to_7digit();
alter table public.properties enable trigger properties_protect_reference;

drop function if exists public.migrate_property_references_to_7digit();
