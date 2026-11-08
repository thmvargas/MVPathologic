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
    const t = assinarEstado(e);
    expect(lerEstado(t)).toEqual(e);
    const [corpo, sig] = t.split(".");
    const falso = Buffer.from(JSON.stringify({ ...e, acoes: [] })).toString("base64url");
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
