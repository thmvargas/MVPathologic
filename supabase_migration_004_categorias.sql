-- =============================================================================
-- PatoVetZee — migração 004: categorias (parâmetros) criadas pelo painel de admin
-- -----------------------------------------------------------------------------
-- Pré-requisito: migração 002 (usa is_admin) e 003.
--
-- As ~60 categorias originais continuam embutidas no código
-- (CATALOGO_PARAMETROS, em patovetzee.html) — esta tabela só guarda as que
-- forem criadas DEPOIS, pelo painel de administração. É por isso que ela
-- nasce vazia; nada a migrar aqui.
--
-- Como usar: abra o SQL Editor do seu projeto Supabase, cole este arquivo
-- inteiro e rode. Não tem passo manual depois.
-- =============================================================================

create table public.categorias (
  id text primary key,                          -- mesmo id usado no jogo (ex.: "requer_biopsia_pele")
  grupo text not null check (grupo in ('binario', 'gradual')),
  label text not null,                           -- texto exibido pro jogador
  grupo_tematico text not null,                  -- uma das 8 seções já usadas (etiologia, transmissao, etc.)
  criterio_referencia text,                      -- só pra categorias graduais: o que 0 e 100 significam
  criado_em timestamptz not null default now()
);

alter table public.categorias enable row level security;

-- Qualquer pessoa lê (o catálogo de categorias é conteúdo do jogo, não é
-- sensível) — é o que permite todo mundo (inclusive o Modo por Sistemas e
-- o Duelo) sortear as categorias novas também, não só o admin.
create policy "categorias_leitura_publica"
  on public.categorias for select
  using (true);

-- Só admin cria/edita/apaga categorias.
create policy "categorias_admin_insere"
  on public.categorias for insert
  with check (exists (select 1 from public.perfis where id = auth.uid() and is_admin = true));

create policy "categorias_admin_atualiza"
  on public.categorias for update
  using (exists (select 1 from public.perfis where id = auth.uid() and is_admin = true))
  with check (exists (select 1 from public.perfis where id = auth.uid() and is_admin = true));

create policy "categorias_admin_apaga"
  on public.categorias for delete
  using (exists (select 1 from public.perfis where id = auth.uid() and is_admin = true));

grant select on public.categorias to anon, authenticated;
grant insert, update, delete on public.categorias to authenticated;

-- -----------------------------------------------------------------------------
-- Fim da migração 004.
-- -----------------------------------------------------------------------------
