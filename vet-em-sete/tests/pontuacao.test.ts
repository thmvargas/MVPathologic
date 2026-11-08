import { describe, expect, it } from "vitest";
import { calcularPontuacao, pontosDiagnostico, pontosTratamento, PONTOS } from "@/lib/jogo/pontuacao";
import { caso } from "./apoio";

const T = (...ids: string[]) => ids;

describe("pontos de diagnóstico", () => {
  it("700 na 1ª até 100 na 7ª, 0 sem acerto", () => {
    expect([1, 2, 3, 4, 5, 6, 7].map((t) => pontosDiagnostico(t))).toEqual([700, 600, 500, 400, 300, 200, 100]);
    expect(pontosDiagnostico(null)).toBe(0);
  });
  it("recusa tentativa fora de 1–7", () => {
    expect(() => pontosDiagnostico(0)).toThrow();
    expect(() => pontosDiagnostico(8)).toThrow();
  });
});

describe("pontos de tratamento", () => {
  const adequadas = caso.tratamentos.filter((t) => t.classificacao === "adequado").map((t) => t.id);
  it("todas as adequadas = teto 200", () => {
    expect(pontosTratamento(caso, adequadas).pontos).toBe(200);
  });
  it("aceitáveis não passam do teto", () => {
    expect(pontosTratamento(caso, [...adequadas, "fluido", "contactante"]).pontos).toBe(200);
  });
  it("aceitável vale meia adequada", () => {
    // 3 adequadas no caso: 1 adequada + 1 aceitável = 1,5/3 → 100
    expect(pontosTratamento(caso, T("doxiciclina", "fluido")).pontos).toBe(100);
  });
  it("contraindicada tira 50, desnecessária tira 10", () => {
    expect(pontosTratamento(caso, [...adequadas, "aas"]).pontos).toBe(150);
    expect(pontosTratamento(caso, [...adequadas, "enrofloxacino"]).pontos).toBe(190);
  });
  it("nunca fica negativa", () => {
    expect(pontosTratamento(caso, T("aas", "esplenectomia", "eutanasia")).pontos).toBe(0);
  });
  it("marcar tudo não compensa", () => {
    const tudo = caso.tratamentos.map((t) => t.id);
    expect(pontosTratamento(caso, tudo).pontos).toBeLessThan(pontosTratamento(caso, adequadas).pontos);
  });
  it("ids repetidos não contam duas vezes", () => {
    expect(pontosTratamento(caso, T("doxiciclina", "doxiciclina")).pontos).toBe(67);
  });
});

describe("pontuação total", () => {
  it("exames só contam se acertar", () => {
    const p = calcularPontuacao({ caso, tentativaAcerto: null, examesPedidos: ["hemograma", "pcr"], tratamentoMarcado: ["doxiciclina"] });
    expect(p.total).toBe(0);
  });
  it("soma diagnóstico, exames e tratamento", () => {
    const p = calcularPontuacao({
      caso,
      tentativaAcerto: 6,
      examesPedidos: ["hemograma", "copro"],
      tratamentoMarcado: ["doxiciclina", "carrapaticida", "hemograma_controle", "aas"],
    });
    expect(p.diagnostico).toBe(200);
    expect(p.exames).toBe(40 - 20);
    expect(p.tratamento).toBe(150);
    expect(p.total).toBe(370);
    // as linhas explicativas somam o total
    expect(p.linhas.reduce((s, l) => s + l.pontos, 0)).toBe(p.total);
  });
  it("acertar antes nunca vale menos que acertar depois com os melhores exames", () => {
    const melhor = (t: number) => {
      const exames = Math.max(0, t - 4);
      return pontosDiagnostico(t) + exames * PONTOS.exame.relevante;
    };
    for (let t = 1; t < 7; t++) expect(melhor(t)).toBeGreaterThan(melhor(t + 1));
  });
  it("máximo possível é 900", () => {
    const p = calcularPontuacao({ caso, tentativaAcerto: 1, examesPedidos: [], tratamentoMarcado: ["doxiciclina", "carrapaticida", "hemograma_controle"] });
    expect(p.total).toBe(900);
  });
});
