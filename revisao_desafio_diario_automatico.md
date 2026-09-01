# PatoVetZee — Desafio diário virou automático (correção de bug)

## O problema relatado

"O desafio diário não está funcionando, consta como desafio já realizado."

## Causa raiz

`DESAFIO_DO_DIA` era um objeto **fixo no código**, publicado manualmente
(trocando `id`/`data`/conteúdo a cada dia). A última publicação foi em
07/08/2026, fixando `id: "2026-08-13"` — e ninguém trocou desde então.
Hoje é 31/08/2026: **18 dias parado**.

O progresso do aluno é salvo no navegador (localStorage) numa chave
indexada por `desafio.id` (`patovetzee_progresso_<id>`), e a tela inicial
checa "já jogou hoje?" comparando com esse mesmo `id`. Como o `id` nunca
mudava, quem jogou uma vez a partir de 13/08 ficou preso em "Você já jogou
o desafio de hoje" para sempre — o app nunca "trocava de dia" do próprio
ponto de vista.

## A correção

`DESAFIO_DO_DIA` agora é **gerado automaticamente** todo carregamento da
página, a partir da data de hoje (`gerarDesafioDiario()`, seção 2 de
`patovetzee.html`):

- Sorteia 9 doenças de todo o banco (ids ordenados alfabeticamente antes
  de embaralhar, pra não depender da ordem em que o banco embutido ou o
  Supabase lista as doenças) + 9 categorias, usando a mesma busca gulosa
  já usada no Modo por Sistemas e no Duelo 1v1
  (`escolherCategoriasAutomaticamente` — maximiza a pontuação húngara
  alcançável).
- A seed é a própria data (`"AAAA-MM-DD"`), então **todo mundo cai no
  mesmo sorteio no mesmo dia**, em qualquer navegador — sem coordenação
  nenhuma.
- `id`/`data` = a data de hoje, então o "dia" agora avança sozinho à
  meia-noite. Progresso salvo de dias antigos simplesmente não bate mais
  com o `id` de hoje e para de bloquear ninguém.
- Sem explicações curadas por padrão — a tela de resultado já cai
  automaticamente no gerador de texto genérico (`gerarExplicacaoAutomatica`),
  igual já acontecia no Modo por Sistemas e no Duelo.
- `init()` regenera esse valor depois que o banco remoto e o catálogo de
  categorias terminam de carregar do Supabase (o primeiro sorteio, feito
  na hora do carregamento da página, usa o banco embutido só pra não
  deixar a tela em branco).

**Curadoria manual continua possível** para desafios temáticos pontuais
(ex.: focar num assunto de aula), via o novo `DESAFIOS_MANUAIS[data]` —
tem prioridade sobre o sorteio automático só naquele dia. Documentado no
`GUIA_MANUTENCAO.md`, seção 3.

## Efeito colateral corrigido de brinde

O aviso ao tentar excluir uma doença do desafio de hoje (painel de admin)
e a checagem de segurança que evita trocar pro banco remoto se ele estiver
incompleto também foram atualizados — ambos citavam "DESAFIO_DO_DIA fixo
no código", que não existe mais.

## Testado

- `node --check` no script extraído: sintaxe OK.
- Lógica isolada em Node: mesma data → mesmo sorteio (determinismo);
  data diferente → `id` diferente e sorteio diferente; as 9 doenças
  sorteadas sempre existem no banco, sem duplicatas; 9 categorias sem
  duplicatas.
- No navegador (banco real, 209 doenças, com Supabase configurado):
  título "Desafio diário — rodada #27" (31/08/2026, 26 dias após o
  lançamento em 05/08/2026 = rodada 27, confere).
- Reprodução exata do bug relatado: simulei uma chave de progresso antiga
  (`patovetzee_progresso_2026-08-13` = completo) no localStorage — a tela
  inicial **não** ficou presa em "já jogado", mostrou "Começar desafio de
  hoje" normalmente. Depois simulei a chave de **hoje** completa — aí sim
  mostrou corretamente "Você já jogou o desafio de hoje" com a pontuação
  salva.
- Partida completa pela interface real (modo convidado, Supabase
  temporariamente desligado só pra testar sem exigir login): 9/9 doenças
  alocadas, explicações automáticas geradas corretamente pra cada par
  (Sim/Não e nota gradual), resultado final 400/900 (44%), alocação ótima
  teórica exibida, sem erros no console.

## Não precisa rodar nenhuma migração

Essa correção é só lógica do lado do cliente (`patovetzee.html`) — não mexe
em nenhuma tabela do Supabase. Só precisa do deploy do HTML.
