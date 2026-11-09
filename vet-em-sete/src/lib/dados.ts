import "server-only";
import { cache } from "react";
import diagnosticosJson from "@/dados/diagnosticos.json";
import { CASOS_DO_REPOSITORIO } from "@/dados/casos";
import { CasoSchema, DiagnosticoSchema, type Caso, type Diagnostico } from "@/lib/caso/esquema";
import { loginConfigurado } from "@/lib/config";
import { supabaseAdmin } from "@/lib/supabase/servidor";
import { hash32 } from "@/lib/util/tempo";

/**
 * Banco de casos e diagnósticos.
 *
 * Fonte principal: tabelas ves_casos e ves_diagnosticos no Supabase (editadas
 * pelo painel de administração). Enquanto elas estiverem vazias, ou sem banco
 * configurado, vale o que está nos arquivos do repositório (src/dados).
 */

/** Caso jogável sem login, fora do ranking, na tela inicial. */
export const ID_CASO_EXEMPLO = "cao-erliquiose-001";

/** Código neutro do caso para endereços e navegador (o id revela o diagnóstico). */
export function codigoDoCaso(caso: Pick<Caso, "id">): string {
  return hash32(`vet-em-sete:${caso.id}`).toString(36);
}

export type Banco = {
  origem: "banco" | "repositorio";
  casos: Caso[];
  diagnosticos: Diagnostico[];
  mapaDiagnosticos: Map<string, Diagnostico>;
  buscarCaso: (id: string) => Caso | undefined;
  casoPorCodigo: (codigo: string) => Caso | undefined;
  invalidos: { id: string; erro: string }[];
};

export function repositorio() {
  return {
    casos: CASOS_DO_REPOSITORIO.map((c) => CasoSchema.parse(c)),
    diagnosticos: DiagnosticoSchema.array().parse(diagnosticosJson),
  };
}

function montar(origem: Banco["origem"], casos: Caso[], diagnosticos: Diagnostico[], invalidos: Banco["invalidos"]): Banco {
  const porId = new Map(casos.map((c) => [c.id, c]));
  const porCodigo = new Map(casos.map((c) => [codigoDoCaso(c), c]));
  return {
    origem,
    casos,
    diagnosticos,
    mapaDiagnosticos: new Map(diagnosticos.map((d) => [d.id, d])),
    buscarCaso: (id) => porId.get(id),
    casoPorCodigo: (c) => porCodigo.get(c),
    invalidos,
  };
}

// Cache curto entre requisições da mesma instância (o painel limpa ao salvar).
let memoria: { quando: number; banco: Banco } | null = null;
const VALIDADE_MS = 30_000;

export function limparCacheDoBanco() {
  memoria = null;
}

async function lerDoSupabase(): Promise<Banco | null> {
  const db = supabaseAdmin();
  const [rc, rd] = await Promise.all([
    db.from("ves_casos").select("id,conteudo").limit(5000),
    db.from("ves_diagnosticos").select("id,dados").limit(5000),
  ]);
  // Tabelas ainda não criadas (migração 002 não rodada): usa o repositório.
  if (rc.error || rd.error) {
    console.error("banco:", rc.error?.message ?? rd.error?.message);
    return null;
  }
  if (!rc.data.length && !rd.data.length) return null;

  const invalidos: Banco["invalidos"] = [];
  const casos: Caso[] = [];
  for (const linha of rc.data) {
    const r = CasoSchema.safeParse(linha.conteudo);
    if (r.success) casos.push(r.data);
    else invalidos.push({ id: linha.id, erro: r.error.issues[0]?.message ?? "inválido" });
  }
  const diagnosticos: Diagnostico[] = [];
  for (const linha of rd.data) {
    const r = DiagnosticoSchema.safeParse(linha.dados);
    if (r.success) diagnosticos.push(r.data);
    else invalidos.push({ id: `diagnóstico ${linha.id}`, erro: r.error.issues[0]?.message ?? "inválido" });
  }
  // Se só uma das tabelas tiver dados, completa com o repositório.
  const rep = repositorio();
  return montar(
    "banco",
    rc.data.length ? casos : rep.casos,
    rd.data.length ? diagnosticos : rep.diagnosticos,
    invalidos,
  );
}

/** Banco atual (cacheado por requisição e por 30 s na instância). */
export const banco = cache(async (): Promise<Banco> => {
  if (memoria && Date.now() - memoria.quando < VALIDADE_MS) return memoria.banco;
  const b = (loginConfigurado() && (await lerDoSupabase())) || montar("repositorio", repositorio().casos, repositorio().diagnosticos, []);
  memoria = { quando: Date.now(), banco: b };
  return b;
});

/**
 * Caso na versão em que a partida começou. Se o caso foi editado depois, a
 * versão antiga vem do histórico, e a partida segue sem quebrar.
 */
export async function casoNaVersao(id: string, versao: number): Promise<Caso | undefined> {
  const atual = (await banco()).buscarCaso(id);
  if (atual?.versao === versao || !loginConfigurado()) return atual;
  const { data } = await supabaseAdmin()
    .from("ves_casos_historico")
    .select("conteudo")
    .eq("caso_id", id)
    .eq("versao", versao)
    .maybeSingle();
  const r = data ? CasoSchema.safeParse(data.conteudo) : null;
  return r?.success ? r.data : atual;
}
