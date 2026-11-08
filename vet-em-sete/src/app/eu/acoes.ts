"use server";

import { redirect } from "next/navigation";
import { obterSessao } from "@/lib/sessao";
import { supabaseAdmin, supabaseSessao } from "@/lib/supabase/servidor";

/**
 * Exclui os dados do aluno no Vet em Sete (perfil e partidas). Não apaga a
 * conta de login, que é compartilhada com os outros jogos do mesmo projeto.
 */
export async function excluirMeusDados(form: FormData) {
  if (form.get("confirmacao") !== "EXCLUIR") redirect("/eu?erro=confirmacao");
  const sessao = await obterSessao();
  if (sessao.estado !== "ok") redirect("/entrar");
  const db = supabaseAdmin();
  const id = sessao.perfil.id;
  const r1 = await db.from("ves_partidas").delete().eq("user_id", id);
  const r2 = await db.from("ves_perfis").delete().eq("id", id);
  if (r1.error || r2.error) redirect("/eu?erro=falha");
  await (await supabaseSessao()).auth.signOut();
  redirect("/?excluido=1");
}
