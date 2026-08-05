# PatoVetZee

Jogo de puzzle diário de patologia veterinária, para uso didático em turmas
de graduação em Medicina Veterinária. Inspirado na mecânica de alocação do
[Geozee](https://geozee.earth), adaptado com um fluxo sequencial e
irreversível (as 9 doenças do dia são apresentadas uma de cada vez, em ordem
fixa, e cada escolha é definitiva).

**Jogar:** abra [`patovetzee.html`](./patovetzee.html) (ou a versão publicada
via GitHub Pages, se este repositório tiver Pages habilitado).

## Como funciona

- 9 doenças × 9 categorias clínicas objetivas (zoonose, prognóstico,
  transmissão por vetores, etc.) por desafio.
- O jogador aloca cada doença, na ordem em que é apresentada, a uma
  categoria ainda disponível — sem poder desfazer.
- No final, o jogo compara a pontuação obtida com a alocação ótima teórica
  (calculada via algoritmo húngaro/Kuhn-Munkres) e explica cada par
  doença-categoria.

## Manutenção

Para adicionar doenças novas, novas categorias, ou trocar o desafio do dia,
veja [`GUIA_MANUTENCAO.md`](./GUIA_MANUTENCAO.md) e o template pronto em
[`MODELO_NOVA_DOENCA.js`](./MODELO_NOVA_DOENCA.js).

O algoritmo húngaro usado no jogo também existe isolado em
[`hungarian.js`](./hungarian.js) (rodável via `node hungarian.js`, com
testes internos).

## Aviso

Conteúdo clínico produzido para fins didáticos, sob curadoria de um
patologista veterinário. Não deve ser usado como referência diagnóstica.
