import type { Categoria, Diagnostico } from "@/lib/caso/esquema";

/**
 * Feedback de proximidade de um palpite errado.
 *
 * - sistema:   "igual" (mesmo sistema principal), "parcial" (os sistemas se
 *              cruzam), "diferente".
 * - categoria: "igual", "parcial" (ambas infecciosas/parasitárias, mas de
 *              tipo diferente), "diferente".
 * - agente:    "mesmo_genero", "mesmo_grupo", "diferente", ou null quando um
 *              dos dois diagnósticos não tem agente etiológico cadastrado.
 * - muitoPerto: o palpite é um diagnóstico diferencial importante do caso.
 */
export type Nivel = "igual" | "parcial" | "diferente";
export type NivelAgente = "mesmo_genero" | "mesmo_grupo" | "diferente";

export type Proximidade = {
  sistema: Nivel;
  categoria: Nivel;
  agente: NivelAgente | null;
  muitoPerto: boolean;
};

const INFECCIOSAS: ReadonlySet<Categoria> = new Set([
  "infecciosa_viral",
  "infecciosa_bacteriana",
  "infecciosa_fungica",
  "infecciosa_parasitaria",
]);

const norm = (s?: string) => (s ?? "").trim().toLowerCase();

export function compararDiagnosticos(
  palpite: Diagnostico,
  alvo: Diagnostico,
  diferenciais: readonly string[],
): Proximidade {
  // Sistema
  let sistema: Nivel = "diferente";
  if (palpite.sistemas[0] === alvo.sistemas[0]) sistema = "igual";
  else if (palpite.sistemas.some((s) => alvo.sistemas.includes(s))) sistema = "parcial";

  // Categoria
  let categoria: Nivel = "diferente";
  if (palpite.categoria === alvo.categoria) categoria = "igual";
  else if (INFECCIOSAS.has(palpite.categoria) && INFECCIOSAS.has(alvo.categoria)) categoria = "parcial";

  // Agente
  let agente: NivelAgente | null = null;
  const temAgente = (d: Diagnostico) => Boolean(d.agente_genero || d.agente_grupo);
  if (temAgente(palpite) && temAgente(alvo)) {
    if (palpite.agente_genero && norm(palpite.agente_genero) === norm(alvo.agente_genero)) agente = "mesmo_genero";
    else if (palpite.agente_grupo && norm(palpite.agente_grupo) === norm(alvo.agente_grupo)) agente = "mesmo_grupo";
    else agente = "diferente";
  }

  return { sistema, categoria, agente, muitoPerto: diferenciais.includes(palpite.id) };
}
