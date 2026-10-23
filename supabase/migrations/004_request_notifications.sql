begin;
alter table public.school_requests add column if not exists decision_note text;
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  request_id uuid references public.school_requests(id) on delete set null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
alter table public.notifications enable row level security;
drop policy if exists "Users read own notifications" on public.notifications;
create policy "Users read own notifications" on public.notifications for select to authenticated using (user_id = auth.uid());
drop policy if exists "Users mark own notifications read" on public.notifications;
create policy "Users mark own notifications read" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.notify_request_decision() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if old.status = 'pending_admin' and new.status in ('approved','rejected') then
    insert into public.notifications(user_id, title, message, request_id)
    values (new.requested_by,
      case when new.status = 'approved' then 'Demande approuvée' else 'Demande refusée' end,
      'Votre demande « ' || new.subject || ' » a été ' || case when new.status = 'approved' then 'approuvée' else 'refusée' end || '.' || case when new.status = 'rejected' then ' Motif : ' || coalesce(new.decision_note, 'Non précisé') else '' end,
      new.id);
  end if;
  return new;
end;
$$;
drop trigger if exists request_decision_notification on public.school_requests;
create trigger request_decision_notification after update of status on public.school_requests for each row execute function public.notify_request_decision();
commit;
