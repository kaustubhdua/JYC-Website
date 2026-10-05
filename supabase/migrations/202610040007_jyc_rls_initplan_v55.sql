-- JYC V55 RLS performance hardening.
-- Wrap auth.uid() in SELECT so Postgres evaluates it once per statement rather than per row.
do $$
declare
  p record;
  new_using text;
  new_check text;
  stmt text;
begin
  for p in
    select schemaname, tablename, policyname, qual, with_check
    from pg_policies
    where schemaname='public'
      and (
        coalesce(qual,'') like '%auth.uid()%'
        or coalesce(with_check,'') like '%auth.uid()%'
      )
      and (
        coalesce(qual,'') not like '%(select auth.uid())%'
        and coalesce(with_check,'') not like '%(select auth.uid())%'
      )
  loop
    new_using := case
      when p.qual is null then null
      else regexp_replace(p.qual, 'auth\\.uid\\(\\)', '(select auth.uid())', 'g')
    end;
    new_check := case
      when p.with_check is null then null
      else regexp_replace(p.with_check, 'auth\\.uid\\(\\)', '(select auth.uid())', 'g')
    end;

    stmt := format('alter policy %I on %I.%I', p.policyname, p.schemaname, p.tablename);
    if new_using is not null then stmt := stmt || format(' using (%s)', new_using); end if;
    if new_check is not null then stmt := stmt || format(' with check (%s)', new_check); end if;
    execute stmt;
  end loop;
end $$;
