# PatoVetZee — Revisão de conteúdo (Passo 2 do processo)

> Este documento é só para sua revisão clínica. Nada aqui ainda é o jogo — é o
> banco de dados (catálogo de parâmetros + as 9 doenças) e o desafio de exemplo
> que serão codificados no `patovetzee.html` depois que você validar.
>
> **Convenções:** `V` = verdadeiro (100 pontos) / `F` = falso (0 pontos) para
> parâmetros binários. Números 0–100 para parâmetros graduais (quanto maior,
> mais a afirmação da categoria se aplica àquela doença).
>
> Abreviações das 9 doenças usadas nas tabelas:
>
> | Sigla | Doença | Espécie (não exibida no jogo) |
> |---|---|---|
> | PIO | Piometra canina | Canina |
> | CCE | Carcinoma de células escamosas (cutâneo) | Felina (também ocorre em canina) |
> | LVC | Leishmaniose visceral canina | Canina |
> | PAR | Parvovirose canina | Canina |
> | DIR | Dirofilariose canina | Canina |
> | DIS | Displasia coxofemoral | Canina |
> | LIN | Linfoma multicêntrico canino | Canina |
> | OTI | Otite externa por *Malassezia* spp. | Canina |
> | DRC | Doença renal crônica felina | Felina |

---

## 1. Catálogo de parâmetros (60 no total)

Cada parâmetro tem: `id`, `label` (o texto exibido como categoria no jogo),
`grupo_tematico` (só organizacional) e `tipo` (`binario` ou `gradual`). Os
graduais também têm um `criterio_referencia` — a régua que usei para
atribuir o número; ela não é validada pelo código, é só documentação para
você revisar/ajustar.

### 1.1 Binários (52)

**Etiologia (7):** `zoonose`, `doenca_viral`, `doenca_bacteriana`,
`doenca_parasitaria`, `doenca_fungica`, `associada_uso_hormonios`,
`etiologia_hereditaria_genetica`

**Transmissão (5):** `transmitida_por_vetores`, `contagiosa_contato_direto`,
`transmissao_ambiental_fomites`, `transmissao_vertical_transplacentaria`,
`requer_notificacao_obrigatoria`

**Predisposição (7):** `maior_prevalencia_felinos`,
`predisposicao_racial_reconhecida`, `maior_prevalencia_animais_idosos`,
`maior_prevalencia_filhotes_jovens`, `predisposicao_femeas_nao_castradas`,
`associada_obesidade`, `maior_prevalencia_ambientes_coletivos`

**Natureza da lesão (6):** `doenca_neoplasica`, `causa_hemorragia`,
`lesao_caracteristicamente_multissistemica`,
`processo_inflamatorio_predominante`, `lesao_potencialmente_metastatica`,
`causa_alteracao_degenerativa_cronica`

**Sinais clínicos (8):** `sinais_gastrointestinais_proeminentes`,
`sinais_respiratorios_proeminentes`, `sinais_dermatologicos_proeminentes`,
`sinais_musculoesqueleticos_proeminentes`, `linfonodomegalia_frequente`,
`febre_frequente`, `sinais_sistemicos_inespecificos_comuns`,
`perda_peso_ou_caquexia_frequente`

**Diagnóstico (7):** `diagnostico_por_exame_sorologico`,
`diagnostico_por_citologia_biopsia`, `diagnostico_por_imagem_essencial`,
`diagnostico_laboratorial_bioquimico_essencial`,
`diagnostico_definitivo_requer_histopatologia`,
`teste_rapido_disponivel_rotina`, `alteracoes_hematologicas_caracteristicas`

**Tratamento (7):** `tratamento_cirurgico_indicado`,
`tratamento_quimioterapico_indicado`,
`tratamento_com_antimicrobianos_especificos`,
`tratamento_essencialmente_de_suporte`, `tratamento_topico_frequente`,
`tratamento_exclusivamente_paliativo`,
`requer_tratamento_continuo_longo_prazo`

**Prognóstico (5):** `prognostico_favoravel`,
`doenca_potencialmente_fatal_sem_tratamento`, `risco_recidiva_relevante`,
`cura_definitiva_possivel`, `doenca_cronica_progressiva`

### 1.2 Graduais (8) — com critério de referência (0–100)

