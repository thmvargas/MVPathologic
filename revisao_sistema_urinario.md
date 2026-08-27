# PatoVetZee — Sistema Urinário: 9 doenças novas (revisão pendente)

Banco foi de 200 → **209 doenças**. Urinário saiu de 3 para **12** —
deixou de ser o sistema mais esparso do jogo.

## As 9 doenças (das 12 candidatas sugeridas, você escolheu estas)

- **Cistite idiopática felina (FLUTD)** — inflamação vesical sem infecção
  confirmada, causa mais comum de sinais urinários em gatos jovens/meia-
  idade.
- **Obstrução uretral felina** — emergência clássica em gatos machos,
  ligada à FLUTD/urolitíase. Modelei como uma entidade separada da
  cistite idiopática (mesmo estando frequentemente relacionadas na
  prática) porque o manejo — desobstrução de emergência — e a gravidade
  são completamente diferentes.
- **Urolitíase canina** (struvita/oxalato de cálcio).
- **Cistite bacteriana canina** — infecção do trato urinário inferior,
  contraste direto com a cistite idiopática felina (bacteriana vs.
  idiopática).
- **Pielonefrite** — modelei como **felina**, pra dar contraste com a
  pielonefrite bovina (item 12) e não repetir espécie com a cistite
  bacteriana (que fiz canina).
- **Poliquistose renal (PKD)** — felina, genética, clássica em Persas.
- **Carcinoma de células transicionais** (bexiga) — canina, a neoplasia
  vesical mais comum em cães idosos, localização trigonal dificulta
  ressecção completa.
- **Urolitíase obstrutiva** — modelei como **ovina** (pequenos
  ruminantes), já que você pediu "pequenos ruminantes/bovinos" e essa é a
  apresentação mais didaticamente citada (machos castrados jovens de
  engorda, flexura sigmoide).
- **Pielonefrite bovina** (*Corynebacterium renale*).

## Não incluídas desta vez (você não pediu, ficam como candidatas)

Incontinência urinária por incompetência do esfíncter (fêmeas
castradas), amiloidose renal (Shar-Pei/Abissínio) e displasia renal
congênita — ficam disponíveis se quiser um lote futuro.

## Testado

`validarBancoDoencas()` OK (209 doenças, 61 parâmetros, sem chave
desconhecida), 4 sorteios do Modo por Sistemas "Urinário" via
`resolverAlocacaoOtima()` com pontuação ótima perfeita (900/900), e uma
partida completa pela interface real (400/900, 44%, sem erros de
console).

## Passo seu (Supabase)

Te mandei `supabase_adicionar_doencas_urinarias.sql` — insere essas 9
doenças na tabela remota. Precisa rodar pra turma ver de verdade (mesma
lógica dos lotes anteriores).
