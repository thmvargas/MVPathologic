/**
 * Regras de filtro dos modos livres (funções puras, testadas em
 * tests/filtros.test.ts).
 */
type CasoMin = { id: string; status: string; grupo_especie: string; semestre: number; sistema: string };

/** Revisados, exceto o caso do dia de hoje e os agendados para o futuro. */
export function filtrarCasosLivres<T extends CasoMin>(
  casos: readonly T[],
  agenda: readonly { data: string; caso_id: string }[],
  hoje: string,
): T[] {
  const bloqueados = new Set(agenda.filter((a) => a.data >= hoje).map((a) => a.caso_id));
  return casos.filter((c) => c.status === "revisado" && !bloqueados.has(c.id));
}

export type Filtro = { especie?: string; semestre?: number; sistema?: string };

export function aplicarFiltro<T extends CasoMin>(casos: readonly T[], f: Filtro): T[] {
  return casos.filter(
    (c) =>
      (!f.especie || c.grupo_especie === f.especie) &&
      (!f.semestre || c.semestre === f.semestre) &&
      (!f.sistema || c.sistema === f.sistema),
  );
}

/**
 * Sorteio do treino: prefere casos que o aluno ainda não jogou; se já jogou
 * todos, sorteia entre todos. `aleatorio` entra como parâmetro para teste.
 */
export function sortearTreino<T extends { id: string }>(
  casos: readonly T[],
  jogados: ReadonlySet<string>,
  aleatorio: () => number = Math.random,
): T | null {
  if (!casos.length) return null;
  const novos = casos.filter((c) => !jogados.has(c.id));
  const pool = novos.length ? novos : casos;
  return pool[Math.floor(aleatorio() * pool.length)];
}