| id | label | critério de referência (rascunho meu — ajuste como especialista) |
|---|---|---|
| `letalidade_nao_tratada` | Letalidade se não tratada | 0 = praticamente nunca letal sem tratamento; 100 = letalidade quase certa |
| `velocidade_progressao` | Velocidade de progressão | 0 = curso de anos; 100 = curso de horas/dias |
| `custo_complexidade_diagnostica` | Custo/complexidade diagnóstica | 0 = exame clínico/teste simples e barato; 100 = workup multi-etapas, exames de referência, alto custo |
| `impacto_qualidade_vida` | Impacto na qualidade de vida | 0 = sem impacto perceptível; 100 = comprometimento grave e constante |
| `disseminacao_ambiente_coletivo` | Grau de disseminação em ambiente coletivo | 0 = não se dissemina entre animais de um canil/gatil; 100 = disseminação explosiva |
| `relevancia_diferencial_rotina` | Relevância como diagnóstico diferencial na rotina | 0 = raramente entra como DDx; 100 = DDx obrigatório e frequente na clínica geral |
| `invasividade_tratamento_padrao` | Grau de invasividade do tratamento padrão | 0 = tratamento não invasivo (tópico/oral simples); 100 = cirurgia de grande porte/tratamento agressivo |
| `impacto_economico_tratamento` | Impacto econômico do tratamento | 0 = tratamento de baixo custo; 100 = tratamento caro e/ou prolongado |

---

## 2. Banco das 9 doenças

### 2.1 Parâmetros binários

**Etiologia**

| id | PIO | CCE | LVC | PAR | DIR | DIS | LIN | OTI | DRC |
|---|---|---|---|---|---|---|---|---|---|
| zoonose | F | F | **V** | F | F | F | F | F | F |
| doenca_viral | F | F | F | **V** | F | F | F | F | F |
| doenca_bacteriana | **V** | F | F | F | F | F | F | F | F |
| doenca_parasitaria | F | F | **V** | F | **V** | F | F | F | F |
| doenca_fungica | F | F | F | F | F | F | F | **V** | F |
| associada_uso_hormonios | **V** | F | F | F | F | F | F | F | F |
| etiologia_hereditaria_genetica | F | F | F | F | F | **V** | F | F | F |

**Transmissão**

| id | PIO | CCE | LVC | PAR | DIR | DIS | LIN | OTI | DRC |
|---|---|---|---|---|---|---|---|---|---|
| transmitida_por_vetores | F | F | **V** | F | **V** | F | F | F | F |
| contagiosa_contato_direto | F | F | F | **V** | F | F | F | F | F |
| transmissao_ambiental_fomites | F | F | F | **V** | F | F | F | F | F |
| transmissao_vertical_transplacentaria | F | F | **V** | F | F | F | F | F | F |
| requer_notificacao_obrigatoria | F | F | **V** | F | F | F | F | F | F |

**Predisposição**

| id | PIO | CCE | LVC | PAR | DIR | DIS | LIN | OTI | DRC |
|---|---|---|---|---|---|---|---|---|---|
| maior_prevalencia_felinos | F | **V** | F | F | F | F | F | F | **V** |
| predisposicao_racial_reconhecida | F | **V** | **V** | F | F | **V** | **V** | **V** | F |
| maior_prevalencia_animais_idosos | **V** | **V** | F | F | F | F | **V** | F | **V** |
| maior_prevalencia_filhotes_jovens | F | F | F | **V** | F | **V** | F | F | F |
| predisposicao_femeas_nao_castradas | **V** | F | F | F | F | F | F | F | F |
| associada_obesidade | F | F | F | F | F | **V** | F | F | F |
| maior_prevalencia_ambientes_coletivos | F | F | F | **V** | F | F | F | F | F |

**Natureza da lesão**

| id | PIO | CCE | LVC | PAR | DIR | DIS | LIN | OTI | DRC |
|---|---|---|---|---|---|---|---|---|---|
| doenca_neoplasica | F | **V** | F | F | F | F | **V** | F | F |
| causa_hemorragia | **V** | F | **V** | **V** | F | F | F | F | F |
| lesao_caracteristicamente_multissistemica | F | F | **V** | F | F | F | **V** | F | F |
| processo_inflamatorio_predominante | **V** | F | **V** | **V** | F | F | F | **V** | F |
| lesao_potencialmente_metastatica | F | **V** | F | F | F | F | **V** | F | F |
| causa_alteracao_degenerativa_cronica | F | F | F | F | F | **V** | F | F | **V** |

**Sinais clínicos**

