# PatoVetZee — 6 doenças renais novas (revisão pendente)

Banco foi de 209 → **215 doenças**. Sistema Urinário foi de 12 → **18**,
agora com boa cobertura tanto de bexiga/uretra quanto de rim.

## As 6 doenças (você escolheu 3, 4, 5, 6, 7 e 8 da lista de candidatos)

- **Doença renal crônica canina** — hoje só existia a versão felina
  (`drc_felina`). Diferenciei pela predisposição racial reconhecida
  (nefropatias familiares — Cocker Spaniel, Bull Terrier, Shar-Pei — algo
  que a versão felina não tem) e por citologia/biópsia entrar mais
  rotineiramente no workup canino (causas glomerulares secundárias são
  investigadas com mais frequência em cães do que em gatos).
- **Nefropatia da leishmaniose visceral canina** — causa infecciosa/
  zoonótica de glomerulonefrite por imunocomplexos, bem relevante no
  contexto brasileiro (notificação compulsória, vetor flebotomíneo).
  Contrasta com a glomerulonefrite imunomediada já existente: mesmo
  mecanismo de lesão (imunocomplexos), mas gatilho e perfil clínico bem
  diferentes (zoonose, vetor, sinais dermatológicos/linfonodomegalia
  associados à doença sistêmica de base).
- **Necrose tubular aguda por intoxicação (uva/passas, etilenoglicol)** —
  canina, contraste direto com a `necrose_tubular_aguda_felina` já
  existente (mesma síndrome — IRA tubular — mas etiologia tóxica
  explícita, com achado de imagem clássico e teste rápido disponível para
  etilenoglicol).
- **Nefrolitíase (cálculos renais)** — modelei como **felina**, pra
  contrastar com `urolitiase_canina` (que é vesical/trato baixo — a
  nefrolitíase é trato alto). Boa lacuna: é a única doença renal nova que
  frequentemente é assintomática/achado incidental (diagnóstico só por
  imagem, sem alteração bioquímica obrigatória).
- **Nefroblastoma (tumor de Wilms)** — canino, neoplasia renal de animais
  jovens. Preenche uma lacuna de localização: já tínhamos neoplasia de
  bexiga (`carcinoma_celulas_transicionais_canino`), faltava neoplasia
  renal. Bom contraste de prognóstico também: nefrectomia costuma ser
  curativa se localizado, ao contrário do carcinoma de células
  transicionais.
- **Hidronefrose** — modelei como **equina**, já que o sistema urinário
  não tinha nenhuma doença equina ainda. Mecanismo puramente
  obstrutivo/estrutural (dilatação da pelve renal por obstrução crônica),
  diferente de tudo que já estava no banco — e deliberadamente modelada
  como a apresentação unilateral mais comum (geralmente silenciosa,
  compensada pelo rim contralateral), não o caso bilateral/uretral que é
  emergência.

## Não incluídas desta vez

Amiloidose renal (Shar-Pei/Abissínio) e displasia renal congênita —
seguem como candidatas pra um lote futuro, não foram pedidas agora.

## Testado

`validarBancoDoencas()` OK (215 doenças, 61 parâmetros, sem chave
desconhecida nas 6 novas). 2 sorteios do Modo por Sistemas "Urinário" via
`resolverAlocacaoOtima()`, ambos com pontuação ótima perfeita (900/900),
cada um puxando 3 das doenças novas misturadas com as antigas — inclusive
um sorteio que colocou as duas necroses tubulares agudas (felina e canina
tóxica) juntas, e o algoritmo ainda achou alocação perfeita, confirmando
que ficaram bem diferenciadas. Uma partida completa pela interface real
(400/900, 44%, sem erros de console, explicações automáticas corretas
pros dois casos Sim/Não).

## Passo seu (Supabase)

Te mandei `supabase_adicionar_doencas_renais.sql` — insere essas 6
doenças na tabela remota. Precisa rodar pra turma ver de verdade (mesma
lógica dos lotes anteriores).
