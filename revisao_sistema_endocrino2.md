# PatoVetZee — Sistema Endócrino: 8 doenças novas (revisão pendente)

Você pediu insulinoma, feocromocitoma e PPID. **Insulinoma já estava no
banco** (cadastrado em Pâncreas, já que é um tumor de células das ilhotas
pancreáticas — endócrino, mas didaticamente fica junto com o resto do
pâncreas). Não dupliquei. Adicionei feocromocitoma e PPID, mais 6
sugestões que cobriam lacunas reais do sistema endócrino. Banco foi de
196 → **196 doenças** (a contagem já inclui este lote — antes deste lote
eram 188). Endócrino saiu de 8 para **16**.

## As 8 doenças novas

- **Feocromocitoma** (canina) — tumor da medula adrenal secretor de
  catecolaminas. Você pediu.
- **PPID / "Cushing equino"** (equina) — disfunção da pars intermedia da
  hipófise. Você pediu. Contraste rico com o Cushing canino já cadastrado:
  mecanismo diferente (pars intermedia vs. adrenal/hipófise anterior),
  tratamento clínico oral (pergolida) em vez de cirúrgico, e é a
  endocrinopatia mais comum em equinos idosos.
- **Hiperparatireoidismo primário** (canina) — adenoma de paratireoide,
  hipercalcemia. Bom contraste com a osteodistrofia fibrosa equina já
  cadastrada (que é hiperparatireoidismo *secundário*, nutricional).
- **Hipoparatireoidismo** (canina) — hipocalcemia grave, tetania, emergência
  aguda. Contraste direto com o hiperparatireoidismo primário.
- **Hipercalcemia da malignidade** (canina) — pseudo-hiperparatireoidismo
  paraneoplásico (PTHrP), tipicamente por linfoma ou adenocarcinoma de
  saco anal. Terceiro vértice do "trio da hipercalcemia" junto com os dois
  itens acima — didaticamente é o diferencial mais importante a descartar.
- **Carcinoma de tireoide** (canina) — ao contrário do gato (adenoma
  benigno hiperfuncionante, já cadastrado como hipertireoidismo felino),
  no cão a neoplasia de tireoide costuma ser maligna e não-funcional. Bom
  contraste de espécie.
- **Nanismo hipofisário** (canina) — deficiência congênita de GH, clássico
  em Pastor Alemão. Contraste com a acromegalia felina já cadastrada
  (excesso de GH).
- **Hiperadrenocorticismo iatrogênico** (canina) — Cushing por uso crônico
  de corticoide exógeno, clinicamente idêntico ao espontâneo mas com
  manejo e diagnóstico diferencial totalmente diferentes (retirada gradual
  do fármaco vs. tratamento do tumor).

## Ponto que mais vale sua conferência: categoria "Doença metabólica"

Percebi que você criou uma categoria nova (**Doença metabólica**) pelo
painel de Administração enquanto eu trabalhava neste lote. Marquei:

- **Hipoparatireoidismo** e **Hipercalcemia da malignidade** → `true`
  (são distúrbios metabólicos de cálcio).
- As outras 6 → `false` (são neoplasias/disfunções hormonais, não
  encaixei como "metabólicas" no sentido mais estrito — mas não tenho
  certeza do critério exato que você tinha em mente ao criar essa
  categoria). Vale você revisar essas 8 e, se quiser, os outros sistemas
  também, já que "Doença metabólica" é uma categoria nova e as ~188
  doenças anteriores foram preenchidas com `false` por padrão no momento
  em que você a criou.

## Nota técnica importante: Supabase x arquivo

Como o painel de administração já existe, o jogo carrega o banco de
doenças do Supabase (não mais só do arquivo). Editar `patovetzee.html`
sozinho não faz essas 8 doenças aparecerem pros alunos — te mandei também
`supabase_adicionar_doencas_endocrinas.sql`, que insere essas mesmas 8
doenças na tabela `doencas` do Supabase. **Precisa rodar esse arquivo**
pra elas aparecerem de verdade no jogo (o arquivo HTML só serve de plano B
caso o Supabase caia). Deixei uma nota sobre isso na seção nova do
`GUIA_MANUTENCAO.md`, pra não se perder de novo.

## Testado

Integridade do banco embutido (196 doenças, `validarBancoDoencas()` OK),
4 sorteios do Modo por Sistemas "Endócrino" via `resolverAlocacaoOtima()`
— todos com pontuação ótima perfeita (900/900) — e uma partida completa
pela interface real (600/900, 67%, sem erros de console).

## Candidatas futuras (endócrino)

Fica pra um lote futuro, se quiser: diabetes insipidus central vs.
nefrogênico como entidades separadas (hoje uma ficha genérica), cetoacidose
diabética felina (hoje só canina), hipotireoidismo congênito/cretinismo
(distinto do hipotireoidismo autoimune do adulto já cadastrado).
