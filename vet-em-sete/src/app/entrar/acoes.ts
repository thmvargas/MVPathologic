"use server";

import { config, loginConfigurado } from "@/lib/config";
import { emailPermitido, ehProfessor } from "@/lib/util/dominio";
import { supabaseSessao } from "@/lib/supabase/servidor";
import { emailsDeProfessor } from "@/lib/sessao";

export type Resultado = { ok: true } | { ok: false; erro: string };

function traduzir(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("rate limit") || m.includes("security purposes"))
    return "Muitos pedidos em pouco tempo. Aguarde um minuto e tente de novo.";
  if (m.includes("expired") || m.includes("invalid")) return "Código inválido ou vencido. Peça um novo.";
  return "Não foi possível concluir agora. Tente de novo em instantes.";
}

export async function enviarCodigo(emailBruto: string): Promise<Resultado> {
  if (!loginConfigurado()) return { ok: false, erro: "O login ainda não foi configurado neste servidor." };
  const email = emailBruto.trim().toLowerCase();
  const permitidos = config.dominios();
  if (!ehProfessor(email, await emailsDeProfessor()) && !emailPermitido(email, permitidos))
    return {
      ok: false,
      erro: `Use seu e-mail institucional (${permitidos.map((d) => "@" + d).join(" ou ")}).`,
    };
  const supabase = await supabaseSessao();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true, emailRedirectTo: `${config.siteUrl()}/auth/confirmar` },
  });
  if (error) {
    console.error("signInWithOtp:", error.message);
    return { ok: false, erro: traduzir(error.message) };
  }
  return { ok: true };
}

export async function verificarCodigo(emailBruto: string, codigo: string): Promise<Resultado> {
  const email = emailBruto.trim().toLowerCase();
  const token = codigo.replace(/\D/g, "");
  if (token.length < 6) return { ok: false, erro: "Digite o código completo." };
  const supabase = await supabaseSessao();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error) return { ok: false, erro: traduzir(error.message) };
  return { ok: true };
}
