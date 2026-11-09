import "server-only";
import { supabaseAdmin } from "@/lib/supabase/servidor";
import { banco } from "@/lib/dados";
import type { PartidaPainel, PerfilPainel } from "@/lib/painel";
import type { PartidaRanking } from "@/lib/ranking";

const LIMITE = 20_000;

/** Perfis da instituição (nome e e-mail só são mostrados ao professor). */
export async function perfisDaInstituicao(instituicao: string): Promise<Map<string, PerfilPainel>> {
  const { data, error } = await supabaseAdmin()
    .from("ves_perfis")
    .select("id,nome,apelido,email,semestre,turma,papel")
    .eq("instituicao", instituicao)
    .limit(LIMITE);
  if (error) throw new Error(`perfis: ${error.message}`);
  return new Map((data ?? []).map((p) => [p.id, p as PerfilPainel]));
}

export async function partidasDoRanking(inicio: string, fim: string): Promise<PartidaRanking[]> {
  const { data, error } = await supabaseAdmin()
    .from("ves_partidas")
    .select("user_id,data_caso,acertou,tentativa_acerto,pontos_total")
    .eq("modo", "diario")
    .eq("conta_ranking", true)
    .eq("finalizada", true)
    .gte("data_caso", inicio)
    .lte("data_caso", fim)
    .limit(LIMITE);
  if (error) throw new Error(`ranking: ${error.message}`);
  return (data ?? []) as PartidaRanking[];
}

export async function partidasDoPeriodo(de: string, ate: string): Promise<PartidaPainel[]> {
  const { data, error } = await supabaseAdmin()
    .from("ves_partidas")
    .select("id,user_id,caso_id,modo,data_caso,sistema,grupo_especie,finalizada,acertou,tentativa_acerto,pontos_total,acoes,atualizada_em")
    .gte("data_caso", de)
    .lte("data_caso", ate)
    .order("data_caso", { ascending: true })
    .limit(LIMITE);
  if (error) throw new Error(`painel: ${error.message}`);
  return (data ?? []) as PartidaPainel[];
}

/** Informação dos casos para o painel (inclui o nome do diagnóstico). */
export async function infoDosCasos() {
  const b = await banco();
  const dx = b.mapaDiagnosticos;
  return new Map(
    b.casos.map((c) => [
      c.id,
      {
        id: c.id,
        diagnosticoNome: dx.get(c.diagnostico_id)?.nome ?? c.diagnostico_id,
        exames: c.exames.map((e) => ({ id: e.id, nome: e.nome, classificacao: e.classificacao })),
        tratamentos: c.tratamentos.map((t) => ({ id: t.id, texto: t.texto, classificacao: t.classificacao })),
      },
    ]),
  );
}