| id | PIO | CCE | LVC | PAR | DIR | DIS | LIN | OTI | DRC |
|---|---|---|---|---|---|---|---|---|---|
| sinais_gastrointestinais_proeminentes | **V** | F | F | **V** | F | F | F | F | **V** |
| sinais_respiratorios_proeminentes | F | F | F | F | **V** | F | F | F | F |
| sinais_dermatologicos_proeminentes | F | **V** | **V** | F | F | F | F | **V** | F |
| sinais_musculoesqueleticos_proeminentes | F | F | F | F | F | **V** | F | F | F |
| linfonodomegalia_frequente | F | F | **V** | F | F | F | **V** | F | F |
| febre_frequente | **V** | F | **V** | **V** | F | F | F | F | F |
| sinais_sistemicos_inespecificos_comuns | **V** | F | **V** | **V** | F | F | **V** | F | **V** |
| perda_peso_ou_caquexia_frequente | F | F | **V** | F | F | F | **V** | F | **V** |

**Diagnóstico**

| id | PIO | CCE | LVC | PAR | DIR | DIS | LIN | OTI | DRC |
|---|---|---|---|---|---|---|---|---|---|
| diagnostico_por_exame_sorologico | F | F | **V** | F | **V** | F | F | F | F |
| diagnostico_por_citologia_biopsia | F | **V** | **V** | F | F | F | **V** | **V** | F |
| diagnostico_por_imagem_essencial | **V** | F | F | F | **V** | **V** | F | F | F |
| diagnostico_laboratorial_bioquimico_essencial | **V** | F | **V** | F | F | F | F | F | **V** |
| diagnostico_definitivo_requer_histopatologia | F | **V** | F | F | F | F | F | F | F |
| teste_rapido_disponivel_rotina | F | F | **V** | **V** | **V** | F | F | F | F |
| alteracoes_hematologicas_caracteristicas | **V** | F | **V** | **V** | **V** | F | **V** | F | F |

**Tratamento**

| id | PIO | CCE | LVC | PAR | DIR | DIS | LIN | OTI | DRC |
|---|---|---|---|---|---|---|---|---|---|
| tratamento_cirurgico_indicado | **V** | **V** | F | F | F | **V** | F | F | F |
| tratamento_quimioterapico_indicado | F | F | F | F | F | F | **V** | F | F |
| tratamento_com_antimicrobianos_especificos | **V** | F | **V** | F | **V** | F | F | **V** | F |
| tratamento_essencialmente_de_suporte | F | F | F | **V** | F | F | F | F | **V** |
| tratamento_topico_frequente | F | **V** | F | F | F | F | F | **V** | F |
| tratamento_exclusivamente_paliativo | F | F | **V** | F | F | F | **V** | F | **V** |
| requer_tratamento_continuo_longo_prazo | F | F | **V** | F | F | **V** | F | F | **V** |

**Prognóstico**

| id | PIO | CCE | LVC | PAR | DIR | DIS | LIN | OTI | DRC |
|---|---|---|---|---|---|---|---|---|---|
| prognostico_favoravel | **V** | **V** | F | **V** | **V** | **V** | F | **V** | F |
| doenca_potencialmente_fatal_sem_tratamento | **V** | F | **V** | **V** | **V** | F | **V** | F | **V** |
| risco_recidiva_relevante | F | **V** | **V** | F | F | F | **V** | **V** | F |
| cura_definitiva_possivel | **V** | **V** | F | **V** | **V** | F | F | **V** | F |
| doenca_cronica_progressiva | F | F | **V** | F | **V** | **V** | **V** | F | **V** |

### 2.2 Parâmetros graduais (0–100)

| id | PIO | CCE | LVC | PAR | DIR | DIS | LIN | OTI | DRC |
|---|---|---|---|---|---|---|---|---|---|
| letalidade_nao_tratada | 70 | 25 | 80 | 85 | 55 | 5 | 90 | 3 | 65 |
| velocidade_progressao | 60 | 30 | 35 | 90 | 25 | 20 | 75 | 50 | 30 |
| custo_complexidade_diagnostica | 40 | 50 | 55 | 30 | 45 | 35 | 60 | 20 | 45 |
| impacto_qualidade_vida | 75 | 40 | 80 | 85 | 55 | 60 | 65 | 30 | 70 |
| disseminacao_ambiente_coletivo | 5 | 0 | 20 | 95 | 15 | 0 | 0 | 25 | 0 |
| relevancia_diferencial_rotina | 70 | 55 | 60 | 80 | 50 | 65 | 60 | 85 | 75 |
| invasividade_tratamento_padrao | 85 | 60 | 20 | 45 | 55 | 70 | 50 | 15 | 30 |
| impacto_economico_tratamento | 55 | 50 | 65 | 60 | 60 | 70 | 75 | 15 | 55 |

