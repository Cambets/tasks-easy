-- ======================================================================
-- MIGRATION: Central de Tarefas IA
-- ======================================================================

-- 1. Enums
create type public.task_status as enum ('inbox', 'todo', 'in_progress', 'done');
create type public.task_priority as enum ('none', 'low', 'medium', 'high', 'urgent');
create type public.time_sphere as enum ('importante', 'urgente', 'circunstancial');

-- 2. Utility Trigger Function: set_updated_at()
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 3. Table: tasks
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  notes text,
  status public.task_status not null default 'inbox',
  priority public.task_priority not null default 'none',
  start_date date,
  due_date date,
  completed_at timestamptz,
  is_important boolean not null default false,
  is_urgent boolean not null default false,
  time_sphere public.time_sphere,
  parent_task_id uuid references public.tasks(id) on delete cascade,
  position double precision not null default 0,
  is_focus_today boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_tasks_user_id on public.tasks(user_id);
create index idx_tasks_parent_task_id on public.tasks(parent_task_id);
create index idx_tasks_due_date on public.tasks(due_date);
create index idx_tasks_status on public.tasks(status);

create trigger tasks_updated
  before update on public.tasks
  for each row execute function public.set_updated_at();

alter table public.tasks enable row level security;

create policy "own tasks"
  on public.tasks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. Table: checklist_items
create table public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  is_done boolean not null default false,
  position double precision not null default 0,
  created_at timestamptz not null default now()
);

create index idx_checklist_task_id on public.checklist_items(task_id);
create index idx_checklist_user_id on public.checklist_items(user_id);

alter table public.checklist_items enable row level security;

create policy "own checklist"
  on public.checklist_items
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 5. Table: tags
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text not null default 'slate',
  created_at timestamptz not null default now(),
  constraint uq_user_tag_name unique (user_id, name)
);

create index idx_tags_user_id on public.tags(user_id);

alter table public.tags enable row level security;

create policy "own tags"
  on public.tags
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 6. Table: task_tags
create table public.task_tags (
  task_id uuid references public.tasks(id) on delete cascade not null,
  tag_id uuid references public.tags(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  primary key (task_id, tag_id)
);

create index idx_task_tags_task_id on public.task_tags(task_id);
create index idx_task_tags_tag_id on public.task_tags(tag_id);
create index idx_task_tags_user_id on public.task_tags(user_id);

alter table public.task_tags enable row level security;

create policy "own task_tags"
  on public.task_tags
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 7. Table: attachments
create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  file_name text not null,
  file_path text not null,
  file_size bigint,
  mime_type text,
  created_at timestamptz not null default now()
);

create index idx_attachments_task_id on public.attachments(task_id);
create index idx_attachments_user_id on public.attachments(user_id);

alter table public.attachments enable row level security;

create policy "own attachments"
  on public.attachments
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 8. Grants
grant select, insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;

-- 9. Automatic Welcome Seed for New Users
create or replace function public.seed_example_tasks()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_welcome_task_id uuid;
begin
  -- Task 1: Welcome with checklist
  insert into public.tasks (
    user_id,
    title,
    notes,
    status,
    priority,
    is_important,
    is_urgent,
    time_sphere,
    position
  ) values (
    new.id,
    'Bem-vindo(a) ao Central de Tarefas IA 👋',
    'Explore todas as funcionalidades e atalhos de teclado (pressione N para criar uma tarefa e / para buscar).',
    'todo',
    'high',
    true,
    false,
    'importante',
    1000
  ) returning id into v_welcome_task_id;

  insert into public.checklist_items (task_id, user_id, title, is_done, position)
  values
    (v_welcome_task_id, new.id, 'Explorar as visualizações (Kanban, Calendário, Tríade do Tempo)', false, 1),
    (v_welcome_task_id, new.id, 'Pressionar atalho "N" para criar sua primeira tarefa', false, 2),
    (v_welcome_task_id, new.id, 'Classificar tarefas por Esfera do Tempo (Importante, Urgente, Circunstancial)', false, 3);

  -- Task 2: Plan tomorrow
  insert into public.tasks (
    user_id,
    title,
    notes,
    status,
    priority,
    due_date,
    is_important,
    is_urgent,
    time_sphere,
    position
  ) values (
    new.id,
    'Planejar o dia de amanhã',
    'Defina as 3 prioridades essenciais para começar o dia com clareza.',
    'todo',
    'high',
    current_date + interval '1 day',
    true,
    false,
    'importante',
    2000
  );

  -- Task 3: Read article
  insert into public.tasks (
    user_id,
    title,
    notes,
    status,
    priority,
    is_important,
    is_urgent,
    time_sphere,
    position
  ) values (
    new.id,
    'Ler artigo sobre produtividade',
    'Aprofundar nos conceitos da Tríade do Tempo e Matriz de Eisenhower.',
    'inbox',
    'low',
    false,
    false,
    'circunstancial',
    3000
  );

  return new;
end;
$$;

revoke execute on function public.seed_example_tasks() from public, anon, authenticated;

-- Drop trigger if exists and recreate
drop trigger if exists on_auth_user_created_seed on auth.users;
create trigger on_auth_user_created_seed
  after insert on auth.users
  for each row execute function public.seed_example_tasks();
