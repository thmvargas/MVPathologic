import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { CasoSchema, pendenciasDoCaso } from "@/lib/caso/esquema";
import { buscarDiagnosticos } from "@/lib/util/texto";
import { diagnosticos, mapa } from "./apoio";

const dir = path.join(__dirname, "../src/dados/casos");
const arquivos = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));

describe("lista controlada de diagnósticos", () => {
  it("ids únicos", () => {
    expect(new Set(diagnosticos.map((d) => d.id)).size).toBe(diagnosticos.length);
  });
  it("autocompletar acha por sigla e sem acento", () => {
    expect(buscarDiagnosticos(diagnosticos, "DRC")[0].id).toBe("doenca_renal_cronica");
    expect(buscarDiagnosticos(diagnosticos, "erliq")[0].id).toBe("erliquiose_monocitica");
    expect(buscarDiagnosticos(diagnosticos, "doenca renal")[0].id).toBe("doenca_renal_cronica");
    expect(buscarDiagnosticos(diagnosticos, "cushing")[0].id).toBe("hiperadrenocorticismo");
  });
});

describe.each(arquivos)("caso %s", (arquivo) => {
  const bruto = JSON.parse(fs.readFileSync(path.join(dir, arquivo), "utf8"));
  it("segue o esquema", () => {
    expect(() => CasoSchema.parse(bruto)).not.toThrow();
  });
  it("nome do arquivo = id", () => {
    expect(`${bruto.id}.json`).toBe(arquivo);
  });
  it("pendências estruturais: nenhuma (fora os itens 'a revisar')", () => {
    const p = pendenciasDoCaso(CasoSchema.parse(bruto), mapa).filter((x) => !x.problema.includes("a revisar"));
    expect(p).toEqual([]);
  });
  it("caso revisado não pode ter nenhuma pendência", () => {
    const caso = CasoSchema.parse(bruto);
    if (caso.status === "revisado") expect(pendenciasDoCaso(caso, mapa)).toEqual([]);
    else expect(pendenciasDoCaso(caso, mapa).length).toBeGreaterThanOrEqual(0);
  });
});

describe("validador bloqueia aprovação", () => {
  it("caso com itens 'a revisar' tem pendências e não pode ser aprovado", async () => {
    const { caso } = await import("./apoio");
    const copia = structuredClone(caso);
    copia.exames[0].resultado.tabela![0].a_revisar = true;
    copia.tratamentos[0].dose = { texto: "x", fonte: "neer2002", a_revisar: true };
    const p = pendenciasDoCaso(copia, mapa);
    expect(p.filter((x) => x.problema.includes("a revisar")).length).toBe(2);
  });
  it("valor laboratorial com fonte fora das referências gera pendência", async () => {
    const { caso } = await import("./apoio");
    const copia = structuredClone(caso);
    copia.exames[0].resultado.tabela![0].fonte = "fonte_inexistente";
    expect(pendenciasDoCaso(copia, mapa).some((x) => x.problema.includes("fonte_inexistente"))).toBe(true);
  });
});

describe("código neutro do caso", () => {
  it("não revela o id nem o diagnóstico", async () => {
    const { hash32 } = await import("@/lib/util/tempo");
    const { caso } = await import("./apoio");
    const codigo = hash32(`vet-em-sete:${caso.id}`).toString(36);
    expect(codigo).toMatch(/^[a-z0-9]{4,7}$/);
    expect(codigo).not.toContain("erliq");
  });
});

describe("índice de casos do repositório", () => {
  it("lista todos os arquivos .json da pasta", () => {
    const indice = fs.readFileSync(path.join(dir, "index.ts"), "utf8");
    for (const a of arquivos) expect(indice, `${a} não está em src/dados/casos/index.ts`).toContain(`"./${a}"`);
  });
});
