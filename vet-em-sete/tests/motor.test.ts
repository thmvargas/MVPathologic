import { describe, expect, it } from "vitest";
import { aplicarAcao, estadoInicial, montarVisao, resumir, type Acao, type Estado } from "@/lib/jogo/motor";
import { assinarEstado, lerEstado } from "@/lib/jogo/token";
import { caso, mapa } from "./apoio";

const jogar = (acoes: Acao[]) => acoes.reduce<Estado>((e, a) => aplicarAcao(e, a, caso, mapa), estadoInicial(caso));
const erros = ["babesiose_canina", "doenca_renal_cronica", "cinomose", "piometra", "raiva", "linfoma_multicentrico", "mastocitoma"];

describe("revelação progressiva", () => {
  it("tentativa 1 mostra só paciente e queixa", () => {
    const v = montarVisao(estadoInicial(caso), caso, mapa);
    expect(v.tentativa).toBe(1);
    expect(v.historico).toBeUndefined();
    expect(v.anamnese).toBeUndefined();
    expect(v.exame_fisico).toBeUndefined();
    expect(v.diagnostico).toBeUndefined();
    expect(JSON.stringify(v)).not.toContain("erliquiose_monocitica");
  });
  it("cada erro revela uma camada", () => {
    let e = estadoInicial(caso);
    e = aplicarAcao(e, { tipo: "palpite", diagnosticoId: erros[0] }, caso, mapa);
    expect(montarVisao(e, caso, mapa).historico).toBeDefined();
    e = aplicarAcao(e, { tipo: "pular" }, caso, mapa);
    expect(montarVisao(e, caso, mapa).anamnese).toBeDefined();
    e = aplicarAcao(e, { tipo: "palpite", diagnosticoId: erros[1] }, caso, mapa);
    const v = montarVisao(e, caso, mapa);
    expect(v.exame_fisico).toBeDefined();
    expect(v.examesDisponiveis).toBeUndefined();
  });
  it("da 5ª tentativa em diante exige escolher um exame antes do palpite", () => {
    let e = jogar(erros.slice(0, 4).map((id) => ({ tipo: "palpite", diagnosticoId: id }) as Acao));
    const v = montarVisao(e, caso, mapa);
    expect(v.tentativa).toBe(5);
    expect(v.precisaEscolherExame).toBe(true);
    expect(v.examesDisponiveis?.length).toBe(caso.exames.length);
    expect(JSON.stringify(v.examesDisponiveis)).not.toContain("relevante");
    expect(() => aplicarAcao(e, { tipo: "palpite", diagnosticoId: "raiva" }, caso, mapa)).toThrow(/exame/);
    e = aplicarAcao(e, { tipo: "exame", exameId: "hemograma" }, caso, mapa);
    expect(() => aplicarAcao(e, { tipo: "exame", exameId: "pcr" }, caso, mapa)).toThrow();
    const v2 = montarVisao(e, caso, mapa);
    expect(v2.examesFeitos[0].resultado.tabela?.length).toBeGreaterThan(0);
    expect(v2.examesFeitos[0].classificacao).toBeUndefined();
  });
  it("não aceita palpite repetido nem fora da lista", () => {
    const e = jogar([{ tipo: "palpite", diagnosticoId: "raiva" }]);
    expect(() => aplicarAcao(e, { tipo: "palpite", diagnosticoId: "raiva" }, caso, mapa)).toThrow();
    expect(() => aplicarAcao(e, { tipo: "palpite", diagnosticoId: "inventado" }, caso, mapa)).toThrow();
  });
});

describe("fim da partida", () => {
  it("acerto leva ao tratamento e depois à explicação com pontuação", () => {
    let e = jogar([
      { tipo: "palpite", diagnosticoId: "babesiose_canina" },
      { tipo: "palpite", diagnosticoId: "erliquiose_monocitica" },
    ]);
    let v = montarVisao(e, caso, mapa);
    expect(v.fase).toBe("tratamento");
    expect(v.acertou).toBe(true);
    expect(v.anamnese).toBeDefined(); // tudo liberado
    expect(JSON.stringify(v.tratamentosOpcoes)).not.toContain("contraindicado");
    expect(() => aplicarAcao(e, { tipo: "pular" }, caso, mapa)).toThrow();
    e = aplicarAcao(e, { tipo: "tratamento", condutas: ["doxiciclina", "carrapaticida", "hemograma_controle"] }, caso, mapa);
    v = montarVisao(e, caso, mapa);
    expect(v.fase).toBe("fim");
    expect(v.pontuacao?.total).toBe(600 + 200);
    expect(v.explicacao).toBeDefined();
    expect(v.examesTodos?.length).toBe(caso.exames.length);
  });
  it("7 erros revelam o diagnóstico e o tratamento vale 0", () => {
    const acoes: Acao[] = [];
    erros.forEach((id, i) => {
      if (i >= 4) acoes.push({ tipo: "exame", exameId: caso.exames[i - 4].id });
      acoes.push({ tipo: "palpite", diagnosticoId: id });
    });
    let e = jogar(acoes);
    expect(resumir(e, caso).fase).toBe("tratamento");
    expect(montarVisao(e, caso, mapa).acertou).toBe(false);
    e = aplicarAcao(e, { tipo: "tratamento", condutas: ["doxiciclina"] }, caso, mapa);
    expect(montarVisao(e, caso, mapa).pontuacao?.total).toBe(0);
  });
});

