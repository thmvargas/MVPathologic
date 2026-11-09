import "server-only";
import { infoDosCasos, partidasDoPeriodo, perfisDaInstituicao } from "@/lib/consultas";
import { filtrarPartidas } from "@/lib/painel";
import type { FiltrosPainel } from "@/lib/filtrosPainel";

/** Tudo o que o painel e os CSV precisam, já filtrado. */
export async function carregarPainel(instituicao: string, f: FiltrosPainel) {
  const [perfis, brutas] = await Promise.all([perfisDaInstituicao(instituicao), partidasDoPeriodo(f.de, f.ate)]);
  const partidas = filtrarPartidas(brutas, perfis, f);
  const turmas = [...new Set([...perfis.values()].filter((p) => p.papel === "aluno").map((p) => p.turma?.trim()).filter(Boolean) as string[])].sort(
    (a, b) => a.localeCompare(b, "pt-BR"),
  );
  return { perfis, partidas, casos: infoDosCasos(), turmas };
}
