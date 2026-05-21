-- Run this in Supabase SQL Editor

create table if not exists schemes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  week integer not null,
  date text,
  row_index integer not null default 0,
  lesson_no text,
  major_topic text,
  sub_topic text,
  objectives text,
  teaching_activities text,
  learning_activities text,
  resources text,
  references text,
  assessment text,
  remarks text,
  created_at timestamptz default now()
);

alter table schemes enable row level security;

create policy "Users can view own schemes"
  on schemes for select using (auth.uid() = user_id);

create policy "Users can insert own schemes"
  on schemes for insert with check (auth.uid() = user_id);

create policy "Users can update own schemes"
  on schemes for update using (auth.uid() = user_id);

create policy "Users can delete own schemes"
  on schemes for delete using (auth.uid() = user_id);
