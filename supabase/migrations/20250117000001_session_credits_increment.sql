-- Atomic increment for session credits used
-- Fixes race condition in addCreditsUsed() function

create or replace function public.add_session_credits_used(
  p_session_id uuid,
  p_credits numeric
)
returns numeric
language plpgsql
security definer
as $$
declare
  v_new_credits numeric;
begin
  update public.research_sessions
  set credits_used = credits_used + p_credits
  where id = p_session_id
  returning credits_used into v_new_credits;

  if not found then
    raise exception 'Session not found: %', p_session_id;
  end if;

  return v_new_credits;
end;
$$;
