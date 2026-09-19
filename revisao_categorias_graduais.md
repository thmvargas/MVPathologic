# PatoVetZee — 2 categorias graduadas novas (revisão pendente)

Catálogo foi de 53 binárias / 8 graduadas → 53 binárias / **10 graduadas**.
Diferente de adicionar uma doença (uma linha nova), categoria é uma
**coluna** — precisa de nota real em **todas as 215 doenças já existentes**,
senão vira uma categoria "constante" e inútil no jogo. Fiz esse trabalho
completo: as 215 doenças têm nota pensada individualmente nas duas
categorias novas, sistema por sistema.

## As 2 categorias

- **Reversibilidade da lesão** (0-100): 0 = dano totalmente reversível com
  tratamento adequado; 100 = dano estrutural permanente. Critério
  independente de letalidade/velocidade — uma doença pode matar rápido mas
  não deixar sequela nenhuma se tratada a tempo (ex.: volvo gástrico,
  reversibilidade 15), e outra pode ser branda mas deixar dano permanente
  (ex.: osteoartrite, reversibilidade 80).
- **Especificidade dos sinais clínicos** (0-100): 0 = sinais inespecíficos,
  se sobrepõem com dezenas de diferenciais; 100 = apresentação
  patognomônica. Captura "quão fácil é suspeitar só pelo quadro clínico" —
  algo que o banco não tinha antes (os campos `diagnostico_*` já existentes
  falam de COMO confirmar, não de quão distintiva é a apresentação em si).

## Critério geral usado (pra manter consistência entre sistemas)

**Reversibilidade:** doenças agudas autolimitadas/funcionais tratadas a
tempo (infecções, distúrbios metabólicos agudos corrigidos) ficaram baixas
(5-30); processos crônicos/degenerativos/fibróticos/neoplásicos e
malformações congênitas ficaram altas (65-100); dano neurológico e príons
sempre no topo (90-100, geralmente coincide com lesão irreversível mesmo
quando "curável" globalmente, como raiva).

**Especificidade:** apresentações clássicas/patognomônicas (volvo gástrico,
hemiplegia laríngea "roarer", tromboembolismo felino, PPID equina,
displasia com sinal de Ortolani) ficaram altas (70-90); quadros que só dão
sinais sistêmicos vagos (perda de peso, letargia, PU/PD) compartilhados por
dezenas de diferenciais ficaram baixas (10-25); achados incidentais/
assintomáticos (cisticercose bovina, nefrolitíase felina) ficaram nas
notas mais baixas de todas (5-10), já que não há sinal nenhum a notar.

## Testado

- `validarBancoDoencas()` OK: **215 doenças, 63 parâmetros** (53 binários +
  10 graduais), sem chave faltando/extra em nenhuma.
- Testei a seleção automática (`escolherCategoriasAutomaticamente`, usada
  no Desafio Diário/Modo por Sistemas/Duelo) em várias amostras — as
  categorias novas competem de igual pra igual com as binárias existentes e,
  quando escolhidas, produzem desafios sem categoria "constante" (testei um
  caso forçado no sistema Nervoso com as duas juntas: 825/900, 0 categorias
  constantes).
- Partida completa pela interface real (com um desafio forçado via
  `DESAFIOS_MANUAIS` só pra teste, removido depois) confirmando: rótulo
  "Reversibilidade da lesão"/"Especificidade dos sinais clínicos" aparece
  certinho na tela, pontuação bate exatamente com o valor cadastrado (ex.:
  Encefalopatia hepática → Reversibilidade da lesão = 40/100, conforme
  cadastrado), explicação automática gerada corretamente. Sem erros no
  console.
- Confirmei que a lista "Categorias existentes" no painel de Administração
  também vai mostrar as duas categorias novas (lê direto de
  `CATALOGO_PARAMETROS`, não precisa de nada extra na tabela `categorias`).

## Passo seu (Supabase)

Te mandei `supabase_adicionar_categorias_graduais.sql`. **Atenção**:
diferente das migrações anteriores, esta faz **update**, não **insert** —
ela mescla as 2 notas novas dentro de `parametros_graduais` de cada uma das
215 doenças que já existem na tabela remota (usa o operador `||` do jsonb,
que só adiciona essas 2 chaves, não apaga nada do resto). Precisa rodar pra
turma ver as categorias novas valendo de verdade.
