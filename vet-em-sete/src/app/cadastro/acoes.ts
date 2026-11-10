"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { config } from "@/lib/config";
import { obterSessao } from "@/lib/sessao";
import { supabaseAdmin } from "@/lib/supabase/servidor";

const Dados = z.object({
  nome: z.string().trim().min(3, "Informe seu nome completo.").max(120),
  apelido: z
    .string()
    .trim()
    .min(2, "O apelido precisa de 2 a 24 caracteres.")
    .max(24, "O apelido precisa de 2 a 24 caracteres.")
    .regex(/^[\p{L}\p{N} ._-]+$/u, "Use só letras, números, espaço, ponto, hífen ou sublinhado."),
  semestre: z.coerce.number().int().min(1).max(6).optional(),
  turma: z.string().trim().max(40).optional(),
  aceite: z.literal("on", { message: "É preciso aceitar o aviso de privacidade." }),
});

export type EstadoForm = { erro?: string };

export async function salvarCadastro(_: EstadoForm, form: FormData): Promise<EstadoForm> {
  const sessao = await obterSessao();
  if (sessao.estado !== "sem_cadastro" && sessao.estado !== "ok") return { erro: "Sua sessão expirou. Entre de novo." };
  const professor = sessao.estado === "sem_cadastro" ? sessao.professor : sessao.perfil.papel === "professor";

  const bruto = Object.fromEntries(form.entries());
  const r = Dados.safeParse({
    ...bruto,
    semestre: bruto.semestre || undefined,
    turma: bruto.turma || undefined,
  });
  if (!r.success) return { erro: r.error.issues[0].message };
  if (!professor && (!r.data.semestre || !r.data.turma)) return { erro: "Informe semestre e turma." };

  const id = sessao.estado === "ok" ? sessao.perfil.id : sessao.id;
  const email = sessao.estado === "ok" ? sessao.perfil.email : sessao.email;
  const { error } = await supabaseAdmin()
    .from("ves_perfis")
    .upsert({
      id,
      email,
      nome: r.data.nome,
      apelido: r.data.apelido,
      semestre: professor ? (r.data.semestre ?? null) : r.data.semestre,
      turma: r.data.turma ?? null,
      instituicao: config.instituicao(),
      papel: professor ? "professor" : "aluno",
      aceite_privacidade_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    });
  if (error) {
    if (error.code === "23505") return { erro: "Esse apelido já está em uso. Escolha outro." };
    console.error("cadastro:", error.message);
    return { erro: "Não foi possível salvar agora. Tente de novo." };
  }
  redirect("/");
}
