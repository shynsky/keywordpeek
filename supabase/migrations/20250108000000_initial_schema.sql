-- KeywordPeek Initial Schema
-- Created: 2025-01-08

-- =============================================================================
-- TABLES
-- =============================================================================

-- Users profile (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  credits int default 50 not null,  -- Start with 50 free credits
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.profiles is 'User profiles with credit balance';
comment on column public.profiles.credits is 'Current credit balance, starts at 50';

-- Projects (workspaces for organizing keywords)
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  name text not null,
  domain text,  -- optional: associated website
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.projects is 'User projects/workspaces for organizing keyword research';

-- Saved Keywords
create table public.keywords (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects on delete cascade not null,
  keyword text not null,
  search_volume int,
  difficulty int,  -- 0-100
  cpc numeric(10,2),
  keyword_score int,  -- 0-100 combined opportunity score
  data jsonb,  -- full DataForSEO response
  status text default 'saved' not null,  -- saved, targeting, published
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.keywords is 'Saved keywords with metrics from DataForSEO';
comment on column public.keywords.keyword_score is 'Combined 0-100 score factoring volume, difficulty, and CPC';
comment on column public.keywords.status is 'Workflow status: saved, targeting, published';

-- Credit Transactions
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  amount int not null,  -- positive for credits added, negative for usage
  type text not null,  -- 'purchase', 'usage', 'bonus', 'refund'
  description text,
  stripe_session_id text,
  stripe_payment_intent_id text,
  created_at timestamptz default now() not null
);

comment on table public.transactions is 'Credit transaction history';
comment on column public.transactions.amount is 'Credits added (positive) or used (negative)';

-- API Usage Log (for tracking and debugging)
create table public.api_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  endpoint text not null,
  credits_used int not null,
  keywords_count int,
  request_data jsonb,
  response_status int,
  created_at timestamptz default now() not null
);

comment on table public.api_usage is 'API usage log for analytics and debugging';

-- Keyword Cache (reduce DataForSEO API costs)
create table public.keyword_cache (
  keyword text not null,
  location_code int default 2840 not null,  -- 2840 = United States
  language_code text default 'en' not null,
  data jsonb not null,
  fetched_at timestamptz default now() not null,
  primary key (keyword, location_code, language_code)
);

comment on table public.keyword_cache is 'Cache for DataForSEO results to reduce API costs';
comment on column public.keyword_cache.location_code is 'DataForSEO location code, 2840 = US';

-- Index for cache cleanup
create index idx_keyword_cache_fetched_at on public.keyword_cache(fetched_at);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.keywords enable row level security;
alter table public.transactions enable row level security;
alter table public.api_usage enable row level security;
-- keyword_cache is public/shared, no RLS needed

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Projects policies
create policy "Users can view own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can create own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Keywords policies
create policy "Users can view keywords in own projects"
  on public.keywords for select
  using (
    project_id in (select id from public.projects where user_id = auth.uid())
  );

create policy "Users can create keywords in own projects"
  on public.keywords for insert
  with check (
    project_id in (select id from public.projects where user_id = auth.uid())
  );

create policy "Users can update keywords in own projects"
  on public.keywords for update
  using (
    project_id in (select id from public.projects where user_id = auth.uid())
  );

create policy "Users can delete keywords in own projects"
  on public.keywords for delete
  using (
    project_id in (select id from public.projects where user_id = auth.uid())
  );

-- Transactions policies
create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

-- API usage policies
create policy "Users can view own api usage"
  on public.api_usage for select
  using (auth.uid() = user_id);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to add credits to a user
create or replace function public.add_credits(
  p_user_id uuid,
  p_amount int,
  p_type text default 'purchase',
  p_description text default null,
  p_stripe_session_id text default null
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_balance int;
begin
  -- Update credits
  update public.profiles
  set
    credits = credits + p_amount,
    updated_at = now()
  where id = p_user_id
  returning credits into v_new_balance;

  -- Log transaction
  insert into public.transactions (
    user_id, amount, type, description, stripe_session_id
  ) values (
    p_user_id, p_amount, p_type, p_description, p_stripe_session_id
  );

  return v_new_balance;
end;
$$;

comment on function public.add_credits is 'Add credits to user and log transaction';

-- Function to deduct credits
create or replace function public.deduct_credits(
  p_user_id uuid,
  p_amount int,
  p_description text default null
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_balance int;
  v_new_balance int;
begin
  -- Get current balance
  select credits into v_current_balance
  from public.profiles
  where id = p_user_id;

  -- Check if sufficient credits
  if v_current_balance < p_amount then
    raise exception 'Insufficient credits. Have: %, Need: %', v_current_balance, p_amount;
  end if;

  -- Deduct credits
  update public.profiles
  set
    credits = credits - p_amount,
    updated_at = now()
  where id = p_user_id
  returning credits into v_new_balance;

  -- Log transaction (negative amount)
  insert into public.transactions (
    user_id, amount, type, description
  ) values (
    p_user_id, -p_amount, 'usage', p_description
  );

  return v_new_balance;
end;
$$;

comment on function public.deduct_credits is 'Deduct credits from user, throws if insufficient';

-- Function to check if user has enough credits
create or replace function public.has_credits(
  p_user_id uuid,
  p_amount int
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance int;
begin
  select credits into v_balance
  from public.profiles
  where id = p_user_id;

  return coalesce(v_balance, 0) >= p_amount;
end;
$$;

comment on function public.has_credits is 'Check if user has sufficient credits';

-- Function to get user credit balance
create or replace function public.get_credit_balance(p_user_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance int;
begin
  select credits into v_balance
  from public.profiles
  where id = p_user_id;

  return coalesce(v_balance, 0);
end;
$$;

comment on function public.get_credit_balance is 'Get current credit balance for user';

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.handle_updated_at();

create trigger keywords_updated_at
  before update on public.keywords
  for each row execute function public.handle_updated_at();

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, credits)
  values (new.id, new.email, 50);  -- 50 free credits on signup
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Projects indexes
create index idx_projects_user_id on public.projects(user_id);

-- Keywords indexes
create index idx_keywords_project_id on public.keywords(project_id);
create index idx_keywords_keyword on public.keywords(keyword);
create index idx_keywords_status on public.keywords(status);

-- Transactions indexes
create index idx_transactions_user_id on public.transactions(user_id);
create index idx_transactions_created_at on public.transactions(created_at desc);
create index idx_transactions_type on public.transactions(type);

-- API usage indexes
create index idx_api_usage_user_id on public.api_usage(user_id);
create index idx_api_usage_created_at on public.api_usage(created_at desc);
