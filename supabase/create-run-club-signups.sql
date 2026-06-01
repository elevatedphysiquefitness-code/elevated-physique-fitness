create table if not exists run_club_signups (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  running_experience text not null,
  weekly_mileage text,
  current_pace text,
  running_goal text not null,
  injuries text,
  emergency_contact_name text,
  emergency_contact_phone text,
  how_heard text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

-- Only the service role can insert/read (public sign-up flow uses service role key)
alter table run_club_signups enable row level security;

create policy "Service role full access"
  on run_club_signups
  for all
  to service_role
  using (true)
  with check (true);
