import diagnosticosJson from "@/dados/diagnosticos.json";
import casoJson from "@/dados/casos/cao-erliquiose-001.json";
import { CasoSchema, DiagnosticoSchema } from "@/lib/caso/esquema";

export const diagnosticos = DiagnosticoSchema.array().parse(diagnosticosJson);
export const mapa = new Map(diagnosticos.map((d) => [d.id, d]));
export const caso = CasoSchema.parse(casoJson);
export const dx = (id: string) => {
  const d = mapa.get(id);
  if (!d) throw new Error(`sem diagnóstico ${id}`);
  return d;
};
