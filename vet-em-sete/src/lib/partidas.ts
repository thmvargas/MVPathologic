import "server-only";
import type { Caso } from "@/lib/caso/esquema";
import { banco } from "@/lib/dados";
import { aplicarAcao, montarVisao, resumir, type Acao, type Estado } from "@/lib/jogo/motor";
import { calcularPontuacao } from "@/lib/jogo/pontuacao";
import { supabaseAdmin } from "@/lib/supabase/servidor";

export type Modo = "diario" | "semestre" | "treino" | "arquivo";

export type LinhaPartida = {
  id: number;
  user_id: string;
  caso_id: string;
  caso_versao: number;
  modo: Modo;
  data_caso: string;
  acoes: Acao[];
  finalizada: boolean;
  atualizada_em: string;
};

const CAMPOS = "id,user_id,caso_id,caso_versao,modo,data_caso,acoes,finalizada,atualizada_em";

export async function partidaDiaria(userId: string, data: string): Promise<LinhaPartida | null> {
  const { data: p, error } = await supabaseAdmin()
    .from("ves_partidas")
    .select(CAMPOS)
    .eq("user_id", userId)
    .eq("modo", "diario")
    .eq("data_caso", data)
    .maybeSingle();
  if (error) throw new Error(`partida: ${error.message}`);
  return p as LinhaPartida | null;
}

export async function criarPartida(userId: string, caso: Caso, modo: Modo, data: string): Promise<LinhaPartida> {
  const db = supabaseAdmin();
  const { data: p, error } = await db
    .from("ves_partidas")
    .insert({
      user_id: userId,
      caso_id: caso.id,
      caso_versao: caso.versao,
      modo,
      data_caso: data,
      grupo_especie: caso.grupo_especie,
      sistema: caso.sistema,
      semestre_caso: caso.semestre,
      conta_ranking: modo === "diario" && caso.status === "revisado",
    })
    .select(CAMPOS)
    .single();
  if (error?.code === "23505" && modo === "diario") {
    const existente = await partidaDiaria(userId, data); // clique duplo: já foi criada
    if (existente) return existente;
  }
  if (error || !p) throw new Error(`criar partida: ${error?.message}`);
  return p as LinhaPartida;
}

export async function buscarPartida(id: number, userId: string): Promise<LinhaPartida | null> {
  const { data: p, error } = await supabaseAdmin()
    .from("ves_partidas")
    .select(CAMPOS)
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(`partida: ${error.message}`);
  return p as LinhaPartida | null;
}

export function estadoDaPartida(p: LinhaPartida): Estado {
  return { casoId: p.caso_id, versao: p.caso_versao, acoes: p.acoes };
}

/**
 * Aplica a ação e grava. Usa a data de atualização como trava otimista: se
 * duas abas mandarem ações ao mesmo tempo, a segunda recebe erro e recarrega.
 */
export async function jogarNaPartida(p: LinhaPartida, acao: Acao, caso: Caso) {
  const diagnosticos = (await banco()).mapaDiagnosticos;
  const novo = aplicarAcao(estadoDaPartida(p), acao, caso, diagnosticos);
  const r = resumir(novo, caso);
  const agora = new Date().toISOString();
  const patch: Record<string, unknown> = { acoes: novo.acoes, atualizada_em: agora };
  if (r.fase !== "diagnostico") {
    patch.acertou = r.tentativaAcerto !== null;
    patch.tentativa_acerto = r.tentativaAcerto;
  }
  if (r.fase === "fim") {
    const pt = calcularPontuacao({
      caso,
      tentativaAcerto: r.tentativaAcerto,
      examesPedidos: r.examesPedidos,
      tratamentoMarcado: r.tratamentoMarcado ?? [],
    });
    Object.assign(patch, { finalizada: true, finalizada_em: agora, pontos_total: pt.total, pontos: pt });
  }
  const { data, error } = await supabaseAdmin()
    .from("ves_partidas")
    .update(patch)
    .eq("id", p.id)
    .eq("atualizada_em", p.atualizada_em)
    .select("id");
  if (error) throw new Error(`salvar partida: ${error.message}`);
  if (!data?.length) return { conflito: true as const };
  return { conflito: false as const, visao: montarVisao(novo, caso, diagnosticos, `partida:${p.id}`) };
}

export type LinhaEstatistica = {
  modo: Modo;
  data_caso: string;
  acertou: boolean | null;
  tentativa_acerto: number | null;
  pontos_total: number | null;
  grupo_especie: string;
  sistema: string;
};

export async function partidasFinalizadas(userId: string): Promise<LinhaEstatistica[]> {
  const { data, error } = await supabaseAdmin()
    .from("ves_partidas")
    .select("modo,data_caso,acertou,tentativa_acerto,pontos_total,grupo_especie,sistema")
    .eq("user_id", userId)
    .eq("finalizada", true)
    .order("data_caso", { ascending: true })
    .limit(5000);
  if (error) throw new Error(`estatísticas: ${error.message}`);
  return (data ?? []) as LinhaEstatistica[];
}

/** Partida ainda não terminada deste caso neste modo (para retomar). */
export async function partidaAberta(userId: string, casoId: string, modo: Modo): Promise<LinhaPartida | null> {
  const { data, error } = await supabaseAdmin()
    .from("ves_partidas")
    .select(CAMPOS)
    .eq("user_id", userId)
    .eq("caso_id", casoId)
    .eq("modo", modo)
    .eq("finalizada", false)
    .order("iniciada_em", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`partida: ${error.message}`);
  return data as LinhaPartida | null;
}

/** Situação do aluno em cada caso já jogado: melhor resultado. */
export async function situacaoPorCaso(userId: string): Promise<Map<string, "acertou" | "errou" | "em_andamento">> {
  const { data, error } = await supabaseAdmin()
    .from("ves_partidas")
    .select("caso_id,finalizada,acertou")
    .eq("user_id", userId)
    .limit(5000);
  if (error) throw new Error(`situação: ${error.message}`);
  const m = new Map<string, "acertou" | "errou" | "em_andamento">();
  for (const p of data ?? []) {
    const atual = m.get(p.caso_id);
    const nova = !p.finalizada ? "em_andamento" : p.acertou ? "acertou" : "errou";
    if (atual === "acertou") continue;
    if (nova === "acertou" || !atual || (atual === "em_andamento" && nova === "errou")) m.set(p.caso_id, nova);
  }
  return m;
}
