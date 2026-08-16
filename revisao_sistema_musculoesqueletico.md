# PatoVetZee — Sistema Musculoesquelético: 18 doenças novas (revisão pendente)

Quinto lote. Banco foi de 133 → **151 doenças**. Musculoesquelético saiu
de 3 (displasia coxofemoral, osteossarcoma apendicular canino, laminite
equina) para **21**.

## O que ficou de fora, e por quê

- **Osteíte e periostite genéricas** — processos inflamatórios ósseos
  inespecíficos, sem entidade clínica própria (excluídos pelo mesmo
  critério já combinado: só entram fichas com espécie/sinais/Dx/Tx/
  prognóstico próprios).
- **Sinovite genérica, metástases ósseas, sequestro ósseo** — mesma
  lógica: são achados/processos, não doenças com identidade própria.
- **Fibroma ossificante equino** — muito redundante com o Osteoma
  (mandíbula, equinos jovens, benigno); mantive só o Osteoma como
  representante desse par, já que ficariam quase idênticos nos 60
  parâmetros.
- **Osteomielite fúngica e viral** — mantive só a bacteriana (mais
  prevalente/didática); as outras ficam como candidatas para um lote
  futuro se você quiser aprofundar.
- **Gota e pseudogota** (depósito de uratos/fosfatos) — clinicamente mais
  relevante em aves e répteis; baixa relevância nas 5 espécies que o jogo
  cobre hoje (Canina, Felina, Bovina, Equina, Ovina), por isso deixei de
  fora.
- **Miopatia por captura** — se sobrepõe muito com a miopatia por esforço
  equina em termos de fisiopatologia e não tem tratamento/prognóstico
  muito distinto; não entrou para evitar redundância.
- **Miopatia por pressão externa (decúbito/"downer")** e **miopatia
  isquêmica por vasculite genérica** — a primeira é mais uma complicação
  transversal a várias doenças de recumbência do que uma entidade
  isolada; a segunda virou a ficha específica de **Púrpura hemorrágica
  equina**, que é a apresentação mais didaticamente reconhecida desse
  mecanismo.
- **Gangrena gasosa (Clostridium perfringens) e miosites por bactérias
  piogênicas** — mantive as duas miosites clostridiais mais clássicas e
  contrastantes (Carbúnculo sintomático bovino x Edema maligno equino);
  a gangrena gasosa ficaria muito parecida com o edema maligno nos 60
  parâmetros.
- **Miosite viral (língua azul/bluetongue)** e **miosites parasitárias
  por Sarcocystis/Cysticercus** — mantive só a Neosporose canina como
  representante de miosite parasitária (também tem componente
  neuromuscular, boa ponte com o sistema nervoso); bluetongue e as outras
  ficam como candidatas futuras.
- **Osteoporose/osteopenia genérica** — multifatorial demais (nutrição,
  inatividade, castração) para virar uma ficha com perfil clínico
  próprio; a osteodistrofia fibrosa equina cobre o caso mais didático e
  específico de perda óssea secundária.

## Pontos que mais valem sua conferência

- **Artrite por lentivírus de pequenos ruminantes**: o documento cita CAE
  (caprina), mas o jogo hoje só modela Ovina entre os pequenos
  ruminantes. Usei a forma articular da Maedi-Visna ovina — a doença
  "irmã" da CAE em ovinos (mesmo gênero de lentivírus, patologia
  análoga) — para manter a consistência de espécies do banco. Se algum
  dia você quiser adicionar "Caprina" como espécie, esta ficha poderia
  ser desdobrada ou renomeada para CAE propriamente dita.
- **Tromboembolismo arterial felino ("saddle thrombus")**: coloquei aqui
  no Musculoesquelético (pela apresentação clássica de dor/paralisia de
  membros) em vez de no Cardiovascular, já que a doença de base
  (cardiomiopatia) já está coberta por outras fichas cardiovasculares —
  quis dar ênfase à consequência musculoesquelética/vascular periférica.
  Se preferir mover para o Cardiovascular, é só avisar.
- **Musculatura dupla bovina**: modelei com prognóstico favorável e sem
  letalidade relevante, mas mencionando o principal problema clínico real
  (dificuldade de parto/distocia) apenas na explicação — os parâmetros
  binários não têm um campo específico de "predispõe a distocia", então
  fica subestimado nos números. Vale sua leitura.
- **Osteodistrofia fibrosa equina**: marquei `associada_uso_hormonios:
  true` porque a fisiopatologia passa por hiperparatireoidismo secundário
  (excesso de PTH) — é um uso "não convencional" desse campo (não é
  hormônio exógeno/terapêutico), mas segue a convenção já usada antes
  para tumores hormonalmente ativos endógenos.
- **Carbúnculo sintomático x Edema maligno**: modelei como o par mais
  didaticamente contrastante — bovino jovem/coletivo/sem ferida óbvia x
  equino/geralmente com porta de entrada (ferida, injeção IM) — mesmo
  gênero Clostridium, apresentações bem diferentes.

## Testado

Integridade do banco (151 doenças), contagem por sistema confirmada via
`contarDoencasPorSistema()` (Musculoesquelético 21), e partida completa
pela interface real: 800/2100 (38% da pontuação ótima), sem erros de
console.

## Próximo sistema

Sistemas que ainda têm pouco conteúdo: **Nervoso** (hoje 3) e
**Tegumentar** (hoje 4). Me diga por onde seguir.
