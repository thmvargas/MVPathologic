# PatoVetZee — Sistema Endócrino: mais 5 doenças (revisão pendente)

Banco foi de 200 → **200 doenças** (a contagem já inclui este lote: era
196, saiu 1 genérica, entraram 5 novas). Endócrino saiu de 16 para **20**.

## O que mudou

- **Diabetes insipidus canina** (a ficha genérica única) foi **removida** e
  virou duas fichas distintas:
  - **Diabetes insipidus central** — deficiência de ADH por disfunção
    hipotálamo-hipofisária; responde bem à desmopressina.
  - **Diabetes insipidus nefrogênica** — insensibilidade renal ao ADH
    (congênita ou secundária); **não** responde à desmopressina — esse é o
    diferencial-chave entre as duas, e agora dá pra explorar isso no jogo.
- **Bócio** (bovina) — hiperplasia tireoidiana por deficiência de iodo,
  clássico em bezerros de regiões com solo pobre em iodo.
- **Hiperparatireoidismo nutricional** (canina) — secundário a dieta
  desbalanceada (ex.: dieta só de carne em filhote em crescimento).
  Diferente da **osteodistrofia fibrosa equina** já cadastrada no sistema
  Musculoesquelético (que é o mesmo mecanismo — hiperparatireoidismo
  secundário nutricional — só que em equinos, a "bran disease"). Não
  dupliquei: mantive as duas como entidades de espécies diferentes.
- **Hiperparatireoidismo renal** (canina) — secundário à doença renal
  crônica. Junto com o primário e o nutricional já cadastrados, agora o
  jogo tem o "trio completo" de hiperparatireoidismo (primário/adenoma,
  nutricional/dieta, renal/DRC) — um dos conjuntos mais ricos pra
  diferencial do banco.

## Nota técnica: outra categoria "invisível" corrigida

Achei mais um efeito da categoria **"Doença metabólica"** que você criou
pelo painel: ela existia nos dados das doenças (graças à correção do lote
anterior), mas **não no catálogo estático do arquivo** — só era reconhecida
quando o Supabase respondia. Corrigi adicionando ela também em
`CATALOGO_PARAMETROS` no HTML, então agora o banco embutido (plano B) fica
100% autoconsistente mesmo sem internet nenhuma. Se você editar o
label/tema dela pelo painel no futuro, essa parte específica do arquivo
não atualiza sozinha — é só uma cópia estática de segurança.

## Testado

`validarBancoDoencas()` OK (200 doenças, 61 parâmetros, sem "chave
desconhecida"), 4 sorteios do Modo por Sistemas "Endócrino" via
`resolverAlocacaoOtima()` com pontuação ótima perfeita (900/900), e uma
partida completa pela interface real (400/900, 44%, sem erros de console).

## Passo seu (Supabase)

Te mandei `supabase_atualizar_diabetes_insipidus_e_mais.sql` — ele apaga a
`diabetes_insipidus_canina` antiga da tabela remota e insere as 5 novas.
Precisa rodar isso pra turma ver essa mudança de verdade (mesma lógica do
lote anterior: o jogo prioriza o Supabase sobre o arquivo).
