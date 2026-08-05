/*
 * PatoVetZee — Algoritmo húngaro (Kuhn-Munkres), adaptado para MAXIMIZAÇÃO.
 *
 * Passo 3 do processo de entrega: implementar e testar isoladamente, antes de
 * plugar na interface. Este arquivo roda sozinho em Node (`node hungarian.js`)
 * e também é pensado para ser colado sem alterações dentro do <script> do
 * patovetzee.html final (seção 4 da estrutura técnica pedida).
 *
 * ESTRATÉGIA: o algoritmo clássico de Kuhn-Munkres resolve minimização de
 * custo em matriz quadrada n×n com potenciais (O(n^3)). Como o nosso jogo
 * quer MAXIMIZAR a soma de pontuação, fazemos o truque padrão: minimizamos a
 * matriz de custo = -pontuacao. O assignment que minimiza -pontuacao é
 * exatamente o que maximiza pontuacao.
 *
 * A implementação abaixo segue o algoritmo de potenciais com reconstrução de
 * caminho (a variante mais comum em referências de competitive programming,
 * ex. e-maxx), adaptada para JS 0-indexado por fora e 1-indexado por dentro
 * (mais simples de manter fiel ao algoritmo de referência).
 */

// ---------------------------------------------------------------------------
// Núcleo: minimização de custo (uso interno)
// ---------------------------------------------------------------------------

/**
 * Resolve o problema de atribuição (assignment problem) minimizando a soma de
 * custo, para uma matriz quadrada n×n.
 * @param {number[][]} costMatrix - matriz n×n de custos (quanto menor, melhor)
 * @returns {{ assignment: number[], totalCost: number, u: number[], v: number[] }}
 *   assignment[i] = coluna atribuída à linha i (0-indexado)
 *   u, v = potenciais finais (1-indexados, tamanho n+1) — usados depois para
 *          detectar empates / soluções ótimas alternativas.
 */
function hungarianMinCost(costMatrix) {
  const n = costMatrix.length;
  const INF = Infinity;

  // Potenciais de linha (u) e coluna (v), 1-indexados (índice 0 não usado).
  const u = new Array(n + 1).fill(0);
  const v = new Array(n + 1).fill(0);
  // p[j] = linha (1-indexada) atualmente atribuída à coluna j; p[0] é usado
  // como "linha fictícia" de trabalho durante cada iteração.
  const p = new Array(n + 1).fill(0);
  // way[j] = coluna anterior no caminho aumentante que levou a j (para
  // reconstruir o caminho e atualizar a atribuição).
  const way = new Array(n + 1).fill(0);

  for (let i = 1; i <= n; i++) {
    p[0] = i;
    let j0 = 0;
    const minv = new Array(n + 1).fill(INF);
    const used = new Array(n + 1).fill(false);

    // Busca de caminho aumentante de custo mínimo (variante de Dijkstra sobre
    // custos reduzidos), atualizando potenciais a cada passo.
    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = INF;
      let j1 = -1;
      for (let j = 1; j <= n; j++) {
        if (!used[j]) {
          const cur = costMatrix[i0 - 1][j - 1] - u[i0] - v[j];
          if (cur < minv[j]) {
            minv[j] = cur;
            way[j] = j0;
          }
          if (minv[j] < delta) {
            delta = minv[j];
            j1 = j;
          }
        }
      }
      for (let j = 0; j <= n; j++) {
        if (used[j]) {
          u[p[j]] += delta;
          v[j] -= delta;
        } else {
          minv[j] -= delta;
        }
      }
      j0 = j1;
    } while (p[j0] !== 0);

    // Reconstrói o caminho aumentante, trocando as atribuições ao longo dele.
    do {
      const j1 = way[j0];
      p[j0] = p[j1];
      j0 = j1;
    } while (j0 !== 0);
  }

  const assignment = new Array(n);
  for (let j = 1; j <= n; j++) {
    if (p[j] > 0) assignment[p[j] - 1] = j - 1;
  }
  const totalCost = assignment.reduce(
    (sum, col, row) => sum + costMatrix[row][col],
    0
  );

  return { assignment, totalCost, u, v };
}

