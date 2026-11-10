import { describe, expect, it } from "vitest";
import {
  condutasMarcadas, examesPedidos, filtrarPartidas, palpitesTexto, paraCSV, porAluno, porCaso, porTurma, resumoGeral,
  type PartidaPainel, type PerfilPainel,
} from "@/lib/painel";
import { caso } from "./apoio";

const perfis = new Map<string, PerfilPainel>([
  ["a", { id: "a", nome: "Ana Lima", apelido: "ana", email: "ana@x", semestre: 5, turma: "A", papel: "aluno" }],
  ["b", { id: "b", nome: "Beto Reis", apelido: "beto", email: "b@x", semestre: 3, turma: "B", papel: "aluno" }],
  ["p", { id: "p", nome: "Prof", apelido: "prof", email: "p@x", semestre: null, turma: null, papel: "professor" }],
]);
const casos = new Map([
  [caso.id, { id: caso.id, diagnosticoNome: "Erliquiose monocítica", exames: caso.exames, tratamentos: caso.tratamentos }],
]);
let n = 0;
const P = (user_id: string, acertou: boolean | null, t: number | null, extra: Partial<PartidaPainel> = {}): PartidaPainel => ({
  id: ++n,
  user_id,
  caso_id: caso.id,
  modo: "diario",
  data_caso: "2026-11-09",
  sistema: "hematopoietico_linfatico",
  grupo_especie: "caes",
  finalizada: true,
  acertou,
  tentativa_acerto: t,
  pontos_total: t ? 800 - 100 * t : 0,
  acoes: [],
  atualizada_em: `2026-11-09T1${n}:00:00Z`,
  ...extra,
});

const partidas = [
  P("a", true, 5, {
    acoes: [
      { tipo: "pular" }, { tipo: "pular" }, { tipo: "pular" }, { tipo: "pular" },
      { tipo: "exame", exameId: "hemograma" },
      { tipo: "palpite", diagnosticoId: "erliquiose_monocitica" },
      { tipo: "tratamento", condutas: ["doxiciclina", "aas"] },
    ],
  }),
  P("a", false, null, { modo: "treino", acoes: [{ tipo: "exame", exameId: "hemograma" }, { tipo: "tratamento", condutas: ["aas"] }] }),
  P("b", true, 2),
  P("b", null, null, { finalizada: false }),
  P("p", true, 1),
];

describe("painel do professor", () => {
  const base = filtrarPartidas(partidas, perfis, {});
  it("só alunos e partidas finalizadas", () => {
    expect(base.length).toBe(3);
  });
  it("filtros de semestre, turma e modo", () => {
    expect(filtrarPartidas(partidas, perfis, { semestre: 5 }).length).toBe(2);
    expect(filtrarPartidas(partidas, perfis, { turma: "b" }).length).toBe(1);
    expect(filtrarPartidas(partidas, perfis, { modo: "diario" }).length).toBe(2);
    expect(filtrarPartidas(partidas, perfis, { modo: "livres" }).length).toBe(1);
  });
  it("resumo, por aluno e por turma", () => {
    expect(resumoGeral(base)).toMatchObject({ alunos: 2, jogos: 3, acertos: 2, mediaTentativas: 3.5 });
    const al = porAluno(base, perfis);
    expect(al.map((x) => [x.perfil.nome, x.jogos, x.acertos])).toEqual([["Ana Lima", 2, 1], ["Beto Reis", 1, 1]]);
    expect(porTurma(base, perfis).map((x) => [x.semestre, x.turma, x.alunos])).toEqual([[3, "B", 1], [5, "A", 1]]);
  });
  it("caso com taxa de acerto", () => {
    expect(porCaso(base, casos)[0]).toMatchObject({ diagnostico: "Erliquiose monocítica", jogos: 3, acertos: 2 });
  });
  it("exames e condutas mais escolhidos, com classificação", () => {
    expect(examesPedidos(base, casos)[0]).toMatchObject({ exame: "Hemograma completo", classificacao: "relevante", vezes: 2 });
    const cond = condutasMarcadas(base, casos);
    expect(cond[0]).toMatchObject({ conduta: expect.stringContaining("Ácido acetilsalicílico"), classificacao: "contraindicado", vezes: 2, fracao: 1 });
  });
  it("palpites em texto", () => {
    expect(palpitesTexto(partidas[0].acoes, new Map([["erliquiose_monocitica", "Erliquiose"]]))).toBe("pulou > pulou > pulou > pulou > Erliquiose");
  });
});

describe("CSV", () => {
  it("BOM, ponto e vírgula, decimal com vírgula, aspas e proteção contra fórmula", () => {
    const csv = paraCSV(["nome", "taxa", "obs"], [["Ana; Lima", 0.5, '=1+1'], ["Beto", 3, 'diz "oi"']]);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv).toBe('﻿nome;taxa;obs\r\n"Ana; Lima";0,5;\'=1+1\r\n' + 'Beto;3;"diz ""oi"""\r\n');
  });
});