**Nota honesta:** os números graduais acima são um rascunho meu (IA), plausível
clinicamente, mas **você precisa revisar todos** — é exatamente o ponto onde
sua régua de especialista deve prevalecer sobre a minha estimativa.

---

## 3. Desafio de exemplo

Escolhi 5 categorias binárias + 4 graduais (dentro da mistura recomendada
5–6 objetivas / 3–4 graduais), todas com boa variação entre as 9 doenças
(nenhuma categoria "óbvia" onde todo mundo dá o mesmo valor):

1. `predisposicao_racial_reconhecida` (binário)
2. `sinais_sistemicos_inespecificos_comuns` (binário)
3. `alteracoes_hematologicas_caracteristicas` (binário)
4. `cura_definitiva_possivel` (binário)
5. `doenca_cronica_progressiva` (binário)
6. `letalidade_nao_tratada` (gradual)
7. `custo_complexidade_diagnostica` (gradual)
8. `impacto_qualidade_vida` (gradual)
9. `invasividade_tratamento_padrao` (gradual)

### 3.1 Matriz de pontuação resultante (9×9)

| Doença ↓ / Categoria → | 1.Raça | 2.SistInesp | 3.Hemato | 4.Cura | 5.Crônica | 6.Letalid | 7.CustoDx | 8.QoL | 9.Invasiv |
|---|---|---|---|---|---|---|---|---|---|
| PIO | 0 | 100 | 100 | 100 | 0 | 70 | 40 | 75 | 85 |
| CCE | 100 | 0 | 0 | 100 | 0 | 25 | 50 | 40 | 60 |
| LVC | 100 | 100 | 100 | 0 | 100 | 80 | 55 | 80 | 20 |
| PAR | 0 | 100 | 100 | 100 | 0 | 85 | 30 | 85 | 45 |
| DIR | 0 | 0 | 100 | 100 | 100 | 55 | 45 | 55 | 55 |
| DIS | 100 | 0 | 0 | 0 | 100 | 5 | 35 | 60 | 70 |
| LIN | 100 | 100 | 100 | 0 | 100 | 90 | 60 | 65 | 50 |
| OTI | 100 | 0 | 0 | 100 | 0 | 3 | 20 | 30 | 15 |
| DRC | 0 | 100 | 0 | 0 | 100 | 65 | 45 | 70 | 30 |

Essa matriz tem bastante sobreposição de "candidatos fortes" nas mesmas
categorias (ex.: PIO, LVC, PAR, LIN todos com 100 em "SistInesp" e "Hemato";
LVC e LIN competem por praticamente tudo) — é essa concorrência que torna a
alocação ótima não-trivial, exatamente o efeito que você queria evitar de
não ter.

O algoritmo húngaro (implementado no próximo passo) vai calcular a alocação
ótima teórica dessa matriz; por ora note que a soma máxima teórica claramente
não é alcançável escolhendo "o valor mais alto de cada linha", já que várias
doenças disputam as mesmas colunas.

### 3.2 Explicações (81 pares doença × categoria)

**1. Predisposição racial reconhecida**
- PIO (F): não há uma raça claramente mais predisposta; qualquer fêmea intacta em idade reprodutiva está em risco.
- CCE (V): raças/pelagens claras e de pelo curto (ex. Bull Terrier, Dálmata, e a predisposição clássica em gatos de pelagem branca) têm risco reconhecidamente maior.
- LVC (V): Boxer, Rottweiler e Cocker Spaniel, entre outras, têm predisposição descrita na literatura.
- PAR (F): a suscetibilidade à infecção não é marcadamente racial, embora alguns autores associem gravidade maior a certas raças.
- DIR (F): não há predisposição racial bem estabelecida; o risco depende principalmente de exposição ao vetor.
- DIS (V): raças grandes/gigantes (Labrador, Pastor Alemão, Rottweiler) têm predisposição genética clássica e bem documentada.
- LIN (V): Boxer e Golden Retriever, entre outras, têm predisposição reconhecida a linfoma.
- OTI (V): raças com pregas cutâneas ou orelhas pendentes e predispostas à dermatite atópica (Cocker Spaniel, Basset Hound) sofrem otite por *Malassezia* com maior frequência.
- DRC (F): a DRC felina ocorre em qualquer raça, com predisposições descritas fracas e inconsistentes (ex. Persa, Abissínio) comparado às demais.

