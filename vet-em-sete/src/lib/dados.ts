import "server-only";
import diagnosticosJson from "@/dados/diagnosticos.json";
import casoErliquiose from "@/dados/casos/cao-erliquiose-001.json";
import { hash32 } from "@/lib/util/tempo";
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

/** Caso jogável sem login, fora do ranking, na tela inicial. */
export const ID_CASO_EXEMPLO = "cao-erliquiose-001";

/**
 * Código neutro do caso, usado em endereços e no navegador. O id interno
 * ("cao-erliquiose-001") revela o diagnóstico; o código ("k3f9a2") não.
 */
export function codigoDoCaso(caso: Pick<Caso, "id">): string {
  return hash32(`vet-em-sete:${caso.id}`).toString(36);
}

const porCodigo = new Map(casos.map((c) => [codigoDoCaso(c), c]));
if (porCodigo.size !== casos.length) throw new Error("Dois casos com o mesmo código: renomeie um deles.");

export function casoPorCodigo(codigo: string): Caso | undefined {
  return porCodigo.get(codigo);
}
