import "server-only";
import { GRUPOS_ESPECIE, type GrupoEspecie } from "@/lib/caso/esquema";
import { obterSessao } from "@/lib/sessao";
import { situacaoPorCaso } from "@/lib/partidas";

/** Espécie válida a partir do parâmetro da URL. */
export function lerEspecie(v?: string): GrupoEspecie | undefined {
  return GRUPOS_ESPECIE.find((g) => g === v);
}

/** Espécies presentes, na ordem fixa da lista. */
export function gruposPresentes(lista: { grupo_especie: GrupoEspecie }[]): GrupoEspecie[] {
  const s = new Set(lista.map((c) => c.grupo_especie));
  return GRUPOS_ESPECIE.filter((g) => s.has(g));
}

/** Situação do aluno logado em cada caso (vazio para quem não entrou). */
export async function situacaoDoAluno() {
  const sessao = await obterSessao();
  return sessao.estado === "ok" ? situacaoPorCaso(sessao.perfil.id) : new Map<string, "acertou" | "errou" | "em_andamento">();
}
