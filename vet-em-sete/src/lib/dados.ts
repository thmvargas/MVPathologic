import "server-only";
import diagnosticosJson from "@/dados/diagnosticos.json";
import casoErliquiose from "@/dados/casos/cao-erliquiose-001.json";
import { CasoSchema, DiagnosticoSchema, type Caso, type Diagnostico } from "@/lib/caso/esquema";

/**
 * Fonte dos dados na Etapa 2: arquivos JSON no repositório. Na Etapa 3 esta
 * camada passa a ler do Supabase, sem mudar quem a usa.
 */

const diagnosticos: Diagnostico[] = DiagnosticoSchema.array().parse(diagnosticosJson);
const mapa = new Map(diagnosticos.map((d) => [d.id, d]));
const casos: Caso[] = [CasoSchema.parse(casoErliquiose)];

export function listaDiagnosticos(): Diagnostico[] {
  return diagnosticos;
}
export function mapaDiagnosticos(): Map<string, Diagnostico> {
  return mapa;
}
export function buscarCaso(id: string): Caso | undefined {
  return casos.find((c) => c.id === id);
}
export function listaCasos(): Caso[] {
  return casos;
}
