import { describe, expect, it } from "vitest";
import { aplicarFiltro, filtrarCasosLivres, sortearTreino } from "@/lib/util/filtros";

const c = (id: string, extra: Partial<{ status: string; grupo_especie: string; semestre: number; sistema: string; uso: string }> = {}) => ({
  id,
  status: "revisado",
  grupo_especie: "caes",
  semestre: 5,
  sistema: "urinario",
  ...extra,
});

describe("casos dos modos livres (opção b)", () => {
  const casos = [
    c("a"), // diário, usado no passado
    c("b"), // diário, é o de hoje
    c("c", { uso: "treino" }), // treino, mas agendado no futuro por engano
    c("d", { status: "rascunho", uso: "treino" }),
    c("e", { uso: "treino" }), // treino: sempre liberado
    c("f"), // diário ainda não usado: reservado
  ];
  const agenda = [
    { data: "2026-11-07", caso_id: "a" },
    { data: "2026-11-09", caso_id: "b" },
    { data: "2026-11-20", caso_id: "c" },
  ];
  it("treino sempre; diário só depois de usado; nunca hoje, futuro ou rascunho", () => {
    expect(filtrarCasosLivres(casos, agenda, "2026-11-09").map((x) => x.id)).toEqual(["a", "e"]);
  });
  it("no dia seguinte, o caso de ontem é liberado", () => {
    expect(filtrarCasosLivres(casos, agenda, "2026-11-10").map((x) => x.id)).toEqual(["a", "b", "e"]);
  });
});

describe("filtros", () => {
  const casos = [c("a"), c("b", { grupo_especie: "equinos", semestre: 3 }), c("x", { sistema: "nervoso" })];
  it("por espécie, semestre e sistema", () => {
    expect(aplicarFiltro(casos, { especie: "equinos" }).map((x) => x.id)).toEqual(["b"]);
    expect(aplicarFiltro(casos, { semestre: 5 }).map((x) => x.id)).toEqual(["a", "x"]);
    expect(aplicarFiltro(casos, { sistema: "nervoso", especie: "caes" }).map((x) => x.id)).toEqual(["x"]);
    expect(aplicarFiltro(casos, {}).length).toBe(3);
  });
});

describe("sorteio do treino", () => {
  const casos = [c("a"), c("b"), c("c")];
  it("prefere casos ainda não jogados", () => {
    for (const r of [0, 0.5, 0.99]) expect(sortearTreino(casos, new Set(["a", "b"]), () => r)?.id).toBe("c");
  });
  it("se jogou todos, sorteia entre todos", () => {
    expect(sortearTreino(casos, new Set(["a", "b", "c"]), () => 0.5)?.id).toBe("b");
  });
  it("sem casos, nada", () => {
    expect(sortearTreino([], new Set(), () => 0)).toBeNull();
  });
});