**2. Sinais sistêmicos inespecíficos comuns (letargia/anorexia)**
- PIO (V): letargia, anorexia e depressão são comuns, sobretudo na forma com colo fechado.
- CCE (F): geralmente é uma lesão localizada, sem repercussão sistêmica evidente até fases avançadas.
- LVC (V): letargia e apatia crônicas são sinais centrais do quadro.
- PAR (V): prostração, anorexia e depressão intensas são características do quadro agudo.
- DIR (F): muitos cães permanecem assintomáticos ou com sinais discretos por bastante tempo.
- DIS (F): o animal costuma manter-se sistemicamente bem, com sinais restritos ao aparelho locomotor.
- LIN (V): letargia e mal-estar geral acompanham a linfadenomegalia generalizada.
- OTI (F): o quadro é localizado ao conduto auditivo, sem comprometimento do estado geral.
- DRC (V): letargia, anorexia e apatia são sinais inespecíficos muito comuns, especialmente em fases mais avançadas.

**3. Alterações hematológicas características**
- PIO (V): leucocitose com desvio à esquerda é um achado hematológico clássico de apoio diagnóstico.
- CCE (F): o hemograma costuma ser inespecífico ou normal, salvo doença sistêmica concomitante.
- LVC (V): anemia, trombocitopenia e hiperglobulinemia são achados característicos.
- PAR (V): leucopenia (linfopenia/neutropenia) é um achado hematológico marcante e usado como suporte diagnóstico.
- DIR (V): eosinofilia e/ou basofilia podem ser observadas, refletindo a resposta imune ao parasita.
- DIS (F): não há alteração hematológica característica associada a essa doença ortopédica.
- LIN (V): pode haver linfocitose atípica, ou citopenias por infiltração medular em estágios avançados.
- OTI (F): não há alteração hematológica sistêmica associada a uma otite localizada.
- DRC (F): pode haver anemia não regenerativa, mas ela não é o pilar diagnóstico (a bioquímica/urinálise é).

**4. Cura definitiva possível**
- PIO (V): a ovariohisterectomia é curativa na grande maioria dos casos.
- CCE (V): a excisão cirúrgica completa em estágio inicial costuma ser curativa.
- LVC (F): não há protocolo terapêutico validado como curativo; busca-se controle clínico e parasitário.
- PAR (V): animais que sobrevivem à fase aguda ficam curados e imunes.
- DIR (V): a terapia adulticida adequada pode eliminar os parasitas adultos e curar a infecção.
- DIS (F): é uma condição crônica e degenerativa; o manejo é paliativo/de controle, não curativo.
- LIN (F): a quimioterapia induz remissão, mas recidiva é esperada — não se trata de cura.
- OTI (V): tratando a causa predisponente e a infecção secundária, a resolução completa é comum.
- DRC (F): é uma doença crônica e progressiva sem possibilidade de reversão da lesão renal já estabelecida.

**5. Doença crônica e progressiva**
- PIO (F): é uma condição de instalação aguda a subaguda, não crônica.
- CCE (F): a evolução é gradual, mas manejável quando identificada precocemente, sem o caráter sistemicamente progressivo das demais.
- LVC (V): evolui cronicamente, com agravamento progressivo se não controlada.
- PAR (F): tem curso agudo, de dias.
- DIR (V): sem tratamento, a carga parasitária e o dano cardiopulmonar tendem a se agravar progressivamente.
- DIS (V): é uma doença degenerativa articular que se agrava ao longo da vida do animal.
- LIN (V): sem tratamento, progride rapidamente ao longo de semanas a poucos meses.
- OTI (F): tende a ser recorrente, mas cada episódio não é, por si, um processo cronicamente progressivo.
- DRC (V): é definida clinicamente pela perda progressiva e irreversível da função renal.

**6. Letalidade se não tratada (gradual)**
- PIO — 70: risco relevante de sepse, peritonite (se ruptura uterina) e óbito se não tratada a tempo.
- CCE — 25: costuma ser localmente agressivo, mas raramente causa morte direta sem metástase.
- LVC — 80: tem alta letalidade em cães não tratados, por falência multiorgânica progressiva.
- PAR — 85: mortalidade elevada em filhotes não tratados, por desidratação, sepse e CID.
- DIR — 55: casos com carga parasitária elevada ou síndrome cava têm risco real de óbito.
- DIS — 5: não é uma doença letal, é uma condição ortopédica/de qualidade de vida.
- LIN — 90: sem quimioterapia, a sobrevida costuma ser de poucas semanas a meses.
- OTI — 3: quadro localizado, sem risco de vida associado.
- DRC — 65: é progressiva e eventualmente fatal, embora a progressão possa ser lenta.

