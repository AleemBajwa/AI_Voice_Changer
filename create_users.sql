create table if not exists users (
  id uuid primary key references auth.users on delete cascade,
  credits int default 10
);
