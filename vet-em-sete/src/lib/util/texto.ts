/** Minúsculas, sem acento e sem pontuação: "Doença Renal Crônica" → "doenca renal cronica". */
export function normalizar(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export type ItemBusca = { id: string; nome: string; sinonimos: string[] };

/**
 * Busca do autocompletar. Ordem: nome que começa com o termo, sinônimo que é
 * exatamente o termo (siglas como "DRC"), palavra do nome que começa com o
 * termo, e por fim qualquer ocorrência.
 */
export function buscarDiagnosticos<T extends ItemBusca>(itens: readonly T[], termo: string, limite = 8): T[] {
  const t = normalizar(termo);
  if (!t) return [];
  const pontuados: { item: T; nota: number }[] = [];
  for (const item of itens) {
    const nome = normalizar(item.nome);
    const sins = item.sinonimos.map(normalizar);
    let nota = 0;
    if (nome.startsWith(t)) nota = 4;
    else if (sins.includes(t)) nota = 3.5;
    else if (sins.some((s) => s.startsWith(t))) nota = 3;
    else if (nome.split(" ").some((w) => w.startsWith(t))) nota = 2;
    else if (nome.includes(t) || sins.some((s) => s.includes(t))) nota = 1;
    if (nota) pontuados.push({ item, nota });
  }
  pontuados.sort((a, b) => b.nota - a.nota || a.item.nome.localeCompare(b.item.nome, "pt-BR"));
  return pontuados.slice(0, limite).map((p) => p.item);
}