// ---------------------------------------------------------------------------
// API pública: maximização (o que o jogo de fato usa)
// ---------------------------------------------------------------------------

/**
 * Calcula a alocação ótima (doença → categoria) que MAXIMIZA a soma de
 * pontuação, para a matriz 9×9 (ou n×n genérica) do desafio.
 *
 * @param {number[][]} scoreMatrix - scoreMatrix[doenca][categoria], 0-100
 *   (ou qualquer número; o motor não assume que só existem 0 e 100).
 * @returns {{
 *   assignment: number[],      // assignment[doenca] = categoria (0-indexado)
 *   totalScore: number,        // soma da alocação ótima
 *   hasMultipleOptima: boolean // heurística: true se há indícios de mais de
 *                               // uma alocação perfeita com a mesma soma
 * }}
 */
function hungarianMaxAssignment(scoreMatrix) {
  const n = scoreMatrix.length;
  const costMatrix = scoreMatrix.map((row) => row.map((score) => -score));
  const { assignment, totalCost, u, v } = hungarianMinCost(costMatrix);
  const totalScore = -totalCost;

  // Heurística de detecção de empate: no ótimo, toda aresta (i,j) usada tem
  // custo reduzido zero: cost[i][j] - u[i+1] - v[j+1] === 0. Se o "grafo de
  // igualdade" (todas as arestas de custo reduzido zero, não só as usadas)
  // tem mais arestas do que o necessário para um único casamento perfeito
  // (n arestas), é sinal de que existe pelo menos uma alocação alternativa
  // com a mesma soma total. Não é uma prova formal de unicidade/multiplicidade
  // (checar isso de forma exata é mais caro), mas é suficiente para avisar o
  // jogador de forma honesta na tela de resultado.
  let zeroReducedCostEdges = 0;
  const EPS = 1e-9;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const reduced = costMatrix[i][j] - u[i + 1] - v[j + 1];
      if (Math.abs(reduced) < EPS) zeroReducedCostEdges++;
    }
  }
  const hasMultipleOptima = zeroReducedCostEdges > n;

  return { assignment, totalScore, hasMultipleOptima };
}

// ---------------------------------------------------------------------------
// Testes internos (rodam ao carregar em modo debug — aqui, ao executar o
// arquivo direto com Node; no HTML final, dentro de um `if (DEBUG) {...}`)
// ---------------------------------------------------------------------------

function aproxIgual(a, b, eps = 1e-6) {
  return Math.abs(a - b) < eps;
}

