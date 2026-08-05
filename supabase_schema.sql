-- =============================================================================
-- PatoVetZee — schema de login, desempenho e ranking (Supabase / Postgres)
-- -----------------------------------------------------------------------------
-- Como usar: crie um projeto no Supabase (https://supabase.com), abra
-- "SQL Editor" no painel do projeto, cole este arquivo inteiro e rode.
-- Ver SETUP_SUPABASE.md para o passo a passo completo (criação do projeto,
-- onde achar a URL e a anon key, configurações de e-mail, etc.).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. PERFIS — apelido público de cada usuário (nunca expõe e-mail)
-- -----------------------------------------------------------------------------
create table public.perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  apelido text not null unique check (char_length(apelido) between 2 and 24),
  criado_em timestamptz not null default now()
);

alter table public.perfis enable row level security;

-- Qualquer pessoa (logada ou não) pode ver apelidos — é o que aparece no
-- ranking público, não há dado sensível aqui.
create policy "perfis_leitura_publica"
  on public.perfis for select
  using (true);

-- Só o próprio usuário pode criar ou editar o seu próprio perfil.
create policy "perfis_usuario_cria_o_proprio"
  on public.perfis for insert
  with check (auth.uid() = id);

create policy "perfis_usuario_edita_o_proprio"
  on public.perfis for update
  using (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- 2. RESULTADOS — uma linha por desafio oficial completado por um usuário
-- -----------------------------------------------------------------------------
create table public.resultados (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  desafio_id text not null,              -- ex.: "2026-08-05" (mesmo id do DESAFIO_DO_DIA)
  data_desafio date not null,            -- usado para agrupar por semana/mês
  total_score integer not null,
  optimal_score integer not null,
  efficiency numeric(5,2) not null,
  criado_em timestamptz not null default now(),
  unique (user_id, desafio_id)           -- 1 resultado oficial por usuário por desafio
);

create index resultados_data_idx on public.resultados (data_desafio);
create index resultados_desafio_idx on public.resultados (desafio_id);

alter table public.resultados enable row level security;

-- Cada usuário só lê e insere os PRÓPRIOS resultados diretamente na tabela
-- (o ranking agregado, que junta todo mundo, vem das views da seção 3 — que
-- rodam com privilégio de dono da view, não do usuário, então conseguem
-- agregar entre usuários mesmo com essa RLS restritiva na tabela crua).
create policy "resultados_usuario_le_o_proprio"
  on public.resultados for select
  using (auth.uid() = user_id);

create policy "resultados_usuario_insere_o_proprio"
  on public.resultados for insert
  with check (auth.uid() = user_id);

-- Sem policy de update/delete: um resultado oficial salvo não pode ser
-- alterado depois — coerente com a regra de "sem volta" do próprio jogo.

-- -----------------------------------------------------------------------------
-- 3. RANKINGS — views agregadas (só apelido + pontuação, nunca e-mail/user_id)
-- -----------------------------------------------------------------------------
-- Métrica adotada: SOMA da pontuação nos desafios jogados no período. Isso
-- também recompensa jogar todo dia (consistência), não só acertar bem uma
-- vez. Se preferir métrica por MÉDIA de eficiência (%), é só trocar
-- "sum(r.total_score)" por "round(avg(r.efficiency), 2)" nas duas views
-- abaixo — o resto da lógica não muda.

create view public.ranking_diario as
select
  p.apelido,
  r.desafio_id,
  r.data_desafio,
  r.total_score,
  r.optimal_score,
  r.efficiency,
  rank() over (partition by r.desafio_id order by r.total_score desc) as posicao
from public.resultados r
join public.perfis p on p.id = r.user_id;

create view public.ranking_semanal as
select
  p.apelido,
  date_trunc('week', r.data_desafio)::date as inicio_semana,
  sum(r.total_score) as pontos_periodo,
  round(avg(r.efficiency), 2) as eficiencia_media,
  count(*) as desafios_jogados,
  rank() over (
    partition by date_trunc('week', r.data_desafio)
    order by sum(r.total_score) desc
  ) as posicao
from public.resultados r
join public.perfis p on p.id = r.user_id
group by p.apelido, date_trunc('week', r.data_desafio);

create view public.ranking_mensal as
select
  p.apelido,
  date_trunc('month', r.data_desafio)::date as inicio_mes,
  sum(r.total_score) as pontos_periodo,
  round(avg(r.efficiency), 2) as eficiencia_media,
  count(*) as desafios_jogados,
  rank() over (
    partition by date_trunc('month', r.data_desafio)
    order by sum(r.total_score) desc
  ) as posicao
from public.resultados r
join public.perfis p on p.id = r.user_id
group by p.apelido, date_trunc('month', r.data_desafio);

-- IMPORTANTE: por padrão (sem "security_invoker"), uma view no Postgres roda
-- com o privilégio de quem A CRIOU (você, o dono do projeto), não de quem a
-- consulta. É isso que permite essas views agregarem resultados de TODOS os
-- usuários mesmo a tabela `resultados` sendo restrita por RLS a "só o
-- próprio dono" — sem isso, o ranking ficaria vazio pra qualquer aluno que
-- não fosse o dono da linha. Não adicione "security_invoker = true" nessas
-- views, ou o ranking para de funcionar.

grant select on public.ranking_diario to anon, authenticated;
grant select on public.ranking_semanal to anon, authenticated;
grant select on public.ranking_mensal to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Fim do schema. Depois de rodar isto, veja SETUP_SUPABASE.md para os
-- próximos passos (pegar URL + anon key e configurar autenticação por e-mail).
-- -----------------------------------------------------------------------------
