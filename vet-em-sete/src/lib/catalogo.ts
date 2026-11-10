import "server-only";
import { banco, codigoDoCaso, ID_CASO_EXEMPLO } from "@/lib/dados";
import { loginConfigurado } from "@/lib/config";
import { supabaseAdmin } from "@/lib/supabase/servidor";
import { dataBR } from "@/lib/util/tempo";
import { obterSessao } from "@/lib/sessao";
import type { Caso, GrupoEspecie } from "@/lib/caso/esquema";
import { filtrarCasosLivres } from "@/lib/util/filtros";

export type ModoLivre = "treino" | "semestre" | "arquivo" | "exemplo" | "previa";

/** O que pode aparecer numa lista: nada que revele o diagnóstico ou o sistema. */
export type CartaoCaso = {
  codigo: string;
  grupo_especie: GrupoEspecie;
  especie: string;
  semestre: number;
  dificuldade: number;
  data?: string; // só no arquivo
};

export function cartao(c: Caso, data?: string): CartaoCaso {
  return {
    codigo: codigoDoCaso(c),
    grupo_especie: c.grupo_especie,
    especie: c.especie,
    semestre: c.semestre,
    dificuldade: c.dificuldade,
    ...(data ? { data } : {}),
  };
}

type Agenda = { data: string; caso_id: string }[];

/** Linhas de ves_caso_do_dia (vazio se o banco não estiver configurado). */
async function agenda(): Promise<Agenda> {
  if (!loginConfigurado()) return [];
  const { data, error } = await supabaseAdmin().from("ves_caso_do_dia").select("data,caso_id").order("data", { ascending: false });
  if (error) throw new Error(`agenda: ${error.message}`);
  return data ?? [];
}

/**
 * Casos para treino e modo por semestre: revisados, exceto o caso do dia de
 * hoje e os já agendados para datas futuras (para não estragar a surpresa).
 */
export async function casosLivres(hoje = dataBR()): Promise<Caso[]> {
  return filtrarCasosLivres((await banco()).casos, await agenda(), hoje);
}

/** Casos do dia já passados, do mais recente para o mais antigo. */
export async function casosDoArquivo(hoje = dataBR()): Promise<{ caso: Caso; data: string }[]> {
  const casos = new Map((await banco()).casos.map((c) => [c.id, c]));
  return (await agenda())
    .filter((a) => a.data < hoje && casos.get(a.caso_id)?.status === "revisado")
    .map((a) => ({ caso: casos.get(a.caso_id)!, data: a.data }));
}

/** O caso pode ser jogado neste modo hoje? */
export async function casoPermitido(caso: Caso, modo: ModoLivre): Promise<boolean> {
  if (modo === "previa") {
    // Pré-visualização do painel: qualquer caso, só para professor.
    const s = await obterSessao();
    return s.estado === "ok" && s.perfil.papel === "professor";
  }
  if (modo === "exemplo") return caso.id === ID_CASO_EXEMPLO;
  if (modo === "arquivo") return (await casosDoArquivo()).some((x) => x.caso.id === caso.id);
  return (await casosLivres()).some((c) => c.id === caso.id);
}
