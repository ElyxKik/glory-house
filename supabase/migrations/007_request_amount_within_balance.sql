begin;
create or replace function public.enforce_request_amount_within_balance() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  available numeric(14,2);
begin
  if new.amount is null or new.amount <= 0 then
    return new;
  end if;
  if tg_op = 'INSERT' then
    if new.status <> 'pending_admin' then return new; end if;
  elsif not (new.status = 'pending_admin' or (new.status = 'approved' and old.status is distinct from 'approved')) then
    return new;
  end if;

  -- Serialize request creation and approval checks so simultaneous submissions
  -- cannot both reserve the same remaining balance.
  perform pg_advisory_xact_lock(hashtext('glory_house_available_balance'));
  select coalesce(sum(case when kind = 'income' then amount else -amount end), 0)
    into available
    from public.financial_transactions
    where status in ('approved','pending');
  available := available - coalesce((
    select sum(amount) from public.school_requests
    where status = 'pending_admin' and amount is not null
      and (tg_op = 'INSERT' or id <> new.id)
  ), 0);

  if new.amount > available then
    raise exception 'Le montant demandé dépasse le solde disponible (solde : %).', available;
  end if;
  return new;
end;
$$;
drop trigger if exists request_amount_balance_guard on public.school_requests;
create trigger request_amount_balance_guard
before insert or update of amount, status on public.school_requests
for each row execute function public.enforce_request_amount_within_balance();
commit;
