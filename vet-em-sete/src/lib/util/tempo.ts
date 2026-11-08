/**
 * Datas do jogo sempre no horário de Brasília (America/Sao_Paulo),
 * independentemente do fuso do servidor (a Vercel roda em UTC).
 */
export const FUSO_JOGO = "America/Sao_Paulo";

/** "AAAA-MM-DD" da data civil em São Paulo no instante dado. */
export function dataBR(instante: Date = new Date()): string {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO_JOGO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instante);
  const get = (t: string) => partes.find((p) => p.type === t)!.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** "AAAA-MM-DD" → "DD/MM/AAAA" */
export function formatarDataBR(iso: string): string {
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

/** Hash FNV-1a de 32 bits: determinístico e igual em qualquer servidor. */
export function hash32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Caso do dia: se houver caso agendado para a data, ele vale. Senão, sorteio
 * determinístico pela data entre os casos revisados ainda não usados como caso
 * do dia (a espécie sai do caso sorteado). Mesma data → mesmo caso para todos.
 */
export function escolherCasoDoDia<T extends { id: string }>(args: {
  data: string;
  agendado?: string | null;
  revisados: readonly T[];
  jaUsados: ReadonlySet<string>;
}): T | null {
  const { data, agendado, revisados, jaUsados } = args;
  if (agendado) {
    const c = revisados.find((x) => x.id === agendado);
    if (c) return c;
  }
  const ordenados = [...revisados].sort((a, b) => a.id.localeCompare(b.id));
  const livres = ordenados.filter((c) => !jaUsados.has(c.id));
  const pool = livres.length ? livres : ordenados; // banco esgotado: volta a repetir
  if (!pool.length) return null;
  return pool[hash32(data) % pool.length];
}