**7. Custo/complexidade diagnóstica (gradual)**
- PIO — 40: ultrassonografia abdominal e hemograma geralmente bastam.
- CCE — 50: requer biópsia/histopatologia e, em casos avançados, estadiamento por imagem.
- LVC — 55: sorologia, exames complementares (proteinograma) e às vezes citologia de medula/PCR.
- PAR — 30: teste rápido de ELISA fecal é amplamente disponível e de baixo custo.
- DIR — 45: teste antigênico rápido mais radiografia/ecocardiografia para estadiamento.
- DIS — 35: radiografia com posicionamento adequado (e por vezes sedação).
- LIN — 60: citologia/biópsia com imunofenotipagem e exames de estadiamento (imagem, hemograma, mielograma).
- OTI — 20: otoscopia e citologia simples do exsudato, baixo custo.
- DRC — 45: painel bioquímico, urinálise (com densidade urinária) e, idealmente, SDMA e imagem.

**8. Impacto na qualidade de vida (gradual)**
- PIO — 75: quadro sistêmico, doloroso e potencialmente grave.
- CCE — 40: desconforto local e impacto funcional/estético variável conforme localização.
- LVC — 80: doença sistêmica crônica com impacto significativo e cumulativo no bem-estar.
- PAR — 85: quadro agudo grave, com sofrimento importante enquanto durar a doença.
- DIR — 55: intolerância a exercício e comprometimento respiratório em casos moderados a graves.
- DIS — 60: dor crônica e limitação de mobilidade afetam o bem-estar diário.
- LIN — 65: mal-estar sistêmico, embora muitos pacientes tenham boa qualidade de vida durante a remissão.
- OTI — 30: prurido/desconforto local, sem comprometer o bem-estar geral do animal.
- DRC — 70: doença sistêmica crônica com declínio progressivo do bem-estar.

**9. Grau de invasividade do tratamento padrão (gradual)**
- PIO — 85: cirurgia abdominal de urgência (ovariohisterectomia).
- CCE — 60: excisão cirúrgica, por vezes com necessidade de reconstrução.
- LVC — 20: tratamento predominantemente medicamentoso (oral/injetável), pouco invasivo fisicamente.
- PAR — 45: manejo hospitalar intensivo (fluidoterapia IV, antieméticos), invasivo em nível de suporte.
- DIR — 55: adulticida injetável com risco de complicação tromboembólica e necessidade de repouso estrito.
- DIS — 70: opções cirúrgicas (FHO, prótese de quadril) são de porte considerável quando indicadas.
- LIN — 50: protocolo quimioterápico com acessos venosos repetidos.
- OTI — 15: tratamento tópico ótico, minimamente invasivo.
- DRC — 30: manejo dietético/medicamentoso e, quando necessário, fluidoterapia subcutânea domiciliar.

### 3.3 Checagem de qualidade deste desafio (calculada manualmente aqui; o
código vai fazer isso automaticamente ao montar qualquer desafio)

- Categorias com **todas** as doenças no mesmo valor: **0 de 9** ✅ (limite de
  alerta é >3 — este desafio está bem longe disso).
- Doenças com pelo menos um valor **isoladamente mais alto** (sem empate) em
  alguma categoria escolhida: LVC e LIN se destacam com múltiplos "100"
  competindo entre si — é justamente esse conflito que torna a alocação ótima
  não-óbvia.

---

## O que eu preciso de você agora

1. Revisar clinicamente as ~540 células do banco (seção 2) — principalmente os
   **números graduais**, que são a parte mais subjetiva e onde meu palpite de
   IA tem menos autoridade que sua régua de especialista.
2. Revisar as 5 categorias binárias + 4 graduais do desafio de exemplo e as 81
   explicações (seção 3) — quero saber se alguma justificativa está errada ou
   simplificada demais para uso didático.
3. Confirmar se posso seguir para o passo 3 (algoritmo húngaro + testes
   internos) usando exatamente essa matriz 9×9 como caso de teste.

Você pode revisar direto neste arquivo (`revisao_conteudo_patovetzee.md`, na
pasta `PatoVetZee` dentro dos seus Documentos) ou me responder por aqui
apontando o que corrigir.
