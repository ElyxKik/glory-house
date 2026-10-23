begin;
alter table public.financial_transactions add column if not exists source_request_id uuid references public.school_requests(id) on delete set null;
create unique index if not exists financial_transactions_source_request_idx on public.financial_transactions(source_request_id) where source_request_id is not null;

create or replace function public.create_expense_for_approved_request() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if old.status is distinct from 'approved' and new.status = 'approved' and new.amount is not null and new.amount > 0 then
    insert into public.financial_transactions(label, category, amount, kind, status, created_by, source_request_id)
    values ('Demande approuvée — ' || new.subject, coalesce(new.category, 'Demande approuvée'), new.amount, 'expense', 'pending', new.requested_by, new.id)
    on conflict (source_request_id) where source_request_id is not null do nothing;
  end if;
  return new;
end;
$$;
drop trigger if exists approved_request_expense on public.school_requests;
create trigger approved_request_expense after update of status on public.school_requests for each row execute function public.create_expense_for_approved_request();

-- Backfill requests that were approved before this migration.
insert into public.financial_transactions(label, category, amount, kind, status, created_by, source_request_id)
select 'Demande approuvée — ' || r.subject, coalesce(r.category, 'Demande approuvée'), r.amount, 'expense', 'pending', r.requested_by, r.id
from public.school_requests r
where r.status = 'approved' and r.amount is not null and r.amount > 0
on conflict (source_request_id) where source_request_id is not null do nothing;
commit;
