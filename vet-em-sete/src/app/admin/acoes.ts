"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirProfessor } from "@/lib/admin";
import { banco, limparCacheDoBanco, repositorio } from "@/lib/dados";
import { CasoSchema, DiagnosticoSchema, pendenciasDoCaso, type Pendencia } from "@/lib/caso/esquema";
import { supabaseAdmin } from "@/lib/supabase/servidor";
import { dataBR } from "@/lib/util/tempo";
import { dominioDoEmail } from "@/lib/util/dominio";

export type Resposta = { ok: boolean; mensagem: string; pendencias?: Pendencia[]; id?: string };

const falha = (mensagem: string, extra: Partial<Resposta> = {}): Resposta => ({ ok: false, mensagem, ...extra });

async function exigirBancoImportado(): Promise<string | null> {
  const { count, error } = await supabaseAdmin().from("ves_casos").select("id", { count: "exact", head: true });
  if (error) return "As tabelas de administração ainda não existem. Rode supabase/ves_002_casos_admin.sql no Supabase.";
  if (!count) return "Antes de editar, importe os casos do repositório (botão na lista de casos).";
  return null;
}

// ---------------------------------------------------------------------------
// Casos
// ---------------------------------------------------------------------------

export async function salvarCaso(json: string, acao: "salvar" | "aprovar" | "rascunho" | "arquivar", novo: boolean): Promise<Resposta> {
  const prof = await exigirProfessor();
  const bloqueio = await exigirBancoImportado();
  if (bloqueio) return falha(bloqueio);

  let bruto: Record<string, unknown>;
  try {
    bruto = JSON.parse(json);
  } catch {
    return falha("Conteúdo inválido (JSON mal formado).");
  }
  const id = String(bruto.id ?? "");
  if (!/^[a-z0-9-]{3,80}$/.test(id)) return falha("O identificador deve ter só letras minúsculas, números e hífen (ex.: gato-lipidose-001).");

  const db = supabaseAdmin();
  const { data: atual } = await db.from("ves_casos").select("versao,conteudo,status").eq("id", id).maybeSingle();
  if (novo && atual) return falha(`Já existe um caso com o identificador "${id}".`);
  if (!novo && !atual) return falha("Caso não encontrado.");

  const status = acao === "aprovar" ? "revisado" : acao === "arquivar" ? "arquivado" : acao === "rascunho" ? "rascunho" : (bruto.status as string) || "rascunho";
  const conteudo: Record<string, unknown> = { ...bruto, status };

  // Um caso revisado que for alterado volta a rascunho (precisa de nova aprovação).
  const mudouConteudo = atual && JSON.stringify({ ...(atual.conteudo as object), status: null, versao: null, revisao: null }) !==
    JSON.stringify({ ...conteudo, status: null, versao: null, revisao: null });
  if (acao === "salvar" && atual?.status === "revisado" && mudouConteudo) conteudo.status = "rascunho";

  const versao = atual ? (mudouConteudo ? atual.versao + 1 : atual.versao) : 1;
  conteudo.versao = versao;

  const r = CasoSchema.safeParse(conteudo);
  let pendencias: Pendencia[] = [];
  if (r.success) pendencias = pendenciasDoCaso(r.data, (await banco()).mapaDiagnosticos);
  if (acao === "aprovar") {
    if (!r.success) return falha("O caso ainda não está completo.", { pendencias: r.error.issues.map((i) => ({ campo: i.path.join("."), problema: i.message })) });
    if (pendencias.length) return falha("Resolva as pendências antes de aprovar.", { pendencias });
    conteudo.revisao = { ...(conteudo.revisao as object), revisor: prof.nome, revisado_em: dataBR() };
  }

  const agora = new Date().toISOString();
  const { error } = await db.from("ves_casos").upsert({
    id,
    status: conteudo.status,
    uso: conteudo.uso === "treino" ? "treino" : "diario",
    versao,
    conteudo,
    atualizado_em: agora,
    atualizado_por: prof.email,
    ...(atual ? {} : { criado_em: agora }),
  });
  if (error) return falha(`Não foi possível salvar: ${error.message}`);
  await db.from("ves_casos_historico").upsert({ caso_id: id, versao, conteudo, salvo_em: agora, salvo_por: prof.email });

  limparCacheDoBanco();
  revalidatePath("/admin/casos");
  const avisoFormato = r.success ? "" : " Atenção: ainda há campos obrigatórios faltando; o caso só aparece no jogo quando estiver completo.";
  const msg =
    acao === "aprovar" ? "Caso aprovado. Já pode entrar no caso do dia e no treino." :
    acao === "arquivar" ? "Caso arquivado." :
    conteudo.status === "rascunho" && atual?.status === "revisado" ? "Salvo. Como o caso foi alterado, voltou a rascunho e precisa de nova aprovação." :
    "Salvo.";
  return { ok: true, mensagem: msg + avisoFormato, pendencias, id };
}

