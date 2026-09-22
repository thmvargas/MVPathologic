-- =============================================================================
-- Patological — migração 001: tabelas do jogo (banco de doenças + tentativas)
-- -----------------------------------------------------------------------------
-- Mesmo projeto Supabase do PatoVetZee (login e a tabela `perfis` são
-- COMPARTILHADOS — um aluno com conta no PatoVetZee já entra logado aqui
-- também), mas estas duas tabelas são PRÓPRIAS do Patological, sem
-- relação nenhuma com `doencas`/`resultados`/`tentativas` do outro jogo.
--
-- Pré-requisito: o schema do PatoVetZee já precisa existir (usa a tabela
-- `perfis` e a coluna `is_admin` dela, criadas em supabase_schema.sql e
-- supabase_migration_002_doencas.sql).
--
-- Como usar: cole este arquivo inteiro no SQL Editor do Supabase e rode.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. PATOLOGICAL_DOENCAS — banco de doenças deste jogo (leitura pública,
--    escrita só admin — mesmo padrão de RLS da tabela `doencas`)
-- -----------------------------------------------------------------------------
create table public.patological_doencas (
  id text primary key,
  nome text not null,
  especie text not null,
  sistema text not null,
  categorias text[] not null default '{}',
  zoonose boolean not null default false,
  contagiosa boolean not null default false,
  letalidade smallint not null check (letalidade between 0 and 100),
  cura boolean not null default false,
  reversibilidade smallint not null check (reversibilidade between 0 and 100),
  criado_em timestamptz not null default now()
);

alter table public.patological_doencas enable row level security;

create policy "patological_doencas_leitura_publica"
  on public.patological_doencas for select
  using (true);

create policy "patological_doencas_admin_insere"
  on public.patological_doencas for insert
  with check (exists (select 1 from public.perfis where id = auth.uid() and is_admin = true));

create policy "patological_doencas_admin_atualiza"
  on public.patological_doencas for update
  using (exists (select 1 from public.perfis where id = auth.uid() and is_admin = true))
  with check (exists (select 1 from public.perfis where id = auth.uid() and is_admin = true));

create policy "patological_doencas_admin_apaga"
  on public.patological_doencas for delete
  using (exists (select 1 from public.perfis where id = auth.uid() and is_admin = true));

-- -----------------------------------------------------------------------------
-- 2. PATOLOGICAL_TENTATIVAS — uma linha por desafio oficial jogado
-- -----------------------------------------------------------------------------
create table public.patological_tentativas (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  data_desafio date not null,
  doenca_alvo_id text not null,
  numero_tentativas integer not null,
  acertou boolean not null,
  tentativas jsonb not null default '[]',
  criado_em timestamptz not null default now(),
  unique (user_id, data_desafio)
);

create index patological_tentativas_data_idx on public.patological_tentativas (data_desafio);

alter table public.patological_tentativas enable row level security;

-- Cada aluno só lê/grava a própria tentativa...
create policy "patological_tentativas_usuario_le_a_propria"
  on public.patological_tentativas for select
  using (auth.uid() = user_id);

create policy "patological_tentativas_usuario_insere_a_propria"
  on public.patological_tentativas for insert
  with check (auth.uid() = user_id);

create policy "patological_tentativas_usuario_atualiza_a_propria"
  on public.patological_tentativas for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ...e o professor (is_admin=true) lê TODAS, pro futuro painel de
-- acompanhamento (mesmo padrão já usado em `tentativas` do PatoVetZee).
create policy "patological_tentativas_admin_le_todas"
  on public.patological_tentativas for select
  using (exists (select 1 from public.perfis where id = auth.uid() and is_admin = true));

-- -----------------------------------------------------------------------------
-- 3. Lote inicial de doenças (39 doenças, ~3 por sistema) — mesmo conteúdo
--    embutido em patological.html. "on conflict do nothing" torna seguro
--    rodar de novo.
-- -----------------------------------------------------------------------------
insert into public.patological_doencas (id, nome, especie, sistema, categorias, zoonose, contagiosa, letalidade, cura, reversibilidade) values
('papilomatose_bovina', 'Papilomatose bovina', 'Bovina', 'sistema_tegumentar', '{infecciosa_viral}', false, true, 2, true, 10),
('mastocitoma_canino', 'Mastocitoma cutâneo canino', 'Canina', 'sistema_tegumentar', '{neoplasica}', false, false, 40, true, 45),
('dermatite_atopica_canina', 'Dermatite atópica canina', 'Canina', 'sistema_tegumentar', '{imunomediada,congenita_genetica}', false, false, 2, false, 55),

('parvovirose_canina', 'Parvovirose canina', 'Canina', 'sistema_digestorio', '{infecciosa_viral}', false, true, 85, true, 20),
('volvulo_gastrico_canino', 'Síndrome de dilatação-vólvulo gástrico', 'Canina', 'sistema_digestorio', '{traumatica_mecanica}', false, false, 95, true, 15),
('febre_aftosa_bovina', 'Febre aftosa', 'Bovina', 'sistema_digestorio', '{infecciosa_viral}', false, true, 15, false, 35),

('cirrose_hepatica_canina', 'Cirrose hepática', 'Canina', 'sistema_hepatobiliar', '{degenerativa}', false, false, 65, false, 90),
('leptospirose_canina', 'Leptospirose canina', 'Canina', 'sistema_hepatobiliar', '{infecciosa_bacteriana}', true, true, 55, true, 35),
('lipidose_hepatica_felina', 'Lipidose hepática felina', 'Felina', 'sistema_hepatobiliar', '{metabolica_endocrina}', false, false, 65, true, 30),

