/**
 * Ranking (função pura, testada em tests/ranking.test.ts).
 *
 * Entra só o caso do dia oficial (partidas que contam para o ranking),
 * finalizado, de alunos (professores ficam de fora). Ordem: soma de pontos;
 * desempate por mais acertos e depois menor média de tentativas.
 */
export type PartidaRanking = {
  user_id: string;
  data_caso: string;
  acertou: boolean | null;
  tentativa_acerto: number | null;
  pontos_total: number | null;
};

export type PerfilRanking = { id: string; apelido: string; semestre: number | null; turma: string | null; papel: string };

export type LinhaRanking = {
  posicao: number;
  user_id: string;
  apelido: string;
  semestre: number | null;
  turma: string | null;
  pontos: number;
  jogos: number;
  acertos: number;
  mediaTentativas: number | null;
};

export type Periodo = { inicio: string; fim: string; rotulo: string };

const iso = (d: Date) => d.toISOString().slice(0, 10);
const meio = (s: string) => new Date(`${s}T12:00:00Z`);

/** Semana de segunda a domingo que contém a data. */
export function semanaDe(data: string): Periodo {
  const d = meio(data);
  const dow = (d.getUTCDay() + 6) % 7; // 0 = segunda
  const ini = new Date(d);
  ini.setUTCDate(d.getUTCDate() - dow);
  const fim = new Date(ini);
  fim.setUTCDate(ini.getUTCDate() + 6);
  const f = (x: Date) => `${String(x.getUTCDate()).padStart(2, "0")}/${String(x.getUTCMonth() + 1).padStart(2, "0")}`;
  return { inicio: iso(ini), fim: iso(fim), rotulo: `${f(ini)} a ${f(fim)}` };
}

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

export function mesDe(data: string): Periodo {
  const [a, m] = data.split("-").map(Number);
  const ultimo = new Date(Date.UTC(a, m, 0)).getUTCDate();
  return {
    inicio: `${a}-${String(m).padStart(2, "0")}-01`,
    fim: `${a}-${String(m).padStart(2, "0")}-${String(ultimo).padStart(2, "0")}`,
    rotulo: `${MESES[m - 1]} de ${a}`,
  };
}

export function calcularRanking(
  partidas: readonly PartidaRanking[],
  perfis: ReadonlyMap<string, PerfilRanking>,
  filtro: { semestre?: number; turma?: string } = {},
): LinhaRanking[] {
  const por = new Map<string, Omit<LinhaRanking, "posicao" | "mediaTentativas"> & { somaT: number }>();
  for (const p of partidas) {
    const perfil = perfis.get(p.user_id);
    if (!perfil || perfil.papel !== "aluno") continue;
    if (filtro.semestre && perfil.semestre !== filtro.semestre) continue;
    if (filtro.turma && (perfil.turma ?? "").trim().toLowerCase() !== filtro.turma.trim().toLowerCase()) continue;
    const l = por.get(p.user_id) ?? {
      user_id: p.user_id,
      apelido: perfil.apelido,
      semestre: perfil.semestre,
      turma: perfil.turma,
      pontos: 0,
      jogos: 0,
      acertos: 0,
      somaT: 0,
    };
    l.pontos += p.pontos_total ?? 0;
    l.jogos++;
    if (p.acertou) {
      l.acertos++;
      l.somaT += p.tentativa_acerto ?? 0;
    }
    por.set(p.user_id, l);
  }
  const linhas = [...por.values()].map(({ somaT, ...l }) => ({
    ...l,
    mediaTentativas: l.acertos ? Math.round((somaT / l.acertos) * 10) / 10 : null,
  }));
  linhas.sort(
    (a, b) =>
      b.pontos - a.pontos ||
      b.acertos - a.acertos ||
      (a.mediaTentativas ?? 99) - (b.mediaTentativas ?? 99) ||
      a.apelido.localeCompare(b.apelido, "pt-BR"),
  );
  // Empate total divide a posição (1, 2, 2, 4)
  let posicao = 0;
  return linhas.map((l, i) => {
    const ant = linhas[i - 1];
    const empate = ant && ant.pontos === l.pontos && ant.acertos === l.acertos && ant.mediaTentativas === l.mediaTentativas;
    if (!empate) posicao = i + 1;
    return { posicao, ...l };
  });
}
