-- Synapse database schema
create extension if not exists "pgcrypto";

-- ============================================================
-- Core identity
-- ============================================================

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  username text unique not null,
  password_hash text not null,
  role text not null default 'developer' check (role in ('developer', 'designer', 'admin')),
  created_at timestamptz not null default now()
);

-- Master list of skills/tags, reusable across profiles and (later) projects
create table if not exists skills (
  id uuid primary key default gen_random_uuid(),
  name text unique not null
);

create table if not exists profile_skills (
  profile_id uuid not null references profiles(id) on delete cascade,
  skill_id uuid not null references skills(id) on delete cascade,
  primary key (profile_id, skill_id)
);

create index if not exists idx_profile_skills_skill_id on profile_skills(skill_id);

-- ============================================================
-- Projects
-- ============================================================

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text,
  repo_url text,
  visibility text not null default 'private' check (visibility in ('public', 'private')),
  auto_approve_join boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_projects_creator_id on projects(creator_id);

-- ============================================================
-- Collaboration: current membership state + historical log
-- ============================================================

-- Current state of a user's membership on a project (one row per project+user)
create table if not exists collaborations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null default 'contributor' check (role in ('owner', 'maintainer', 'contributor', 'reviewer')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  initiated_by text not null check (initiated_by in ('owner', 'user')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, user_id)
);

create index if not exists idx_collaborations_project_id on collaborations(project_id);
create index if not exists idx_collaborations_user_id on collaborations(user_id);

-- Append-only audit trail of every invite/request/response, independent of
-- the current collaborations state (which only holds the latest status)
create table if not exists collaboration_invitations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  target_user_id uuid not null references profiles(id) on delete cascade,
  actor_id uuid not null references profiles(id) on delete cascade,
  action text not null check (action in ('invited', 'requested', 'accepted', 'rejected', 'cancelled', 'auto_approved')),
  created_at timestamptz not null default now()
);

create index if not exists idx_collab_invitations_project_id on collaboration_invitations(project_id);
create index if not exists idx_collab_invitations_target_user_id on collaboration_invitations(target_user_id);

-- ============================================================
-- Engagement: comments, follows, likes, bookmarks
-- ============================================================

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_comments_project_id on comments(project_id);

create table if not exists follows (
  follower_id uuid not null references profiles(id) on delete cascade,
  following_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create index if not exists idx_follows_following_id on follows(following_id);

create table if not exists project_likes (
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create table if not exists saved_projects (
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

-- ============================================================
-- Notifications (targeted, per-user) and activity feed (public log)
-- ============================================================

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references profiles(id) on delete cascade,
  actor_id uuid references profiles(id) on delete set null,
  type text not null check (type in ('invite', 'invite_accepted', 'invite_rejected', 'comment', 'follow', 'like')),
  payload jsonb not null default '{}'::jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_recipient_id on notifications(recipient_id, is_read);

create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references profiles(id) on delete cascade,
  verb text not null check (verb in ('created_project', 'joined_project', 'commented', 'followed', 'liked')),
  target_type text not null check (target_type in ('project', 'profile', 'comment')),
  target_id uuid not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_log_actor_id on activity_log(actor_id);
create index if not exists idx_activity_log_created_at on activity_log(created_at desc);

-- Enable Supabase Realtime so notifications/activity can be streamed to clients
-- (wrapped in existence checks so this migration can be safely re-run)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table notifications;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'activity_log'
  ) then
    alter publication supabase_realtime add table activity_log;
  end if;
end $$;
