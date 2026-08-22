-- =============================================================================
-- PatoVetZee — migração 003: acompanhamento de alunos (todos os modos) + duelos
-- -----------------------------------------------------------------------------
-- Pré-requisito: rode a migração 002 primeiro (cria a coluna is_admin em
-- perfis, usada aqui pelo painel do professor).
--
-- Como usar: abra o SQL Editor do seu projeto Supabase, cole este arquivo
-- inteiro e rode. Não tem passo manual depois — só rodar.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. TENTATIVAS — um registro por partida COMPLETADA em qualquer modo
--    (diário, modo por sistemas, duelo). É o que alimenta o painel do
--    professor. Diferente de `resultados` (que só guarda o desafio diário
--    oficial, pra manter o ranking público como já era) — esta tabela nunca
--    é lida pelo ranking público, só pelo painel de admin.
-- -----------------------------------------------------------------------------
create table public.tentativas (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  modo text not null check (modo in ('diario', 'sistema', 'duelo')),
  modo_detalhe text,                     -- ex.: "sistema_tegumentar", ou o código do duelo
  desafio_id text not null,
  total_score integer not null,
  optimal_score integer not null,
  efficiency numeric(5,2) not null,
  criado_em timestamptz not null default now()
);

create index tentativas_user_idx on public.tentativas (user_id);
create index tentativas_modo_idx on public.tentativas (modo);
create index tentativas_criado_em_idx on public.tentativas (criado_em);

alter table public.tentativas enable row level security;

-- Cada aluno só insere/lê as PRÓPRIAS tentativas diretamente...
create policy "tentativas_usuario_insere_a_propria"
  on public.tentativas for insert
  with check (auth.uid() = user_id);

create policy "tentativas_usuario_le_a_propria"
  on public.tentativas for select
  using (auth.uid() = user_id);

-- ...e o professor (is_admin=true) lê TODAS, pro painel de acompanhamento.
create policy "tentativas_admin_le_todas"
  on public.tentativas for select
  using (exists (select 1 from public.perfis where id = auth.uid() and is_admin = true));

-- Sem policy de update/delete: um registro de tentativa não muda depois de
-- salvo — mesma lógica de "sem volta" já usada em `resultados`.

-- -----------------------------------------------------------------------------
-- 2. DUELOS — duelo 1v1 assíncrono: um cria, gera um código, o outro entra
--    com o código e joga o MESMO desafio (guardado em `desafio`, fixo desde
--    a criação) na hora que quiser. Não precisa dos dois online ao mesmo
--    tempo.
-- -----------------------------------------------------------------------------
create table public.duelos (
  id bigint generated always as identity primary key,
  codigo text not null unique,                 -- código curto pra compartilhar (ex.: "7F3K9A")
  criador_id uuid not null references auth.users(id) on delete cascade,
  desafiante_id uuid references auth.users(id) on delete cascade,  -- null até alguém entrar

  desafio jsonb not null,                      -- {doencas_selecionadas, parametros_selecionados}, sorteado na criação

  criador_score integer,
  criador_optimal integer,
  criador_alocacoes jsonb,                     -- [{doencaId, categoriaId, score}], pro comparativo

  desafiante_score integer,
  desafiante_optimal integer,
  desafiante_alocacoes jsonb,

  status text not null default 'aguardando_oponente' check (status in ('aguardando_oponente', 'concluido')),
  criado_em timestamptz not null default now()
);

create index duelos_codigo_idx on public.duelos (codigo);
create index duelos_criador_idx on public.duelos (criador_id);
create index duelos_desafiante_idx on public.duelos (desafiante_id);

alter table public.duelos enable row level security;

-- Leitura: o criador, o desafiante, OU qualquer usuário logado enquanto o
-- duelo ainda não tem desafiante (pra poder achar o duelo pelo código antes
-- de entrar nele). O código em si já funciona como a "chave" de acesso —
-- não há nada sensível num duelo de patologia veterinária.
create policy "duelos_leitura"
  on public.duelos for select
  using (auth.uid() = criador_id or auth.uid() = desafiante_id or desafiante_id is null);

-- Só cria duelo em nome próprio, como criador do próprio duelo.
create policy "duelos_criador_insere"
  on public.duelos for insert
  with check (auth.uid() = criador_id);

-- Update cobre dois casos: (a) o desafiante entra (preenche desafiante_id e,
-- mais tarde, seu resultado) — precisa poder mexer numa linha onde ele AINDA
-- não é o desafiante; (b) o criador ou o desafiante salvam o próprio
-- resultado. O "with check" garante que, depois do update, quem mexeu
-- continua sendo um dos dois lados do duelo (impede setar desafiante_id pra
-- outra pessoa).
create policy "duelos_atualiza"
  on public.duelos for update
  using (auth.uid() = criador_id or auth.uid() = desafiante_id or desafiante_id is null)
  with check (auth.uid() = criador_id or auth.uid() = desafiante_id);

grant select, insert, update on public.duelos to authenticated;
grant select, insert on public.tentativas to authenticated;

-- -----------------------------------------------------------------------------
-- Fim da migração 003.
-- -----------------------------------------------------------------------------