function rodarTestesInternos() {
  const testes = [];

  // Teste A: matriz diagonal-dominante, ótimo único e óbvio (soma 300).
  testes.push({
    nome: "A — diagonal dominante (ótimo único)",
    matriz: [
      [100, 0, 0],
      [0, 100, 0],
      [0, 0, 100],
    ],
    somaEsperada: 300,
    multiplosEsperado: false,
  });

  // Teste B: 2×2 totalmente empatado — qualquer alocação vale o mesmo.
  testes.push({
    nome: "B — 2×2 totalmente empatado",
    matriz: [
      [100, 100],
      [100, 100],
    ],
    somaEsperada: 200,
    multiplosEsperado: true,
  });

  // Teste C: matriz "aditiva" (valor = 3*linha + coluna + 1) — degenerada de
  // propósito: toda permutação dá soma 15. Bom teste de robustez do empate.
  testes.push({
    nome: "C — matriz aditiva 3×3 (todas as permutações são ótimas)",
    matriz: [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ],
    somaEsperada: 15,
    multiplosEsperado: true,
  });

  // Teste D: 4×4 com dois blocos 2×2 — bloco (0,1)×(0,1) totalmente empatado
  // em 100, bloco (2,3)×(2,3) com ótimo único (diagonal). Verifica que o
  // algoritmo acha o ótimo global (400) e sinaliza o empate parcial.
  testes.push({
    nome: "D — 4×4 com bloco empatado + bloco com ótimo único",
    matriz: [
      [100, 100, 0, 0],
      [100, 100, 0, 0],
      [0, 0, 100, 50],
      [0, 0, 50, 100],
    ],
    somaEsperada: 400,
    multiplosEsperado: true,
  });

  // Teste E: matriz 9×9 real do desafio de exemplo (seção 3.1 do documento de
  // revisão de conteúdo). Não temos um "gabarito" independente aqui — o
  // objetivo deste teste é documentar o resultado obtido e permitir
  // conferência manual, não validar contra um valor pré-calculado.
  const matriz9x9 = [
    // PIO
    [0, 100, 100, 100, 0, 70, 40, 75, 85],
    // CCE
    [100, 0, 0, 100, 0, 25, 50, 40, 60],
    // LVC
    [100, 100, 100, 0, 100, 80, 55, 80, 20],
    // PAR
    [0, 100, 100, 100, 0, 85, 30, 85, 45],
    // DIR
    [0, 0, 100, 100, 100, 55, 45, 55, 55],
    // DIS
    [100, 0, 0, 0, 100, 5, 35, 60, 70],
    // LIN
    [100, 100, 100, 0, 100, 90, 60, 65, 50],
    // OTI
    [100, 0, 0, 100, 0, 3, 20, 30, 15],
    // DRC
    [0, 100, 0, 0, 100, 65, 45, 70, 30],
  ];

  console.log("=== PatoVetZee — testes internos do algoritmo húngaro ===\n");

  let todosPassaram = true;

  for (const teste of testes) {
    const resultado = hungarianMaxAssignment(teste.matriz);
    const somaOk = aproxIgual(resultado.totalScore, teste.somaEsperada);
    const multiplosOk = resultado.hasMultipleOptima === teste.multiplosEsperado;
    const passou = somaOk && multiplosOk;
    todosPassaram = todosPassaram && passou;

    console.log(`[${passou ? "PASSOU" : "FALHOU"}] Teste ${teste.nome}`);
    console.log(
      `  soma: obtida=${resultado.totalScore} esperada=${teste.somaEsperada} ${
        somaOk ? "OK" : "DIVERGIU"
      }`
    );
    console.log(
      `  múltiplos ótimos: obtido=${resultado.hasMultipleOptima} esperado=${teste.multiplosEsperado} ${
        multiplosOk ? "OK" : "DIVERGIU"
      }`
    );
    console.log(`  alocação: [${resultado.assignment.join(", ")}]\n`);
  }

  // Teste E é exibido separadamente (não é pass/fail, é conferência manual).
  const nomesDoencas = ["PIO", "CCE", "LVC", "PAR", "DIR", "DIS", "LIN", "OTI", "DRC"];
  const nomesCategorias = [
    "1.Raça",
    "2.SistInesp",
    "3.Hemato",
    "4.Cura",
    "5.Crônica",
    "6.Letalid",
    "7.CustoDx",
    "8.QoL",
    "9.Invasiv",
  ];
  const resultado9x9 = hungarianMaxAssignment(matriz9x9);
  console.log("=== Teste E — matriz 9×9 do desafio de exemplo (conferência manual) ===");
  console.log(`Soma ótima teórica: ${resultado9x9.totalScore} / 900 possíveis`);
  console.log(`Pode haver mais de uma alocação perfeita? ${resultado9x9.hasMultipleOptima}`);
  console.log("Alocação ótima encontrada:");
  resultado9x9.assignment.forEach((catIdx, doencaIdx) => {
    const score = matriz9x9[doencaIdx][catIdx];
    console.log(
      `  ${nomesDoencas[doencaIdx]} -> ${nomesCategorias[catIdx]}  (pontos: ${score})`
    );
  });

  console.log(
    `\n=== Resultado geral: ${todosPassaram ? "TODOS OS TESTES A-D PASSARAM" : "HÁ TESTES COM FALHA — revisar antes de integrar"} ===`
  );

  return todosPassaram;
}

// Executa os testes automaticamente quando o arquivo é rodado direto pelo
// Node (equivalente ao "modo debug" que, no HTML final, dispara ao carregar
// a página com um parâmetro/flag de debug).
if (typeof require !== "undefined" && require.main === module) {
  rodarTestesInternos();
}

// Exports para reaproveitar em outro script/teste, se precisar.
if (typeof module !== "undefined") {
  module.exports = { hungarianMaxAssignment, hungarianMinCost, rodarTestesInternos };
}