export async function excluirCaso(id: string): Promise<Resposta> {
  await exigirProfessor();
  const db = supabaseAdmin();
  const { data: c } = await db.from("ves_casos").select("status").eq("id", id).maybeSingle();
  if (!c) return falha("Caso não encontrado.");
  if (c.status !== "rascunho") return falha("Só rascunhos podem ser excluídos. Casos já aprovados podem ser arquivados.");
  const { count } = await db.from("ves_partidas").select("id", { count: "exact", head: true }).eq("caso_id", id);
  if (count) return falha("Este caso já foi jogado; arquive em vez de excluir.");
  await db.from("ves_casos_historico").delete().eq("caso_id", id);
  const { error } = await db.from("ves_casos").delete().eq("id", id);
  if (error) return falha(error.message);
  limparCacheDoBanco();
  revalidatePath("/admin/casos");
  return { ok: true, mensagem: "Caso excluído." };
}

/** Copia para o banco os casos e diagnósticos do repositório que ainda não estão lá. */
export async function importarRepositorio(): Promise<Resposta> {
  const prof = await exigirProfessor();
  const db = supabaseAdmin();
  const rep = repositorio();
  const [rc, rd] = await Promise.all([db.from("ves_casos").select("id"), db.from("ves_diagnosticos").select("id")]);
  if (rc.error || rd.error) return falha("As tabelas ainda não existem. Rode supabase/ves_002_casos_admin.sql no Supabase.");
  const casosExistentes = new Set(rc.data.map((x) => x.id));
  const dxExistentes = new Set(rd.data.map((x) => x.id));
  const agora = new Date().toISOString();

  const dx = rep.diagnosticos.filter((d) => !dxExistentes.has(d.id));
  if (dx.length) {
    const { error } = await db.from("ves_diagnosticos").insert(dx.map((d) => ({ id: d.id, nome: d.nome, dados: d, atualizado_por: prof.email })));
    if (error) return falha(`Diagnósticos: ${error.message}`);
  }
  const casos = rep.casos.filter((c) => !casosExistentes.has(c.id));
  if (casos.length) {
    const { error } = await db.from("ves_casos").insert(
      casos.map((c) => ({ id: c.id, status: c.status, uso: c.uso, versao: c.versao, conteudo: c, atualizado_por: prof.email, criado_em: agora })),
    );
    if (error) return falha(`Casos: ${error.message}`);
    await db.from("ves_casos_historico").upsert(casos.map((c) => ({ caso_id: c.id, versao: c.versao, conteudo: c, salvo_por: prof.email })));
  }
  limparCacheDoBanco();
  revalidatePath("/admin/casos");
  return { ok: true, mensagem: `Importados ${casos.length} caso(s) e ${dx.length} diagnóstico(s). Os que já estavam no banco não foram alterados.` };
}

// ---------------------------------------------------------------------------
// Diagnósticos
// ---------------------------------------------------------------------------

export async function salvarDiagnostico(json: string): Promise<Resposta> {
  const prof = await exigirProfessor();
  const bloqueio = await exigirBancoImportado();
  if (bloqueio) return falha(bloqueio);
  let bruto: unknown;
  try {
    bruto = JSON.parse(json);
  } catch {
    return falha("Conteúdo inválido.");
  }
  const r = DiagnosticoSchema.safeParse(bruto);
  if (!r.success) return falha(`Verifique o campo ${r.error.issues[0].path.join(".")}: ${r.error.issues[0].message}`);
  const d = r.data;
  const { error } = await supabaseAdmin()
    .from("ves_diagnosticos")
    .upsert({ id: d.id, nome: d.nome, dados: d, atualizado_em: new Date().toISOString(), atualizado_por: prof.email });
  if (error) return falha(error.message);
  limparCacheDoBanco();
  revalidatePath("/admin/diagnosticos");
  return { ok: true, mensagem: `"${d.nome}" salvo.` };
}

