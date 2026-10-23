alter table public.classes add column if not exists teacher text;
alter table public.students add column if not exists gender text check (gender in ('F','M'));
alter table public.students add column if not exists status text not null default 'Actif' check (status in ('Actif','Inactif'));
alter table public.school_requests add column if not exists category text;
