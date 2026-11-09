import { dataBR } from "@/lib/util/tempo";
import type { Filtros } from "@/lib/painel";

export type FiltrosPainel = Filtros & { de: string; ate: string };

const DATA = /^\d{4}-\d{2}-\d{2}$/;

/** Filtros do painel a partir da URL. Padrão: últimos 30 dias. */
export function lerFiltrosPainel(sp: Record<string, string | undefined>, hoje = dataBR()): FiltrosPainel {
  const inicio = new Date(`${hoje}T12:00:00Z`);
  inicio.setUTCDate(inicio.getUTCDate() - 29);
  let de = sp.de && DATA.test(sp.de) ? sp.de : inicio.toISOString().slice(0, 10);
  let ate = sp.ate && DATA.test(sp.ate) ? sp.ate : hoje;
  if (de > ate) [de, ate] = [ate, de];
  const semestre = Number(sp.semestre);
  return {
    de,
    ate,
    semestre: semestre >= 1 && semestre <= 6 ? semestre : undefined,
    turma: sp.turma?.trim() || undefined,
    modo: sp.modo === "diario" || sp.modo === "livres" ? sp.modo : undefined,
  };
}

export function filtrosParaQuery(f: FiltrosPainel): string {
  const q = new URLSearchParams({ de: f.de, ate: f.ate });
  if (f.semestre) q.set("semestre", String(f.semestre));
  if (f.turma) q.set("turma", f.turma);
  if (f.modo) q.set("modo", f.modo);
  return q.toString();
}
