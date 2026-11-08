-- =============================================================================
-- Vet em Sete — migração 001: perfis, partidas e caso do dia
-- -----------------------------------------------------------------------------
-- Mesmo projeto Supabase do PatoVetZee, mas com tabelas PRÓPRIAS (prefixo
-- ves_). Nada aqui altera as tabelas do PatoVetZee ou do Patológical.
--
-- Segurança: as tabelas ficam com RLS ligado e SEM nenhuma política. Isso
-- quer dizer que ninguém consegue ler ou gravar nelas pela chave pública
-- (anon) que está no navegador. Só o servidor do Vet em Sete, usando a chave
-- service_role (que fica só na Vercel), acessa. É o que impede um aluno de
-- forjar pontuação ou de ver o e-mail dos colegas.
--
-- Como usar: Supabase → SQL Editor → New query → cole este arquivo → Run.
-- Pode rodar mais de uma vez sem problema.
-- =============================================================================

-- 1. Perfis -------------------------------------------------------------------
create table if not exists public.ves_perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nome text not null check (char_length(nome) between 3 and 120),
  apelido text not null check (char_length(apelido) between 2 and 24),
  semestre smallint check (semestre between 1 and 6),       -- nulo para professor
  turma text check (char_length(turma) <= 40),
  instituicao text not null default 'UNIFEOB',
  papel text not null default 'aluno' check (papel in ('aluno', 'professor')),
  aceite_privacidade_em timestamptz not null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create unique index if not exists ves_perfis_apelido_idx on public.ves_perfis (lower(apelido));
alter table public.ves_perfis enable row level security;

-- 2. Caso do dia --------------------------------------------------------------
-- Uma linha por data (horário de Brasília). Se o professor agendar, a linha
-- já existe; se não, o servidor sorteia e grava na primeira visita do dia.
create table if not exists public.ves_caso_do_dia (
  data date primary key,
  caso_id text not null,
  agendado boolean not null default false,
  criado_em timestamptz not null default now()
);
alter table public.ves_caso_do_dia enable row level security;

-- 3. Partidas -----------------------------------------------------------------
create table if not exists public.ves_partidas (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  caso_id text not null,
  caso_versao integer not null,
  modo text not null check (modo in ('diario', 'semestre', 'treino', 'arquivo')),
  data_caso date not null,                    -- data (Brasília) em que a partida começou
  grupo_especie text not null,
  sistema text not null,
  semestre_caso smallint not null,
  acoes jsonb not null default '[]',          -- palpites, exames, pulos e tratamento, em ordem
  finalizada boolean not null default false,
  acertou boolean,
  tentativa_acerto smallint,
  pontos_total integer,
  pontos jsonb,                               -- detalhe item a item
  conta_ranking boolean not null default false,
  iniciada_em timestamptz not null default now(),
  atualizada_em timestamptz not null default now(),
  finalizada_em timestamptz
);
-- Uma partida oficial do caso do dia por aluno por dia
create unique index if not exists ves_partidas_diario_unico
  on public.ves_partidas (user_id, data_caso) where modo = 'diario';
create index if not exists ves_partidas_user_idx on public.ves_partidas (user_id, iniciada_em desc);
create index if not exists ves_partidas_data_idx on public.ves_partidas (data_caso);
alter table public.ves_partidas enable row level security;

-- Fim. Confira em Table Editor: devem aparecer ves_perfis, ves_caso_do_dia
-- e ves_partidas, todas com o cadeado "RLS enabled".