describe("token assinado", () => {
  it("lê o que assinou e recusa adulteração", () => {
    const e = jogar([{ tipo: "pular" }]);
    const est = { codigo: "abc123", versao: e.versao, acoes: e.acoes };
    const t = assinarEstado(est);
    expect(lerEstado(t)).toEqual(est);
    expect(Buffer.from(t.split(".")[0], "base64url").toString()).not.toContain("erliquiose");
    const [corpo, sig] = t.split(".");
    const falso = Buffer.from(JSON.stringify({ ...est, acoes: [] })).toString("base64url");
    expect(lerEstado(`${falso}.${sig}`)).toBeNull();
    expect(lerEstado(`${corpo}.x`)).toBeNull();
    expect(lerEstado("lixo")).toBeNull();
  });
});

import { textoCompartilhar } from "@/lib/jogo/compartilhar";
describe("compartilhar", () => {
  it("não revela o diagnóstico", () => {
    let e = jogar([
      { tipo: "palpite", diagnosticoId: "anaplasmose_trombocitica" },
      { tipo: "pular" },
      { tipo: "palpite", diagnosticoId: "erliquiose_monocitica" },
    ]);
    e = aplicarAcao(e, { tipo: "tratamento", condutas: ["doxiciclina", "carrapaticida"] }, caso, mapa);
    const t = textoCompartilhar(montarVisao(e, caso, mapa), "2026-11-08");
    expect(t).toBe("Vet em Sete · 08/11/2026 · Cães\nAcertei em 3/7\n🟨⬜🟩\nTratamento: 67%\n633 pontos");
    expect(t.toLowerCase()).not.toContain("erliq");
  });
});

import fs from "node:fs";
import path from "node:path";
import { CasoSchema } from "@/lib/caso/esquema";
import { embaralhar } from "@/lib/jogo/ordem";

describe("ordem de exames e condutas", () => {
  const dir = path.join(__dirname, "../src/dados/casos");
  const casos = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => CasoSchema.parse(JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))));

  it("embaralhamento é uma permutação e é estável para a mesma semente", () => {
    const a = embaralhar([1, 2, 3, 4, 5, 6, 7, 8], "x");
    expect([...a].sort()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(embaralhar([1, 2, 3, 4, 5, 6, 7, 8], "x")).toEqual(a);
    expect(embaralhar([1, 2, 3, 4, 5, 6, 7, 8], "y")).not.toEqual(a);
  });

  it("a visão mostra as condutas fora da ordem de cadastro, sempre na mesma ordem", () => {
    let e = jogar([{ tipo: "palpite", diagnosticoId: "erliquiose_monocitica" }]);
    const v1 = montarVisao(e, caso, mapa);
    const ids = v1.tratamentosOpcoes!.map((t) => t.id);
    expect([...ids].sort()).toEqual(caso.tratamentos.map((t) => t.id).sort());
    expect(ids).not.toEqual(caso.tratamentos.map((t) => t.id));
    expect(montarVisao(e, caso, mapa).tratamentosOpcoes!.map((t) => t.id)).toEqual(ids);
    e = aplicarAcao(e, { tipo: "tratamento", condutas: [] }, caso, mapa);
    expect(montarVisao(e, caso, mapa).tratamentoCorrigido!.map((t) => t.id)).toEqual(ids);
  });

  it("cada partida tem sua própria ordem, estável para a mesma partida", () => {
    const e = jogar([{ tipo: "palpite", diagnosticoId: "erliquiose_monocitica" }]);
    const ordem = (s: string) => montarVisao(e, caso, mapa, s).tratamentosOpcoes!.map((t) => t.id).join(",");
    expect(ordem("partida:1")).toBe(ordem("partida:1"));
    const distintas = new Set(Array.from({ length: 20 }, (_, i) => ordem(`partida:${i}`)));
    expect(distintas.size).toBeGreaterThan(10);
  });

  it("em muitas partidas, a conduta adequada não ocupa o topo mais que o acaso", () => {
    const e = jogar([{ tipo: "palpite", diagnosticoId: "erliquiose_monocitica" }]);
    const adequadas = new Set(caso.tratamentos.filter((t) => t.classificacao === "adequado").map((t) => t.id));
    const N = 2000;
    let primeiraAdequada = 0;
    for (let i = 0; i < N; i++) if (adequadas.has(montarVisao(e, caso, mapa, `partida:${i}`).tratamentosOpcoes![0].id)) primeiraAdequada++;
    const esperado = adequadas.size / caso.tratamentos.length;
    expect(Math.abs(primeiraAdequada / N - esperado)).toBeLessThan(0.04);
  });

  it("no banco inteiro, adequados e relevantes não ficam concentrados no topo", () => {
    // Fração de itens "bons" entre os primeiros k, comparada com a fração geral
    let bonsNoTopo = 0, topo = 0, bons = 0, total = 0;
    for (const c of casos) {
      const ordem = embaralhar(c.tratamentos, `condutas:${c.id}:${c.versao}`);
      const k = c.tratamentos.filter((t) => t.classificacao === "adequado").length;
      bonsNoTopo += ordem.slice(0, k).filter((t) => t.classificacao === "adequado").length;
      topo += k;
      bons += k;
      total += c.tratamentos.length;
      const ex = embaralhar(c.exames, `exames:${c.id}:${c.versao}`);
      const kr = c.exames.filter((x) => x.classificacao === "relevante").length;
      bonsNoTopo += ex.slice(0, kr).filter((x) => x.classificacao === "relevante").length;
      topo += kr;
      bons += kr;
      total += c.exames.length;
    }
    // Na ordem de cadastro essa fração seria ~100%; embaralhado, fica perto da proporção geral
    expect(bonsNoTopo / topo).toBeLessThan(0.6);
    expect(bonsNoTopo / topo).toBeGreaterThan((bons / total) * 0.5);
  });
});
