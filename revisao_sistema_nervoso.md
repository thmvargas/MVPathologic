# PatoVetZee — Sistema Nervoso: 10 doenças novas (revisão pendente)

Sexto lote — o menor até agora, porque a seção "Sistema Nervoso" do seu
documento é bem mais enxuta que as anteriores (majoritariamente
malformações/processos circulatórios genéricos, doenças metabólicas/
tóxicas e um bloco pequeno de infecciosas/priônicas). Banco foi de 151 →
**161 doenças**. Nervoso saiu de 3 (só as três raivas) para **13**.

## O que ficou de fora, e por quê

- **Cinomose e as três Raivas** — já estavam no banco (cinomose em
  "Infecciosas sistêmicas", raivas no próprio Nervoso); não dupliquei.
- **Edema cerebral (vasogênico, citotóxico, hidrostático, osmótico)** —
  quatro subtipos de um processo geral de edema, sem entidade clínica
  própria cada um — excluídos pelo critério já combinado (processos
  gerais não viram ficha).
- **Herniação/conificação cerebelar e isquemia/hipóxia do SNC
  (secundárias a babesiose/CO)** — são consequências/mecanismos de
  outras condições, não doenças primárias com identidade própria; não
  entraram como fichas isoladas.
- **Concussão, contusão e hemorragia subdural/intraparenquimatosa** —
  consolidei as quatro em **uma única ficha**: "Traumatismo
  cranioencefálico (TCE)". Didaticamente costumam ser ensinadas juntas
  como um espectro de gravidade do mesmo evento (trauma), e os 60
  parâmetros ficariam quase idênticos se eu tentasse separar cada achado
  patológico em uma ficha própria.
- **Meningoencefalites bacterianas/virais/parasitárias "genéricas"**
  (classificação por tipo de infiltrado) — é um esquema de classificação,
  não uma doença; troquei por uma entidade concreta e didaticamente
  relevante que não estava explícita no texto mas está implícita nele: a
  **meningite bacteriana neonatal (sepse do potro)**, um cenário clínico
  clássico de meningoencefalite bacteriana em grandes animais.

## Pontos que mais valem sua conferência

- **Meningite bacteriana neonatal**: modelei como "sepse do potro"
  (falha de transferência de imunidade passiva → bacteremia →
  meningite) por ser o cenário mais didaticamente citado; o texto original
  só falava em "meningoencefalites bacterianas" de forma genérica, então
  essa é uma interpretação minha para dar uma ficha concreta a essa
  categoria. Se preferir um enfoque diferente (ex.: listeriose em
  ruminantes), me avise.
- **Traumatismo cranioencefálico**: como consolidei 4 itens do documento
  em 1 ficha, o prognóstico ficou "médio" (`prognostico_favoravel: true`
  mas `doenca_potencialmente_fatal_sem_tratamento: true`) — refletindo
  que a gravidade real varia muito conforme o grau da lesão, o que a
  ficha única não capta bem. Right-sizing esperado.
- **Encefalopatia hepática**: coloquei no Nervoso (pela apresentação
  clínica dominante), mas ela é consequência de doença hepática de base
  (ex.: shunt portossistêmico, cirrose — já cobertos no sistema
  Hepatobiliar). Não é duplicação, é a mesma lógica de sinais/
  complicação vs. doença de base já usada em outros lotes.
- **Scrapie**: marquei `zoonose: false` — ao contrário do EEB, não há
  evidência estabelecida de transmissão de príon de scrapie para
  humanos. Vale sua confirmação já que é um ponto sutil e frequentemente
  mal-entendido.
- **Leucoencefalomalácia equina**: marquei `doenca_fungica: true` mesmo
  sendo tecnicamente uma **micotoxicose** (fumonisina B1, produzida por
  Fusarium) e não uma infecção fúngica ativa — segui a mesma convenção
  usada antes para outras micotoxicoses no banco. Se preferir tratar
  micotoxicoses como categoria à parte no futuro, é um ajuste possível.

## Testado

Integridade do banco (161 doenças), contagem por sistema confirmada via
`contarDoencasPorSistema()` (Nervoso 13), e partida completa pela
interface real: 400/1300 (31% da pontuação ótima), sem erros de console.

## Próximo sistema

Só falta um sistema esparso: **Tegumentar** (hoje 4). Me diga se quer
seguir com ele.
