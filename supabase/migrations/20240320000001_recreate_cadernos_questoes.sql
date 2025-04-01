-- Primeiro, remova as tabelas e funções existentes
drop trigger if exists update_caderno_total_questions_trigger on public.questoes_caderno;
drop function if exists public.update_caderno_total_questions();
drop table if exists public.questoes_caderno cascade;
drop table if exists public.cadernos_questoes cascade;

-- Create the cadernos_questoes table
create table if not exists public.cadernos_questoes (
    id uuid default gen_random_uuid() primary key,
    nome text not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    is_public boolean default false,
    total_questions integer default 0,
    answered_questions integer default 0,
    correct_answers integer default 0,
    wrong_answers integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create the questoes_caderno table (junction table)
create table if not exists public.questoes_caderno (
    id uuid default gen_random_uuid() primary key,
    caderno_id uuid references public.cadernos_questoes(id) on delete cascade not null,
    questao_id text references public.questoes(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(caderno_id, questao_id)
);

-- Enable RLS
alter table public.cadernos_questoes enable row level security;
alter table public.questoes_caderno enable row level security;

-- Create policies for cadernos_questoes
create policy "Users can view their own notebooks"
    on public.cadernos_questoes
    for select
    using (auth.uid() = user_id or is_public = true);

create policy "Users can create their own notebooks"
    on public.cadernos_questoes
    for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own notebooks"
    on public.cadernos_questoes
    for update
    using (auth.uid() = user_id);

create policy "Users can delete their own notebooks"
    on public.cadernos_questoes
    for delete
    using (auth.uid() = user_id);

-- Create policies for questoes_caderno
create policy "Users can view questions in their notebooks"
    on public.questoes_caderno
    for select
    using (
        auth.uid() = user_id or 
        exists (
            select 1 from public.cadernos_questoes
            where id = caderno_id and is_public = true
        )
    );

create policy "Users can add questions to their notebooks"
    on public.questoes_caderno
    for insert
    with check (
        auth.uid() = user_id and
        exists (
            select 1 from public.cadernos_questoes
            where id = caderno_id and user_id = auth.uid()
        )
    );

create policy "Users can remove questions from their notebooks"
    on public.questoes_caderno
    for delete
    using (
        auth.uid() = user_id and
        exists (
            select 1 from public.cadernos_questoes
            where id = caderno_id and user_id = auth.uid()
        )
    );

-- Create function to update total_questions
create or replace function public.update_caderno_total_questions()
returns trigger as $$
begin
    if (TG_OP = 'INSERT') then
        update public.cadernos_questoes
        set total_questions = total_questions + 1
        where id = NEW.caderno_id;
    elsif (TG_OP = 'DELETE') then
        update public.cadernos_questoes
        set total_questions = total_questions - 1
        where id = OLD.caderno_id;
    end if;
    return null;
end;
$$ language plpgsql security definer;

-- Create trigger for updating total_questions
create trigger update_caderno_total_questions_trigger
after insert or delete on public.questoes_caderno
for each row execute function public.update_caderno_total_questions(); 