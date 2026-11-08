import type { Caso } from "@/lib/caso/esquema";

/**
 * Fórmula de pontuação (aprovada na Etapa 1, ver PLANO.md seção 5).
 *
 *   Total = Diagnóstico + Exames + Tratamento      (mínimo 0, máximo 900)
 *
 * Diagnóstico: 700 na 1ª tentativa, cai 100 por tentativa, 0 se não acertar.
 * Exames (só se acertar): relevante +40, pouco útil 0, desnecessário −20.
 * Tratamento (só se acertar, teto 200):
 *   bruto = 200 × min(1, (adequadas + 0,5 × aceitáveis) / total de adequadas)
 *   menos 50 por contraindicada e 10 por desnecessária, piso 0.
 */
export const PONTOS = {
  diagnosticoPorTentativa: [700, 600, 500, 400, 300, 200, 100] as const,
  exame: { relevante: 40, pouco_util: 0, desnecessario: -20 } as const,
  tratamentoTeto: 200,
  pesoAceitavel: 0.5,
  penalContraindicado: 50,
  penalDesnecessario: 10,
} as const;

export const MAX_TENTATIVAS = 7;

export type LinhaPontuacao = { rotulo: string; pontos: number; detalhe?: string };

export type Pontuacao = {
  diagnostico: number;
  exames: number;
  tratamento: number;
  /** 0 a 1, usado no texto de compartilhar */
  tratamentoFracao: number;
  total: number;
  linhas: LinhaPontuacao[];
};

export function pontosDiagnostico(tentativaAcerto: number | null): number {
  if (tentativaAcerto === null) return 0;
  if (!Number.isInteger(tentativaAcerto) || tentativaAcerto < 1 || tentativaAcerto > MAX_TENTATIVAS)
    throw new Error(`tentativa inválida: ${tentativaAcerto}`);
  return PONTOS.diagnosticoPorTentativa[tentativaAcerto - 1];
}

export function pontosTratamento(caso: Pick<Caso, "tratamentos">, marcadas: readonly string[]) {
  const marc = new Set(marcadas);
  const adequadasTotal = caso.tratamentos.filter((t) => t.classificacao === "adequado").length;
  let acertos = 0;
  let penal = 0;
  let nAdequadas = 0;
  let nAceitaveis = 0;
  let nContra = 0;
  let nDesn = 0;
  for (const t of caso.tratamentos) {
    if (!marc.has(t.id)) continue;
    if (t.classificacao === "adequado") {
      acertos += 1;
      nAdequadas++;
    } else if (t.classificacao === "aceitavel") {
      acertos += PONTOS.pesoAceitavel;
      nAceitaveis++;
    } else if (t.classificacao === "contraindicado") {
      penal += PONTOS.penalContraindicado;
      nContra++;
    } else {
      penal += PONTOS.penalDesnecessario;
      nDesn++;
    }
  }
  const bruto = adequadasTotal === 0 ? 0 : PONTOS.tratamentoTeto * Math.min(1, acertos / adequadasTotal);
  const pontos = Math.max(0, Math.round(bruto - penal));
  return { pontos, bruto: Math.round(bruto), penal, adequadasTotal, nAdequadas, nAceitaveis, nContra, nDesn };
}

export function calcularPontuacao(args: {
  caso: Pick<Caso, "exames" | "tratamentos">;
  tentativaAcerto: number | null;
  examesPedidos: readonly string[];
  tratamentoMarcado: readonly string[];
}): Pontuacao {
  const { caso, tentativaAcerto, examesPedidos, tratamentoMarcado } = args;
  const linhas: LinhaPontuacao[] = [];
  const acertou = tentativaAcerto !== null;

  const diagnostico = pontosDiagnostico(tentativaAcerto);
  linhas.push(
    acertou
      ? { rotulo: `Diagnóstico na ${tentativaAcerto}ª tentativa`, pontos: diagnostico }
      : { rotulo: "Diagnóstico não alcançado em 7 tentativas", pontos: 0 },
  );

  let exames = 0;
  for (const id of examesPedidos) {
    const e = caso.exames.find((x) => x.id === id);
    if (!e) continue;
    const p = acertou ? PONTOS.exame[e.classificacao] : 0;
    exames += p;
    const rot = { relevante: "relevante", pouco_util: "pouco útil", desnecessario: "desnecessário" }[e.classificacao];
    linhas.push({ rotulo: `Exame: ${e.nome}`, pontos: p, detalhe: rot });
  }

  let tratamento = 0;
  let tratamentoFracao = 0;
  if (acertou) {
    const t = pontosTratamento(caso, tratamentoMarcado);
    tratamento = t.pontos;
    tratamentoFracao = t.pontos / PONTOS.tratamentoTeto;
    const partes = [`${t.nAdequadas} de ${t.adequadasTotal} condutas adequadas`];
    if (t.nAceitaveis) partes.push(`${t.nAceitaveis} aceitáve${t.nAceitaveis > 1 ? "is" : "l"}`);
    linhas.push({ rotulo: "Tratamento", pontos: t.bruto, detalhe: partes.join(", ") });
    if (t.nContra)
      linhas.push({
        rotulo: `${t.nContra} conduta${t.nContra > 1 ? "s" : ""} contraindicada${t.nContra > 1 ? "s" : ""}`,
        pontos: -t.nContra * PONTOS.penalContraindicado,
      });
    if (t.nDesn)
      linhas.push({
        rotulo: `${t.nDesn} conduta${t.nDesn > 1 ? "s" : ""} desnecessária${t.nDesn > 1 ? "s" : ""}`,
        pontos: -t.nDesn * PONTOS.penalDesnecessario,
      });
    if (t.bruto - t.penal < 0)
      linhas.push({ rotulo: "Piso da etapa de tratamento (não fica negativa)", pontos: t.penal - t.bruto });
  } else {
    linhas.push({ rotulo: "Tratamento (só para aprender, sem pontos)", pontos: 0 });
  }

  const total = Math.max(0, diagnostico + exames + tratamento);
  return { diagnostico, exames, tratamento, tratamentoFracao, total, linhas };
}
