/**
 * Agregações do painel do professor (funções puras, testadas em
 * tests/painel.test.ts). Recebem as partidas brutas e o banco de casos.
 */
import type { Acao } from "@/lib/jogo/motor";

export type PartidaPainel = {
  id: number;
  user_id: string;
  caso_id: string;
  modo: string;
  data_caso: string;
  sistema: string;
  grupo_especie: string;
  finalizada: boolean;
  acertou: boolean | null;
  tentativa_acerto: number | null;
  pontos_total: number | null;
  acoes: Acao[];
  atualizada_em: string;
};

export type PerfilPainel = {
  id: string;
  nome: string;
  apelido: string;
  email: string;
  semestre: number | null;
  turma: string | null;
  papel: string;
};

type CasoInfo = {
  id: string;
  diagnosticoNome: string;
  exames: { id: string; nome: string; classificacao: string }[];
  tratamentos: { id: string; texto: string; classificacao: string }[];
};

const pct = (a: number, b: number) => (b ? a / b : 0);
const media = (soma: number, n: number) => (n ? Math.round((soma / n) * 10) / 10 : null);

type Acum = { jogos: number; acertos: number; somaT: number; pontos: number };
const novo = (): Acum => ({ jogos: 0, acertos: 0, somaT: 0, pontos: 0 });
function somar(a: Acum, p: PartidaPainel) {
  a.jogos++;
  a.pontos += p.pontos_total ?? 0;
  if (p.acertou) {
    a.acertos++;
    a.somaT += p.tentativa_acerto ?? 0;
  }
}
const fechar = (a: Acum) => ({
  jogos: a.jogos,
  acertos: a.acertos,
  taxaAcerto: pct(a.acertos, a.jogos),
  mediaTentativas: media(a.somaT, a.acertos),
  pontos: a.pontos,
});

export type Filtros = { semestre?: number; turma?: string; modo?: "diario" | "livres" };

/** Só alunos, só partidas finalizadas, e os filtros do painel. */
export function filtrarPartidas(partidas: readonly PartidaPainel[], perfis: ReadonlyMap<string, PerfilPainel>, f: Filtros) {
  return partidas.filter((p) => {
    const pf = perfis.get(p.user_id);
    if (!pf || pf.papel !== "aluno" || !p.finalizada) return false;
    if (f.semestre && pf.semestre !== f.semestre) return false;
    if (f.turma && (pf.turma ?? "").trim().toLowerCase() !== f.turma.trim().toLowerCase()) return false;
    if (f.modo === "diario" && p.modo !== "diario") return false;
    if (f.modo === "livres" && p.modo === "diario") return false;
    return true;
  });
}

export function resumoGeral(partidas: readonly PartidaPainel[]) {
  const a = novo();
  partidas.forEach((p) => somar(a, p));
  return { alunos: new Set(partidas.map((p) => p.user_id)).size, ...fechar(a) };
}

export function porAluno(partidas: readonly PartidaPainel[], perfis: ReadonlyMap<string, PerfilPainel>) {
  const m = new Map<string, Acum & { ultimo: string }>();
  for (const p of partidas) {
    const a = m.get(p.user_id) ?? { ...novo(), ultimo: "" };
    somar(a, p);
    if (p.atualizada_em > a.ultimo) a.ultimo = p.atualizada_em;
    m.set(p.user_id, a);
  }
  return [...m.entries()]
    .map(([id, a]) => ({ perfil: perfis.get(id)!, ...fechar(a), ultimoAcesso: a.ultimo }))
    .sort((x, y) => x.perfil.nome.localeCompare(y.perfil.nome, "pt-BR"));
}

export function porTurma(partidas: readonly PartidaPainel[], perfis: ReadonlyMap<string, PerfilPainel>) {
  const m = new Map<string, Acum & { alunos: Set<string>; semestre: number | null; turma: string }>();
  for (const p of partidas) {
    const pf = perfis.get(p.user_id)!;
    const turma = (pf.turma ?? "").trim() || "sem turma";
    const chave = `${pf.semestre ?? 0}|${turma.toLowerCase()}`;
    const a = m.get(chave) ?? { ...novo(), alunos: new Set(), semestre: pf.semestre, turma };
    somar(a, p);
    a.alunos.add(p.user_id);
    m.set(chave, a);
  }
  return [...m.values()]
    .map((a) => ({ semestre: a.semestre, turma: a.turma, alunos: a.alunos.size, ...fechar(a) }))
    .sort((x, y) => (x.semestre ?? 0) - (y.semestre ?? 0) || x.turma.localeCompare(y.turma, "pt-BR"));
}

