import { describe, expect, it } from "vitest";
import { dataBR, escolherCasoDoDia, formatarDataBR } from "@/lib/util/tempo";

describe("data no horário de Brasília", () => {
  it("23h30 de Brasília (02h30 UTC do dia seguinte) ainda é o mesmo dia", () => {
    expect(dataBR(new Date("2026-11-09T02:30:00Z"))).toBe("2026-11-08");
  });
  it("vira à meia-noite de Brasília (03h00 UTC)", () => {
    expect(dataBR(new Date("2026-11-09T02:59:59Z"))).toBe("2026-11-08");
    expect(dataBR(new Date("2026-11-09T03:00:00Z"))).toBe("2026-11-09");
  });
  it("formata DD/MM/AAAA", () => {
    expect(formatarDataBR("2026-11-08")).toBe("08/11/2026");
  });
});

describe("escolha do caso do dia", () => {
  const casos = ["a", "b", "c", "d", "e"].map((id) => ({ id }));
  it("caso agendado tem prioridade", () => {
    expect(escolherCasoDoDia({ data: "2026-11-08", agendado: "c", revisados: casos, jaUsados: new Set() })?.id).toBe("c");
  });
  it("agendado que não está revisado é ignorado", () => {
    const r = escolherCasoDoDia({ data: "2026-11-08", agendado: "x", revisados: casos, jaUsados: new Set() });
    expect(casos.map((c) => c.id)).toContain(r?.id);
  });
  it("sorteio é determinístico pela data e independe da ordem da lista", () => {
    const a = escolherCasoDoDia({ data: "2026-11-08", revisados: casos, jaUsados: new Set() });
    const b = escolherCasoDoDia({ data: "2026-11-08", revisados: [...casos].reverse(), jaUsados: new Set() });
    expect(a?.id).toBe(b?.id);
  });
  it("datas diferentes variam", () => {
    const ids = new Set(
      Array.from({ length: 30 }, (_, i) => escolherCasoDoDia({ data: `2026-12-${String(i + 1).padStart(2, "0")}`, revisados: casos, jaUsados: new Set() })?.id),
    );
    expect(ids.size).toBeGreaterThan(1);
  });
  it("evita casos já usados e volta a repetir quando o banco acaba", () => {
    const usados = new Set(["a", "b", "c", "d"]);
    expect(escolherCasoDoDia({ data: "2026-11-08", revisados: casos, jaUsados: usados })?.id).toBe("e");
    expect(escolherCasoDoDia({ data: "2026-11-08", revisados: casos, jaUsados: new Set(["a", "b", "c", "d", "e"]) })).not.toBeNull();
  });
  it("sem casos revisados, sem caso do dia", () => {
    expect(escolherCasoDoDia({ data: "2026-11-08", revisados: [], jaUsados: new Set() })).toBeNull();
  });
});
