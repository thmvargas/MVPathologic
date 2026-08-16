# PatoVetZee — Sistema Respiratório: 14 doenças novas (revisão pendente)

Primeiro lote da sua lista de aulas. Banco agora com **52 doenças**.
Sistema Respiratório saiu de 0 (não jogável) para **14** (jogável).

## O que ficou de fora deste sistema, e por quê

- **"Rinites" e "Pneumonia intersticial" por tipo de exsudato/mecanismo**
  (serosa, catarral, alérgica, tóxica...) — são classificações
  morfológicas, não entidades com etiologia/espécie/tratamento próprios.
  Mesmo critério que já discutimos para a Seção 1.
- **"Cinomose (forma respiratória)"** — não dupliquei; já existe
  `cinomose_canina` no banco (em Infecciosas Sistêmicas).
- **"Neoplasias da cavidade nasal"** (lista de ~7 tipos histológicos) e
  **"Neoplasias pulmonares"** (primárias + metastáticas) — consolidei cada
  uma em **uma ficha** representando o tipo mais comum/didaticamente
  central (adenocarcinoma nasal e adenocarcinoma pulmonar), em vez de 7+
  fichas quase idênticas nos 60 parâmetros. Se quiser as variantes
  histológicas separadas, me avise.
- **Tumor etmoidal enzoótico** (ovinos) e **Rinosporidiose** — deixei de
  fora por ora (entidades mais raras/menos centrais); fáceis de acrescentar
  depois se quiser.
- **Pneumonia granulomatosa e pneumonia parasitária/focal** (listas de
  agentes) — extraí só as entidades mais didaticamente centrais dali
  (rodococose equina, verminose pulmonar bovina); os outros agentes citados
  (Coccidioides, Blastomyces, Histoplasma etc.) ficaram de fora deste lote.

## Pontos que valem sua conferência

- **Tuberculose bovina**: marquei `tratamento_com_antimicrobianos_especificos: false`
  e `invasividade_tratamento_padrao: 0` de propósito — a conduta real no
  Brasil é abate sanitário (PNCEBT), não tratamento clínico. Achei esse o
  ponto didático mais importante da doença, mas é uma leitura que pode
  gerar debate em sala.
- **Garrotilho equino**: marquei `doenca_potencialmente_fatal_sem_tratamento: false`
  e `cura_definitiva_possivel: true` refletindo o curso típico (mortalidade
  baixa, boa recuperação) — a forma "bastarda" (disseminada) é exceção, não
  o padrão que usei.
- **Hemorragia pulmonar induzida por exercício**: marquei
  `doenca_cronica_progressiva: true` e `cura_definitiva_possivel: false`
  porque episódios repetidos causam fibrose progressiva — mas a maioria dos
  casos é subclínica e não afeta a vida do animal fora do desempenho
  atlético, só a qualidade/duração da carreira.

## Testado

Integridade do banco (52 doenças), auto-seleção de categorias e partida
completa de 14 doenças pela interface real (800/1300, 62%, sem erros).

## Próximo sistema

Segundo a prioridade combinada (sistemas mais vazios primeiro), o próximo
seria **Cardiovascular** (hoje só 1 doença) ou **Reprodutor** (hoje só 1).
Posso seguir para um desses agora, ou você prefere outra ordem?
