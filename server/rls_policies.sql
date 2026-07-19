-- Row Level Security — defense-in-depth baseline
--
-- All application traffic goes through the backend using the Supabase
-- service_role key, which bypasses RLS entirely. These policies exist so
-- that if a client ever queries Supabase directly with the anon key
-- (e.g. a leaked key, a misconfigured client), it can only read what's
-- explicitly public and can never write.
--
-- IMPORTANT CAVEAT: policies below do not use auth.uid()-based per-user
-- rules. Synapse uses its own bcrypt/JWT auth, not Supabase Auth, so
-- auth.uid() is not populated for our users and cannot be used for
-- fine-grained "only the owner can see this" checks here. Per-user
-- authorization is enforced in the backend (see src/middleware and each
-- feature's service layer). If Supabase Realtime needs per-user filtering
-- directly from the client later, that will require issuing Supabase-
-- compatible JWTs (Supabase custom/third-party auth) — out of scope here.

alter table profiles enable row level security;
alter table skills enable row level security;
alter table profile_skills enable row level security;
alter table projects enable row level security;
alter table project_assets enable row level security;
alter table project_skills enable row level security;
alter table collaborations enable row level security;
alter table collaboration_invitations enable row level security;
alter table comments enable row level security;
alter table follows enable row level security;
alter table project_likes enable row level security;
alter table saved_projects enable row level security;
alter table notifications enable row level security;
alter table activity_log enable row level security;

-- Public read-only data: profiles, skills, public projects and their
-- comments/assets/likes are readable directly. Everything else (private
-- projects, notifications, invitations, etc.) has no select policy for
-- anon/authenticated, so it's only reachable through the backend.

create policy "profiles are publicly readable"
  on profiles for select
  using (true);

create policy "skills are publicly readable"
  on skills for select
  using (true);

create policy "profile_skills are publicly readable"
  on profile_skills for select
  using (true);

create policy "public projects are readable"
  on projects for select
  using (visibility = 'public');

create policy "assets of public projects are readable"
  on project_assets for select
  using (
    exists (
      select 1 from projects
      where projects.id = project_assets.project_id
      and projects.visibility = 'public'
    )
  );

create policy "skills of public projects are readable"
  on project_skills for select
  using (
    exists (
      select 1 from projects
      where projects.id = project_skills.project_id
      and projects.visibility = 'public'
    )
  );

create policy "comments on public projects are readable"
  on comments for select
  using (
    exists (
      select 1 from projects
      where projects.id = comments.project_id
      and projects.visibility = 'public'
    )
  );

create policy "follows are publicly readable"
  on follows for select
  using (true);

create policy "likes on public projects are readable"
  on project_likes for select
  using (
    exists (
      select 1 from projects
      where projects.id = project_likes.project_id
      and projects.visibility = 'public'
    )
  );

create policy "activity log is publicly readable"
  on activity_log for select
  using (true);

-- No insert/update/delete policies are defined for anon/authenticated on
-- any table: RLS defaults to deny, so all writes must go through the
-- backend's service_role connection.
