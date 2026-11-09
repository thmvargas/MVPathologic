import "server-only";
import { listaCasos, buscarCaso } from "@/lib/dados";
import { supabaseAdmin } from "@/lib/supabase/servidor";
import { escolherCasoDoDia } from "@/lib/util/tempo";
import type { Caso } from "@/lib/caso/esquema";

/**
 * Caso do dia para a data (AAAA-MM-DD, horário de Brasília). Se já houver
 * linha em ves_caso_do_dia (agendada pelo professor ou sorteada por uma visita
 * anterior), ela vale. Senão, sorteia entre os casos revisados e grava, para
 * que todos recebam o mesmo caso e o sorteio não mude depois.
 */
export async function obterCasoDoDia(data: string): Promise<Caso | null> {
  const db = supabaseAdmin();
  // Só casos reservados ao caso do dia entram no sorteio (opção "b").
  const revisados = listaCasos().filter((c) => c.status === "revisado" && c.uso === "diario");

  const { data: linha, error } = await db.from("ves_caso_do_dia").select("caso_id").eq("data", data).maybeSingle();
  if (error) throw new Error(`caso do dia: ${error.message}`);
  if (linha) {
    const c = buscarCaso(linha.caso_id);
    if (c && c.status === "revisado") return c;
  }

  const { data: anteriores, error: e2 } = await db.from("ves_caso_do_dia").select("caso_id").lt("data", data);
  if (e2) throw new Error(`caso do dia: ${e2.message}`);
  const escolhido = escolherCasoDoDia({
    data,
    revisados,
    jaUsados: new Set((anteriores ?? []).map((x) => x.caso_id)),
  });
  if (!escolhido) return null;

  // Se outra requisição gravou primeiro, vale a dela.
  await db.from("ves_caso_do_dia").upsert({ data, caso_id: escolhido.id }, { onConflict: "data", ignoreDuplicates: true });
  const { data: final } = await db.from("ves_caso_do_dia").select("caso_id").eq("data", data).maybeSingle();
  return buscarCaso(final?.caso_id ?? escolhido.id) ?? escolhido;
}
