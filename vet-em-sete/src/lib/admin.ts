import "server-only";
import { redirect } from "next/navigation";
import { obterSessao, type Perfil } from "@/lib/sessao";

/** Garante que quem chamou é professor; senão manda para o início. */
export async function exigirProfessor(): Promise<Perfil> {
  const s = await obterSessao();
  if (s.estado !== "ok") redirect("/entrar?volta=/admin");
  if (s.perfil.papel !== "professor") redirect("/");
  return s.perfil;
}
