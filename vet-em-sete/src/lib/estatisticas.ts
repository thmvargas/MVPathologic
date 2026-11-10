/**
 * Estatísticas do aluno, calculadas a partir das partidas finalizadas.
 * Função pura (testada em tests/estatisticas.test.ts).
 */
export type PartidaResumo = {
  modo: string;
  data_caso: string; // AAAA-MM-DD
  acertou: boolean | null;
  tentativa_acerto: number | null;
  pontos_total: number | null;
  grupo_especie: string;
  sistema: string;
};

export type Agrupado = { chave: string; jogadas: number; acertos: number };

export type Estatisticas = {
  jogadas: number;
  acertos: number;
  taxaAcerto: number; // 0–1
  mediaTentativas: number | null; // só entre acertos
  pontosTotais: number;
  distribuicao: number[]; // índices 0–6 = acerto na 1ª–7ª; índice 7 = não acertou
  streakAtual: number;
  streakRecorde: number;
  porSistema: Agrupado[];
  porEspecie: Agrupado[];
};

function diaSeguinte(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Streak: dias seguidos com o caso do dia concluído. A sequência atual só
 * conta se o último dia jogado for hoje ou ontem (hoje ainda pode jogar).
 */
export function calcularStreak(datas: readonly string[], hoje: string): { atual: number; recorde: number } {
  const dias = [...new Set(datas)].sort();
  let recorde = 0;
  let corrente = 0;
  let anterior: string | null = null;
  for (const d of dias) {
    corrente = anterior && diaSeguinte(anterior) === d ? corrente + 1 : 1;
    recorde = Math.max(recorde, corrente);
    anterior = d;
  }
  const ultimo = dias[dias.length - 1];
  const ativo = ultimo === hoje || (ultimo !== undefined && diaSeguinte(ultimo) === hoje);
  return { atual: ativo ? corrente : 0, recorde };
}

function agrupar(lista: readonly PartidaResumo[], campo: "sistema" | "grupo_especie"): Agrupado[] {
  const m = new Map<string, Agrupado>();
  for (const p of lista) {
    const g = m.get(p[campo]) ?? { chave: p[campo], jogadas: 0, acertos: 0 };
    g.jogadas++;
    if (p.acertou) g.acertos++;
    m.set(p[campo], g);
  }
  return [...m.values()].sort((a, b) => b.jogadas - a.jogadas || a.chave.localeCompare(b.chave));
}

export function calcularEstatisticas(partidas: readonly PartidaResumo[], hoje: string): Estatisticas {
  const acertos = partidas.filter((p) => p.acertou);
  const distribuicao = Array(8).fill(0) as number[];
  for (const p of partidas) {
    const t = p.acertou ? p.tentativa_acerto : null;
    distribuicao[t && t >= 1 && t <= 7 ? t - 1 : 7]++;
  }
  const somaT = acertos.reduce((s, p) => s + (p.tentativa_acerto ?? 0), 0);
  const { atual, recorde } = calcularStreak(
    partidas.filter((p) => p.modo === "diario").map((p) => p.data_caso),
    hoje,
  );
  return {
    jogadas: partidas.length,
    acertos: acertos.length,
    taxaAcerto: partidas.length ? acertos.length / partidas.length : 0,
    mediaTentativas: acertos.length ? Math.round((somaT / acertos.length) * 10) / 10 : null,
    pontosTotais: partidas.reduce((s, p) => s + (p.pontos_total ?? 0), 0),
    distribuicao,
    streakAtual: atual,
    streakRecorde: recorde,
    porSistema: agrupar(partidas, "sistema"),
    porEspecie: agrupar(partidas, "grupo_especie"),
  };
}
