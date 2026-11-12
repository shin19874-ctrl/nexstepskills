-- NexStep database. Paste this whole file into Supabase -> SQL Editor -> Run.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text, full_name text, phone text,
  created_at timestamptz not null default now()
);
create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin')),
  primary key (user_id, role)
);

create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public as
$$ select exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin') $$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
create policy "profile: read own or admin" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profile: update own" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
-- Users can only read their own role. Nobody can write roles from the website.
create policy "roles: read own or admin" on public.user_roles for select using (user_id = auth.uid() or public.is_admin());

create table public.webinars (
  id uuid primary key default gen_random_uuid(),
  title text not null, description text, poster_url text, speaker text,
  event_date timestamptz, duration text,
  mode text not null default 'Online' check (mode in ('Online','Offline')),
  location text, eligibility text, requirements text,
  registration_deadline timestamptz,
  published boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null, description text, poster_url text, instructor text,
  duration text,
  mode text not null default 'Online' check (mode in ('Online','Offline','Hybrid')),
  start_date date, fee text, eligibility text, details text,
  registration_deadline timestamptz,
  published boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.internships (
  id uuid primary key default gen_random_uuid(),
  title text not null, company text, description text, poster_url text,
  responsibilities text, skills text, eligibility text, duration text,
  work_mode text not null default 'Remote' check (work_mode in ('Remote','On-site','Hybrid')),
  stipend text, deadline timestamptz,
  apply_type text not null default 'nexstep' check (apply_type in ('nexstep','external')),
  apply_link text,
  published boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.webinars (published, event_date);
create index on public.courses (published, start_date);
create index on public.internships (published, deadline);

do $$ declare t text; begin
  foreach t in array array['webinars','courses','internships'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "public can read published" on public.%I for select using (published or public.is_admin())', t);
    execute format('create policy "only admin can write" on public.%I for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- Server-side checks on every application: right user, status forced to pending, listing must be open.
create or replace function public.guard_application() returns trigger
language plpgsql security definer set search_path = public as $$
declare fk text := tg_argv[0]; opp text := tg_argv[1]; dl text := tg_argv[2]; extra text := tg_argv[3]; ok boolean;
begin
  if tg_op = 'INSERT' then
    if auth.uid() is null or new.user_id <> auth.uid() then raise exception 'Please log in to apply.'; end if;
    new.status := 'pending';
    new.email := (select email from auth.users where id = auth.uid());
    execute format('select exists (select 1 from public.%I where id = $1 and published and (%I is null or %I > now()) and %s)', opp, dl, dl, extra)
      using (to_jsonb(new) ->> fk)::uuid into ok;
    if not ok then raise exception 'Applications are closed for this opportunity.'; end if;
  end if;
  new.updated_at := now();
  return new;
end $$;

do $$ declare r record; begin
  for r in select * from (values
    ('webinar_applications','webinars','webinar_id','registration_deadline','true'),
    ('course_applications','courses','course_id','registration_deadline','true'),
    ('internship_applications','internships','internship_id','deadline','apply_type = ''nexstep''')
  ) as v(app, opp, fk, dl, extra) loop
    execute format($f$
      create table public.%1$I (
        id uuid primary key default gen_random_uuid(),
        user_id uuid not null references auth.users(id) on delete cascade,
        %3$I uuid not null references public.%2$I(id) on delete cascade,
        full_name text not null check (char_length(trim(full_name)) between 2 and 120),
        email text not null,
        phone text not null check (phone ~ '^[0-9+() -]{7,20}$'),
        college text not null check (char_length(trim(college)) between 2 and 200),
        degree text not null check (char_length(trim(degree)) between 2 and 200),
        year_of_study text not null,
        reason text not null check (char_length(trim(reason)) between 10 and 2000),
        status text not null default 'pending' check (status in ('pending','under_review','accepted','rejected')),
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now(),
        unique (user_id, %3$I)
      )$f$, r.app, r.opp, r.fk);
    execute format('create index on public.%I (user_id)', r.app);
    execute format('create index on public.%I (status)', r.app);
    execute format('alter table public.%I enable row level security', r.app);
    execute format('create policy "read own or admin" on public.%I for select using (user_id = auth.uid() or public.is_admin())', r.app);
    execute format('create policy "insert own" on public.%I for insert with check (user_id = auth.uid())', r.app);
    execute format('create policy "admin update" on public.%I for update using (public.is_admin()) with check (public.is_admin())', r.app);
    execute format('create policy "admin delete" on public.%I for delete using (public.is_admin())', r.app);
    execute format('create trigger guard before insert or update on public.%I for each row execute function public.guard_application(%L,%L,%L,%L)',
      r.app, r.fk, r.opp, r.dl, r.extra);
  end loop;
end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('posters', 'posters', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
create policy "posters: anyone can view" on storage.objects for select using (bucket_id = 'posters');
create policy "posters: admin upload" on storage.objects for insert with check (bucket_id = 'posters' and public.is_admin());
create policy "posters: admin update" on storage.objects for update using (bucket_id = 'posters' and public.is_admin());
create policy "posters: admin delete" on storage.objects for delete using (bucket_id = 'posters' and public.is_admin());