export async function excluirDiagnostico(id: string): Promise<Resposta> {
  await exigirProfessor();
  const db = supabaseAdmin();
  const { data } = await db.from("ves_casos").select("id,conteudo");
  const usado = (data ?? []).filter((c) => {
    const x = c.conteudo as { diagnostico_id?: string; diferenciais?: { diagnostico_id: string }[] };
    return x.diagnostico_id === id || x.diferenciais?.some((d) => d.diagnostico_id === id);
  });
  if (usado.length) return falha(`Em uso nos casos: ${usado.map((c) => c.id).join(", ")}.`);
  const { error } = await db.from("ves_diagnosticos").delete().eq("id", id);
  if (error) return falha(error.message);
  limparCacheDoBanco();
  revalidatePath("/admin/diagnosticos");
  return { ok: true, mensagem: "Diagnóstico excluído." };
}

// ---------------------------------------------------------------------------
// Agenda do caso do dia
// ---------------------------------------------------------------------------

const Data = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export async function agendar(data: string, casoId: string): Promise<Resposta> {
  await exigirProfessor();
  if (!Data.safeParse(data).success) return falha("Data inválida.");
  const hoje = dataBR();
  if (data < hoje) return falha("Não é possível mudar dias que já passaram.");
  const caso = (await banco()).buscarCaso(casoId);
  if (!caso || caso.status !== "revisado") return falha("Só casos aprovados podem ser agendados.");
  if (caso.uso !== "diario") return falha('Este caso está marcado como "só treino".');
  const db = supabaseAdmin();
  if (data === hoje) {
    const { count } = await db.from("ves_partidas").select("id", { count: "exact", head: true }).eq("modo", "diario").eq("data_caso", hoje);
    if (count) return falha("Alguém já começou o caso do dia de hoje; não dá para trocar agora.");
  }
  const { error } = await db.from("ves_caso_do_dia").upsert({ data, caso_id: casoId, agendado: true });
  if (error) return falha(error.message);
  revalidatePath("/admin/agenda");
  return { ok: true, mensagem: "Agendado." };
}

export async function desagendar(data: string): Promise<Resposta> {
  await exigirProfessor();
  const hoje = dataBR();
  if (!Data.safeParse(data).success || data <= hoje) return falha("Só datas futuras podem ser liberadas.");
  const { error } = await supabaseAdmin().from("ves_caso_do_dia").delete().eq("data", data);
  if (error) return falha(error.message);
  revalidatePath("/admin/agenda");
  return { ok: true, mensagem: "Data liberada: o caso será sorteado no dia." };
}

// ---------------------------------------------------------------------------
// Professores convidados
// ---------------------------------------------------------------------------

export async function adicionarProfessor(emailBruto: string): Promise<Resposta> {
  const prof = await exigirProfessor();
  const email = emailBruto.trim().toLowerCase();
  if (!dominioDoEmail(email)) return falha("E-mail inválido.");
  const { error } = await supabaseAdmin().from("ves_professores").upsert({ email, adicionado_por: prof.email });
  if (error) return falha(error.message.includes("does not exist") ? "Rode a migração 002 no Supabase antes." : error.message);
  revalidatePath("/admin/professores");
  return { ok: true, mensagem: `${email} agora entra como professor. Avise que o acesso é pelo mesmo endereço do jogo.` };
}

export async function removerProfessor(email: string): Promise<Resposta> {
  const prof = await exigirProfessor();
  if (email === prof.email) return falha("Você não pode remover a si mesmo.");
  const { error } = await supabaseAdmin().from("ves_professores").delete().eq("email", email);
  if (error) return falha(error.message);
  revalidatePath("/admin/professores");
  return { ok: true, mensagem: "Removido." };
}
