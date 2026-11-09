import "server-only";
import { banco } from "@/lib/dados";
import { supabaseAdmin } from "@/lib/supabase/servidor";
import { CasoSchema, pendenciasDoCaso } from "@/lib/caso/esquema";

export type LinhaAdmin = {
  id: string;
  status: string;
  uso: string;
  versao: number;
  atualizado_em: string | null;
  conteudo: Record<string, unknown>;
  valido: boolean;
  problemas: string[];
};

/**
 * Casos como estão no banco (inclusive rascunhos incompletos, que o jogo
 * ignora). `tabelas`: se a migração 002 já foi rodada.
 */
export async function casosParaAdmin(): Promise<{ tabelas: boolean; linhas: LinhaAdmin[] }> {
  const { data, error } = await supabaseAdmin()
    .from("ves_casos")
    .select("id,status,uso,versao,atualizado_em,conteudo")
    .order("atualizado_em", { ascending: false })
    .limit(5000);
  if (error) return { tabelas: false, linhas: [] };
  const b = await banco();
  return {
    tabelas: true,
    linhas: (data ?? []).map((l) => {
      const r = CasoSchema.safeParse(l.conteudo);
      const problemas = r.success
        ? pendenciasDoCaso(r.data, b.mapaDiagnosticos).map((p) => p.problema)
        : r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
      return { ...l, conteudo: l.conteudo as Record<string, unknown>, valido: r.success, problemas };
    }),
  };
}