/** Casos ordenados do mais errado para o menos errado. */
export function porCaso(partidas: readonly PartidaPainel[], casos: ReadonlyMap<string, CasoInfo>) {
  const m = new Map<string, Acum>();
  for (const p of partidas) {
    const a = m.get(p.caso_id) ?? novo();
    somar(a, p);
    m.set(p.caso_id, a);
  }
  return [...m.entries()]
    .map(([id, a]) => ({ casoId: id, diagnostico: casos.get(id)?.diagnosticoNome ?? id, ...fechar(a) }))
    .sort((x, y) => x.taxaAcerto - y.taxaAcerto || y.jogos - x.jogos);
}

export function porSistema(partidas: readonly PartidaPainel[]) {
  const m = new Map<string, Acum>();
  for (const p of partidas) {
    const a = m.get(p.sistema) ?? novo();
    somar(a, p);
    m.set(p.sistema, a);
  }
  return [...m.entries()].map(([sistema, a]) => ({ sistema, ...fechar(a) })).sort((x, y) => x.taxaAcerto - y.taxaAcerto);
}

/** Quantas vezes cada exame foi pedido, por caso. */
export function examesPedidos(partidas: readonly PartidaPainel[], casos: ReadonlyMap<string, CasoInfo>) {
  const m = new Map<string, number>();
  for (const p of partidas)
    for (const a of p.acoes) if (a.tipo === "exame") m.set(`${p.caso_id}|${a.exameId}`, (m.get(`${p.caso_id}|${a.exameId}`) ?? 0) + 1);
  return [...m.entries()]
    .map(([k, vezes]) => {
      const [casoId, exameId] = k.split("|");
      const c = casos.get(casoId);
      const e = c?.exames.find((x) => x.id === exameId);
      return { casoId, diagnostico: c?.diagnosticoNome ?? casoId, exame: e?.nome ?? exameId, classificacao: e?.classificacao ?? "?", vezes };
    })
    .sort((x, y) => x.diagnostico.localeCompare(y.diagnostico, "pt-BR") || y.vezes - x.vezes);
}

/** Quantas vezes cada conduta foi marcada, por caso (só partidas com tratamento). */
export function condutasMarcadas(partidas: readonly PartidaPainel[], casos: ReadonlyMap<string, CasoInfo>) {
  const total = new Map<string, number>();
  const m = new Map<string, number>();
  for (const p of partidas) {
    const t = p.acoes.find((a) => a.tipo === "tratamento");
    if (!t || t.tipo !== "tratamento") continue;
    total.set(p.caso_id, (total.get(p.caso_id) ?? 0) + 1);
    for (const c of new Set(t.condutas)) m.set(`${p.caso_id}|${c}`, (m.get(`${p.caso_id}|${c}`) ?? 0) + 1);
  }
  return [...m.entries()]
    .map(([k, vezes]) => {
      const [casoId, condutaId] = k.split("|");
      const c = casos.get(casoId);
      const t = c?.tratamentos.find((x) => x.id === condutaId);
      return {
        casoId,
        diagnostico: c?.diagnosticoNome ?? casoId,
        conduta: t?.texto ?? condutaId,
        classificacao: t?.classificacao ?? "?",
        vezes,
        fracao: pct(vezes, total.get(casoId) ?? 0),
      };
    })
    .sort((x, y) => x.diagnostico.localeCompare(y.diagnostico, "pt-BR") || y.vezes - x.vezes);
}

/** Lista de palpites legível para exportação ("Babesiose canina > pulou > Erliquiose"). */
export function palpitesTexto(acoes: readonly Acao[], nomes: ReadonlyMap<string, string>): string {
  return acoes
    .filter((a) => a.tipo === "palpite" || a.tipo === "pular")
    .map((a) => (a.tipo === "palpite" ? (nomes.get(a.diagnosticoId) ?? a.diagnosticoId) : "pulou"))
    .join(" > ");
}

// ---------------------------------------------------------------------------
// CSV (Excel em português: separador ";" e UTF-8 com BOM)
// ---------------------------------------------------------------------------

export function paraCSV(cabecalho: readonly string[], linhas: readonly (readonly unknown[])[]): string {
  const cel = (v: unknown) => {
    if (v === null || v === undefined) return "";
    let s = typeof v === "number" ? String(v).replace(".", ",") : String(v);
    // Evita que o Excel interprete o texto como fórmula
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "﻿" + [cabecalho, ...linhas].map((l) => l.map(cel).join(";")).join("\r\n") + "\r\n";
}
