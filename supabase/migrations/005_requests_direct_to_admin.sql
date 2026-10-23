begin;
-- Send requests already waiting on Finance straight to the admin queue.
update public.school_requests set status = 'pending_admin'
where status = 'pending_finance';

drop policy if exists "Direction creates requests" on public.school_requests;
create policy "Direction creates requests" on public.school_requests
for insert to authenticated with check (
  public.current_role() = 'direction'
  and requested_by = auth.uid()
  and status = 'pending_admin'
);
drop policy if exists "Finance evaluates requests" on public.school_requests;
commit;
