import "server-only";
import { cache } from "react";
import { config, loginConfigurado } from "@/lib/config";
import { emailPermitido, ehProfessor } from "@/lib/util/dominio";
import { supabaseAdmin, supabaseSessao } from "@/lib/supabase/servidor";

export type Perfil = {
  id: string;
  email: string;
  nome: string;
  apelido: string;
  semestre: number | null;
  turma: string | null;
  instituicao: string;
  papel: "aluno" | "professor";
};

export type Sessao =
  | { estado: "sem_login_configurado" }
  | { estado: "anonimo" }
  | { estado: "dominio_recusado"; email: string }
  | { estado: "sem_cadastro"; id: string; email: string; professor: boolean }
  | { estado: "ok"; perfil: Perfil };

/**
 * E-mails de professor: os da variável PROFESSOR_EMAILS mais os convidados
 * pelo painel (tabela ves_professores).
 */
export const emailsDeProfessor = cache(async (): Promise<string[]> => {
  const fixos = config.professores();
  if (!loginConfigurado()) return fixos;
  const { data, error } = await supabaseAdmin().from("ves_professores").select("email");
  if (error) return fixos; // migração 002 ainda não rodada
  return [...new Set([...fixos, ...(data ?? []).map((x) => x.email.toLowerCase())])];
});

/** Quem está usando o jogo agora. Cacheado por requisição. */
export const obterSessao = cache(async (): Promise<Sessao> => {
  if (!loginConfigurado()) return { estado: "sem_login_configurado" };
  const supabase = await supabaseSessao();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user?.email) return { estado: "anonimo" };

  // O domínio é conferido de novo a cada acesso: uma conta criada direto pela
  // API do Supabase, com e-mail de fora, não passa daqui.
  const professor = ehProfessor(user.email, await emailsDeProfessor());
  if (!professor && !emailPermitido(user.email, config.dominios()))
    return { estado: "dominio_recusado", email: user.email };

  const { data: perfil, error } = await supabaseAdmin()
    .from("ves_perfis")
    .select("id,email,nome,apelido,semestre,turma,instituicao,papel")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw new Error(`Erro ao ler o perfil: ${error.message}`);
  if (!perfil) return { estado: "sem_cadastro", id: user.id, email: user.email, professor };
  // Papel acompanha a lista de professores da configuração
  const papel = professor ? "professor" : "aluno";
  return { estado: "ok", perfil: { ...(perfil as Perfil), papel } };
});