('insulinoma_canino', 'Insulinoma', 'Canina', 'sistema_pancreatico', '{neoplasica,metabolica_endocrina}', false, false, 55, false, 45),
('cetoacidose_diabetica_canina', 'Cetoacidose diabética', 'Canina', 'sistema_pancreatico', '{metabolica_endocrina}', false, false, 65, true, 20),
('insuficiencia_pancreatica_exocrina_canina', 'Insuficiência pancreática exócrina (IPE)', 'Canina', 'sistema_pancreatico', '{congenita_genetica,degenerativa}', false, false, 15, false, 70),

('garrotilho_equino', 'Garrotilho equino', 'Equina', 'sistema_respiratorio', '{infecciosa_bacteriana}', false, true, 15, true, 20),
('hemiplegia_laringea_equina', 'Hemiplegia laríngea equina ("roarer")', 'Equina', 'sistema_respiratorio', '{degenerativa}', false, false, 5, false, 85),
('tuberculose_bovina', 'Tuberculose bovina', 'Bovina', 'sistema_respiratorio', '{infecciosa_bacteriana}', true, true, 50, false, 75),

('dirofilariose_canina', 'Dirofilariose canina', 'Canina', 'sistema_cardiovascular', '{infecciosa_parasitaria}', false, true, 55, true, 55),
('cardiomiopatia_dilatada_canina', 'Cardiomiopatia dilatada', 'Canina', 'sistema_cardiovascular', '{degenerativa,congenita_genetica}', false, false, 70, false, 80),
('persistencia_ducto_arterioso_canina', 'Persistência do ducto arterioso (PDA)', 'Canina', 'sistema_cardiovascular', '{congenita_genetica}', false, false, 60, true, 45),

('drc_felina', 'Doença renal crônica felina', 'Felina', 'sistema_urinario', '{degenerativa}', false, false, 65, false, 85),
('obstrucao_uretral_felina', 'Obstrução uretral felina', 'Felina', 'sistema_urinario', '{traumatica_mecanica}', false, false, 75, true, 30),
('nefropatia_leishmaniose_canina', 'Nefropatia da leishmaniose visceral canina', 'Canina', 'sistema_urinario', '{infecciosa_parasitaria,imunomediada}', true, true, 70, false, 70),

('piometra_canina', 'Piometra canina', 'Canina', 'sistema_reprodutor', '{infecciosa_bacteriana}', false, false, 70, true, 35),
('tumor_venereo_transmissivel_canino', 'Tumor venéreo transmissível (TVT)', 'Canina', 'sistema_reprodutor', '{neoplasica}', false, true, 8, true, 20),
('criptorquidismo_canino', 'Criptorquidismo canino', 'Canina', 'sistema_reprodutor', '{congenita_genetica}', false, false, 2, true, 40),

('displasia_coxofemoral', 'Displasia coxofemoral', 'Canina', 'sistema_musculoesqueletico', '{congenita_genetica,degenerativa}', false, false, 5, false, 75),
('osteossarcoma_canino', 'Osteossarcoma apendicular canino', 'Canina', 'sistema_musculoesqueletico', '{neoplasica}', false, false, 85, false, 85),
('laminite_equina', 'Laminite equina', 'Equina', 'sistema_musculoesqueletico', '{metabolica_endocrina,toxica}', false, false, 60, false, 80),

('raiva_canina', 'Raiva canina', 'Canina', 'sistema_nervoso', '{infecciosa_viral}', true, true, 100, false, 100),
('encefalopatia_espongiforme_bovina', 'Encefalopatia espongiforme bovina (EEB, "vaca louca")', 'Bovina', 'sistema_nervoso', '{degenerativa}', true, true, 100, false, 100),
('traumatismo_cranioencefalico_canino', 'Traumatismo cranioencefálico (TCE)', 'Canina', 'sistema_nervoso', '{traumatica_mecanica}', false, false, 55, true, 40),

('hiperadrenocorticismo_canino', 'Hiperadrenocorticismo (Cushing)', 'Canina', 'sistema_endocrino', '{metabolica_endocrina,neoplasica}', false, false, 30, false, 55),
('diabetes_mellitus_felina', 'Diabetes mellitus felina', 'Felina', 'sistema_endocrino', '{metabolica_endocrina}', false, false, 60, true, 35),
('ppid_equina', 'Disfunção da pars intermedia da hipófise (PPID, "Cushing equino")', 'Equina', 'sistema_endocrino', '{metabolica_endocrina,neoplasica}', false, false, 35, false, 60),

('linfoma_multicentrico_canino', 'Linfoma multicêntrico canino', 'Canina', 'sistema_hematopoietico_linfatico', '{neoplasica}', false, false, 90, false, 60),
('felv_felina', 'Leucemia viral felina (FeLV)', 'Felina', 'sistema_hematopoietico_linfatico', '{infecciosa_viral,neoplasica}', false, true, 60, false, 60),
('anemia_infecciosa_equina', 'Anemia infecciosa equina (AIE)', 'Equina', 'sistema_hematopoietico_linfatico', '{infecciosa_viral}', false, true, 50, false, 45),

('cinomose_canina', 'Cinomose canina', 'Canina', 'doencas_infecciosas_sistemicas', '{infecciosa_viral}', false, true, 75, false, 60),
('pif_felina', 'Peritonite infecciosa felina (PIF)', 'Felina', 'doencas_infecciosas_sistemicas', '{infecciosa_viral}', false, false, 95, true, 65),
('leishmaniose_visceral_canina', 'Leishmaniose visceral canina', 'Canina', 'doencas_infecciosas_sistemicas', '{infecciosa_parasitaria}', true, true, 80, false, 55)
on conflict (id) do nothing;
