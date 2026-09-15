-- =============================================================================
-- PatoVetZee — migração 005: e-mail dos alunos visível só pro professor
-- -----------------------------------------------------------------------------
-- Pré-requisito: migração 002 (cria a coluna is_admin em public.perfis).
--
-- Por que uma tabela nova, e não uma coluna em `perfis`? `perfis` é de
-- leitura PÚBLICA (a policy "perfis_leitura_publica" usa `using (true)`) —
-- é o que faz o apelido aparecer pra qualquer um no ranking e no duelo,
-- mesmo sem login. Um e-mail nunca pode morar numa tabela com essa policy:
-- como a anon key já está embutida no patovetzee.html, qualquer pessoa
-- conseguiria listar o e-mail de todo mundo direto pela API do Supabase,
-- sem nem passar pelo código do jogo. RLS do Postgres é por LINHA, não por
-- coluna — não dá pra "deixar só o apelido público" dentro da mesma tabela
-- que tem o e-mail. Por isso: tabela separada, com sua própria policy
-- restrita a (o próprio usuário) OU (quem tem is_admin=true).
--
-- Como usar: cole este arquivo inteiro no SQL Editor do Supabase e rode.
-- =============================================================================

create table public.perfis_contato (
  id uuid primary key references public.perfis(id) on delete cascade,
  email text not null,
  atualizado_em timestamptz not null default now()
);

alter table public.perfis_contato enable row level security;

-- Só o próprio usuário (autoatendimento) ou um admin (professor, pro painel
-- de acompanhamento) pode ler o e-mail — nunca é público.
create policy "perfis_contato_leitura_proprio_ou_admin"
  on public.perfis_contato for select
  using (
    auth.uid() = id
    or exists (select 1 from public.perfis where id = auth.uid() and is_admin = true)
  );

-- Só o próprio usuário pode criar/atualizar o próprio e-mail de contato
-- (acontece uma vez, no cadastro — ver renderEscolherApelido() em
-- patovetzee.html, seção 10).
create policy "perfis_contato_usuario_insere_o_proprio"
  on public.perfis_contato for insert
  with check (auth.uid() = id);

create policy "perfis_contato_usuario_atualiza_o_proprio"
  on public.perfis_contato for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Backfill: preenche o e-mail de quem já tinha conta ANTES desta migração,
-- lendo direto de auth.users (só acessível com privilégio elevado — funciona
-- rodando este arquivo no SQL Editor, que executa como dono do banco, não
-- com a anon key). Alunos que se cadastrarem DEPOIS desta migração já têm o
-- e-mail salvo automaticamente pelo próprio jogo no momento do cadastro.
insert into public.perfis_contato (id, email)
select u.id, u.email
from auth.users u
join public.perfis p on p.id = u.id
on conflict (id) do update set email = excluded.email, atualizado_em = now();
