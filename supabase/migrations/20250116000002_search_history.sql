-- Search History Table
-- Created: 2025-01-16
-- Purpose: Store user search history with full results for replay

-- =============================================================================
-- TABLE
-- =============================================================================

create table public.search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  query_keywords text[] not null,  -- Array of searched keywords
  results_count int not null,
  credits_used numeric(10,2) not null,
  results jsonb not null,  -- Full search results for replay
  location_code int default 2840,  -- 2840 = United States
  language_code text default 'en',
  created_at timestamptz default now() not null
);

comment on table public.search_history is 'User search history with full results for replay';
comment on column public.search_history.query_keywords is 'Array of keywords that were searched';
comment on column public.search_history.results is 'Full search results JSON for viewing later';

-- =============================================================================
-- INDEXES
-- =============================================================================

create index idx_search_history_user_id on public.search_history(user_id);
create index idx_search_history_created_at on public.search_history(created_at desc);
create index idx_search_history_user_created on public.search_history(user_id, created_at desc);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

alter table public.search_history enable row level security;

create policy "Users can view own search history"
  on public.search_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own search history"
  on public.search_history for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own search history"
  on public.search_history for delete
  using (auth.uid() = user_id);
