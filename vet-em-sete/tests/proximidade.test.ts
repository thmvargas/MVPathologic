import { describe, expect, it } from "vitest";
import { compararDiagnosticos } from "@/lib/jogo/proximidade";
import { caso, dx } from "./apoio";

const alvo = dx("erliquiose_monocitica");
const difs = caso.diferenciais.map((d) => d.diagnostico_id);

describe("feedback de proximidade", () => {
  it("mesmo grupo de agente (Anaplasmataceae), mesma categoria, mesmo sistema, muito perto", () => {
    expect(compararDiagnosticos(dx("anaplasmose_trombocitica"), alvo, difs)).toEqual({
      sistema: "igual",
      categoria: "igual",
      agente: "mesmo_grupo",
      muitoPerto: true,
    });
  });
  it("mesmo gênero", () => {
    expect(compararDiagnosticos(dx("anaplasmose_bovina"), dx("anaplasmose_trombocitica"), []).agente).toBe("mesmo_genero");
  });
  it("categoria parcial entre bacteriana e parasitária", () => {
    const p = compararDiagnosticos(dx("babesiose_canina"), alvo, difs);
    expect(p.categoria).toBe("parcial");
    expect(p.agente).toBe("diferente");
    expect(p.sistema).toBe("igual");
  });
  it("sistema parcial quando os sistemas se cruzam", () => {
    // leishmaniose: multissistêmico (principal) + hematopoiético
    expect(compararDiagnosticos(dx("leishmaniose_visceral_canina"), alvo, difs).sistema).toBe("parcial");
  });
  it("sem etiqueta de agente quando o palpite não é infeccioso", () => {
    const p = compararDiagnosticos(dx("doenca_renal_cronica"), alvo, difs);
    expect(p).toEqual({ sistema: "diferente", categoria: "diferente", agente: null, muitoPerto: false });
  });
  it("imunomediada no mesmo sistema e diferencial", () => {
    const p = compararDiagnosticos(dx("trombocitopenia_imunomediada"), alvo, difs);
    expect(p.sistema).toBe("igual");
    expect(p.categoria).toBe("diferente");
    expect(p.muitoPerto).toBe(true);
  });
});
