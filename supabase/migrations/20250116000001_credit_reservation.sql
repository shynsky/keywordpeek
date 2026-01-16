-- Credit Reservation System
-- Created: 2025-01-16
-- Purpose: Atomic credit reservation with rollback capability for API failures

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to reserve (deduct) credits atomically
-- Returns the transaction ID for potential rollback
create or replace function public.reserve_credits(
  p_user_id uuid,
  p_amount int,
  p_description text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_balance int;
  v_transaction_id uuid;
begin
  -- Lock row and get current balance
  select credits into v_current_balance
  from public.profiles
  where id = p_user_id
  for update;

  -- Check if sufficient credits
  if v_current_balance is null then
    raise exception 'User not found: %', p_user_id;
  end if;

  if v_current_balance < p_amount then
    raise exception 'Insufficient credits. Have: %, Need: %', v_current_balance, p_amount;
  end if;

  -- Deduct credits
  update public.profiles
  set
    credits = credits - p_amount,
    updated_at = now()
  where id = p_user_id;

  -- Log transaction (negative amount) and get ID for potential rollback
  insert into public.transactions (
    user_id, amount, type, description
  ) values (
    p_user_id, -p_amount, 'usage', p_description
  )
  returning id into v_transaction_id;

  return v_transaction_id;
end;
$$;

comment on function public.reserve_credits is 'Reserve credits atomically, returns transaction ID for potential rollback';

-- Function to rollback reserved credits (refund on API failure)
create or replace function public.rollback_credits(
  p_transaction_id uuid
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_amount int;
  v_new_balance int;
begin
  -- Get transaction details
  select user_id, amount into v_user_id, v_amount
  from public.transactions
  where id = p_transaction_id;

  if v_user_id is null then
    raise exception 'Transaction not found: %', p_transaction_id;
  end if;

  -- Refund credits (amount is negative, so subtract it to add back)
  update public.profiles
  set
    credits = credits - v_amount,
    updated_at = now()
  where id = v_user_id
  returning credits into v_new_balance;

  -- Delete the original transaction
  delete from public.transactions where id = p_transaction_id;

  return v_new_balance;
end;
$$;

comment on function public.rollback_credits is 'Rollback reserved credits on API failure, deletes the transaction';
