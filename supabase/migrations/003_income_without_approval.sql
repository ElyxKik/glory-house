begin;
-- Preserve rejected or already approved records; release only pending receipts.
update public.financial_transactions set status = 'approved'
where kind = 'income' and status = 'pending';

drop policy if exists "Finance records transactions" on public.financial_transactions;
create policy "Finance records transactions" on public.financial_transactions
for insert to authenticated with check (
  public.current_role() = 'finance' and created_by = auth.uid()
  and validated_by is null and validated_at is null
  and ((kind = 'income' and status = 'approved') or (kind = 'expense' and status = 'pending'))
);
drop policy if exists "Principal validates finance" on public.financial_transactions;
create policy "Principal validates finance" on public.financial_transactions
for update to authenticated
using (public.is_principal_admin() and kind = 'expense' and status = 'pending')
with check (public.is_principal_admin() and kind = 'expense' and status in ('approved','rejected') and validated_by = auth.uid() and validated_at is not null);
commit;
