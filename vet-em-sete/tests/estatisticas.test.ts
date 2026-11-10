import { describe, expect, it } from "vitest";
import { calcularEstatisticas, calcularStreak, type PartidaResumo } from "@/lib/estatisticas";

describe("streak", () => {
  it("conta dias seguidos e atravessa virada de mês", () => {
    expect(calcularStreak(["2026-10-30", "2026-10-31", "2026-11-01"], "2026-11-01")).toEqual({ atual: 3, recorde: 3 });
  });
  it("continua valendo se o último jogo foi ontem", () => {
    expect(calcularStreak(["2026-11-06", "2026-11-07"], "2026-11-08").atual).toBe(2);
  });
  it("zera se pulou um dia, mas guarda o recorde", () => {
    expect(calcularStreak(["2026-11-01", "2026-11-02", "2026-11-03", "2026-11-06"], "2026-11-08")).toEqual({ atual: 0, recorde: 3 });
  });
  it("datas repetidas e fora de ordem", () => {
    expect(calcularStreak(["2026-11-08", "2026-11-07", "2026-11-08"], "2026-11-08")).toEqual({ atual: 2, recorde: 2 });
  });
  it("sem partidas", () => {
    expect(calcularStreak([], "2026-11-08")).toEqual({ atual: 0, recorde: 0 });
  });
});

describe("estatísticas", () => {
  const p = (data: string, t: number | null, extra: Partial<PartidaResumo> = {}): PartidaResumo => ({
    modo: "diario",
    data_caso: data,
    acertou: t !== null,
    tentativa_acerto: t,
    pontos_total: t ? 800 - 100 * t : 0,
    grupo_especie: "caes",
    sistema: "urinario",
    ...extra,
  });
  const lista = [
    p("2026-11-05", 2),
    p("2026-11-06", null, { sistema: "nervoso", grupo_especie: "equinos" }),
    p("2026-11-07", 4),
    p("2026-11-08", 3, { modo: "treino" }),
  ];
  const e = calcularEstatisticas(lista, "2026-11-08");
  it("totais, taxa e média de tentativas só entre acertos", () => {
    expect(e.jogadas).toBe(4);
    expect(e.acertos).toBe(3);
    expect(e.taxaAcerto).toBeCloseTo(0.75);
    expect(e.mediaTentativas).toBe(3);
    expect(e.pontosTotais).toBe(600 + 0 + 400 + 500);
  });
  it("distribuição por tentativa com coluna de não acertou", () => {
    expect(e.distribuicao).toEqual([0, 1, 1, 1, 0, 0, 0, 1]);
  });
  it("streak usa só o caso do dia", () => {
    expect(e.streakAtual).toBe(3); // 05, 06, 07 (o treino do dia 08 não conta; ontem vale)
  });
  it("agrupa por sistema e espécie", () => {
    expect(e.porSistema[0]).toEqual({ chave: "urinario", jogadas: 3, acertos: 3 });
    expect(e.porEspecie.find((x) => x.chave === "equinos")).toEqual({ chave: "equinos", jogadas: 1, acertos: 0 });
  });
});
