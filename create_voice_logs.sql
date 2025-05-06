create table if not exists voice_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  text text,
  created_at timestamp default current_timestamp
);
