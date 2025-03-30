-- Remover a tabela se ela já existir
drop table if exists "public"."questoes_erros_reportados";

create table "public"."questoes_erros_reportados" (
    "id" uuid not null default gen_random_uuid(),
    "questao_id" text not null references public.questoes(id) on delete cascade,
    "descricao" text not null,
    "status" text not null default 'pendente'::text,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
);

alter table "public"."questoes_erros_reportados" enable row level security;

create policy "Usuários autenticados podem ver erros reportados"
on public.questoes_erros_reportados for select
to authenticated
using (true);

create policy "Admins podem gerenciar erros reportados"
on public.questoes_erros_reportados for all
to authenticated
using (
    exists (
        select 1
        from public.profiles
        where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
)
with check (
    exists (
        select 1
        from public.profiles
        where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
);

create policy "Usuários podem reportar erros"
on public.questoes_erros_reportados for insert
to authenticated
with check (true); 