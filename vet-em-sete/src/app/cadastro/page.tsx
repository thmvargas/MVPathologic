import { redirect } from "next/navigation";
import { obterSessao } from "@/lib/sessao";
import FormCadastro from "./FormCadastro";

export const metadata = { title: "Cadastro · Vet em Sete" };

export default async function Cadastro({ searchParams }: { searchParams: Promise<{ editar?: string }> }) {
  const { editar } = await searchParams;
  const sessao = await obterSessao();
  if (sessao.estado === "anonimo" || sessao.estado === "dominio_recusado") redirect("/entrar");
  if (sessao.estado === "sem_login_configurado") redirect("/");
  if (sessao.estado === "ok" && !editar) redirect("/");

  const professor = sessao.estado === "ok" ? sessao.perfil.papel === "professor" : sessao.professor;
  return (
    <div className="mx-auto max-w-sm space-y-5 pt-4">
      <h1 className="text-2xl text-vinho">{sessao.estado === "ok" ? "Editar cadastro" : "Complete seu cadastro"}</h1>
      {professor && <p className="text-sm text-suave">Conta de professor: semestre e turma não são necessários.</p>}
      <FormCadastro professor={professor} inicial={sessao.estado === "ok" ? sessao.perfil : undefined} />
    </div>
  );
}
