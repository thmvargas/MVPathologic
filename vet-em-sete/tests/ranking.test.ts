import { describe, expect, it } from "vitest";
import { calcularRanking, mesDe, semanaDe, type PerfilRanking } from "@/lib/ranking";

const perfis = new Map<string, PerfilRanking>([
  ["a", { id: "a", apelido: "Ana", semestre: 5, turma: "A", papel: "aluno" }],
  ["b", { id: "b", apelido: "Beto", semestre: 5, turma: "B", papel: "aluno" }],
  ["c", { id: "c", apelido: "Caio", semestre: 3, turma: "A", papel: "aluno" }],
  ["p", { id: "p", apelido: "Prof", semestre: null, turma: null, papel: "professor" }],
]);
const P = (user_id: string, pontos: number, t: number | null) => ({
  user_id,
  data_caso: "2026-11-09",
  acertou: t !== null,
  tentativa_acerto: t,
  pontos_total: pontos,
});

describe("ranking", () => {
  const partidas = [P("a", 700, 1), P("a", 300, 5), P("b", 1000, 2), P("c", 500, 3), P("p", 900, 1)];
  it("soma pontos, desempata por acertos e média, e deixa professor de fora", () => {
    const r = calcularRanking(partidas, perfis);
    expect(r.map((l) => [l.posicao, l.apelido, l.pontos])).toEqual([
      [1, "Ana", 1000], // 2 acertos
      [2, "Beto", 1000], // 1 acerto
      [3, "Caio", 500],
    ]);
    expect(r[0].mediaTentativas).toBe(3);
  });
  it("filtra por semestre e turma (sem diferenciar maiúsculas)", () => {
    expect(calcularRanking(partidas, perfis, { semestre: 5 }).map((l) => l.apelido)).toEqual(["Ana", "Beto"]);
    expect(calcularRanking(partidas, perfis, { turma: " a " }).map((l) => l.apelido)).toEqual(["Ana", "Caio"]);
  });
  it("empate total divide a posição", () => {
    const r = calcularRanking([P("a", 500, 3), P("b", 500, 3), P("c", 100, 7)], perfis);
    expect(r.map((l) => l.posicao)).toEqual([1, 1, 3]);
  });
});

describe("períodos", () => {
  it("semana de segunda a domingo", () => {
    expect(semanaDe("2026-11-09")).toMatchObject({ inicio: "2026-11-09", fim: "2026-11-15" }); // segunda
    expect(semanaDe("2026-11-15")).toMatchObject({ inicio: "2026-11-09", fim: "2026-11-15" }); // domingo
    expect(semanaDe("2026-12-31")).toMatchObject({ inicio: "2026-12-28", fim: "2027-01-03" }); // vira o ano
  });
  it("mês inteiro, inclusive fevereiro", () => {
    expect(mesDe("2026-11-09")).toEqual({ inicio: "2026-11-01", fim: "2026-11-30", rotulo: "novembro de 2026" });
    expect(mesDe("2028-02-10").fim).toBe("2028-02-29");
  });
});
