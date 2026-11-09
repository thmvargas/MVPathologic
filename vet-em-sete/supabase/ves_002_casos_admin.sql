-- =============================================================================
-- Vet em Sete — migração 002: casos, diagnósticos e professores no banco
-- -----------------------------------------------------------------------------
-- Permite editar casos, diagnósticos e a agenda do caso do dia pelo painel de
-- administração, sem mexer no código. Mesmo padrão de segurança da 001: RLS
-- ligado e nenhuma política (só o servidor, com a chave service_role, acessa).
-- Os casos NUNCA podem ser lidos pelo navegador: contêm o gabarito.
--
-- Como usar: Supabase → SQL Editor → New query → cole este arquivo → Run.
-- Depois, no jogo: Administração → Casos → "Importar do repositório".
-- =============================================================================

create table if not exists public.ves_diagnosticos (
  id text primary key,
  nome text not null,
  dados jsonb not null,                       -- objeto completo (sinônimos, sistemas, categoria, agente)
  atualizado_em timestamptz not null default now(),
  atualizado_por text
);
alter table public.ves_diagnosticos enable row level security;

create table if not exists public.ves_casos (
  id text primary key,
  status text not null check (status in ('rascunho', 'em_revisao', 'revisado', 'arquivado')),
  uso text not null default 'diario' check (uso in ('diario', 'treino')),
  versao integer not null default 1,
  conteudo jsonb not null,                    -- caso completo (esquema em src/lib/caso/esquema.ts)
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  atualizado_por text
);
alter table public.ves_casos enable row level security;

-- Cada versão salva de um caso. Partidas em andamento continuam na versão em
-- que começaram, mesmo que o caso seja editado depois.
create table if not exists public.ves_casos_historico (
  caso_id text not null,
  versao integer not null,
  conteudo jsonb not null,
  salvo_em timestamptz not null default now(),
  salvo_por text,
  primary key (caso_id, versao)
);
alter table public.ves_casos_historico enable row level security;

-- Professores convidados pelo painel (somam-se aos da variável PROFESSOR_EMAILS)
create table if not exists public.ves_professores (
  email text primary key check (email = lower(email)),
  adicionado_por text,
  criado_em timestamptz not null default now()
);
alter table public.ves_professores enable row level security;

-- Fim. Em Table Editor devem aparecer ves_diagnosticos, ves_casos,
-- ves_casos_historico e ves_professores, todas com RLS ligado.
