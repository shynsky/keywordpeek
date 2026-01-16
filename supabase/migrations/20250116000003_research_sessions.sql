-- Research Sessions Table
-- Created: 2025-01-16
-- Purpose: Store research sessions for the Research Hub with auto-save

-- =============================================================================
-- TABLE
-- =============================================================================

create table public.research_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  title text not null,  -- Auto-generated from description, e.g., "Motorcycles Guatemala"
  description text,     -- User's natural language input
  location_code int default 2840,  -- 2840 = United States
  language_code text default 'en',
  status text default 'in_progress' check (status in ('in_progress', 'completed')),

  -- Tab 1: Validation data
  generated_keywords text[],  -- LLM-generated keyword list
  keywords jsonb,             -- Searched keywords with metrics
  validation_summary jsonb,   -- Demand/competition scores

  -- Tab 2: Competitor data
  competitors jsonb,          -- Discovered competitors
  competitor_keywords jsonb,  -- Keywords competitors rank for

  -- Tab 3: Content plan data
  content_clusters jsonb,     -- LLM-generated clusters
  content_gaps jsonb,         -- Identified gaps

  -- Metadata
  credits_used numeric(10,2) default 0,
  current_tab int default 1,  -- Track which tab user is on (1, 2, or 3)
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.research_sessions is 'Research Hub sessions with auto-save';
comment on column public.research_sessions.title is 'Auto-generated from description for display';
comment on column public.research_sessions.description is 'User natural language input describing their niche';
comment on column public.research_sessions.status is 'in_progress or completed';
comment on column public.research_sessions.generated_keywords is 'LLM-generated keywords before search';
comment on column public.research_sessions.keywords is 'Full keyword search results with metrics';
comment on column public.research_sessions.validation_summary is 'Demand/competition/opportunity scores';
comment on column public.research_sessions.competitors is 'Discovered competitor domains';
comment on column public.research_sessions.competitor_keywords is 'Keywords that competitors rank for';
comment on column public.research_sessions.content_clusters is 'LLM-grouped content clusters';
comment on column public.research_sessions.content_gaps is 'Keywords competitors have that user does not';

-- =============================================================================
-- INDEXES
-- =============================================================================

create index idx_research_sessions_user_id on public.research_sessions(user_id);
create index idx_research_sessions_created_at on public.research_sessions(created_at desc);
create index idx_research_sessions_user_created on public.research_sessions(user_id, created_at desc);
create index idx_research_sessions_status on public.research_sessions(status);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

alter table public.research_sessions enable row level security;

create policy "Users can view own research sessions"
  on public.research_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own research sessions"
  on public.research_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own research sessions"
  on public.research_sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete own research sessions"
  on public.research_sessions for delete
  using (auth.uid() = user_id);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Auto-update updated_at timestamp
create or replace function public.update_research_session_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger research_sessions_updated_at
  before update on public.research_sessions
  for each row
  execute function public.update_research_session_timestamp();
