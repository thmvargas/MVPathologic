import { redirect } from "next/navigation";
import { config } from "@/lib/config";
import { obterSessao } from "@/lib/sessao";
import FormEntrar from "./FormEntrar";

export const metadata = { title: "Entrar · Vet em Sete" };

function destinoSeguro(v: string | undefined): string {
  return v && v.startsWith("/") && !v.startsWith("//") ? v : "/";
}

export default async function Entrar({ searchParams }: { searchParams: Promise<{ volta?: string; erro?: string }> }) {
  const { volta, erro } = await searchParams;
  const sessao = await obterSessao();
  if (sessao.estado === "ok") redirect(destinoSeguro(volta));
  if (sessao.estado === "sem_cadastro") redirect("/cadastro");

  return (
    <div className="mx-auto max-w-sm space-y-5 pt-4">
      <h1 className="text-2xl text-marca">Entrar</h1>
      {sessao.estado === "sem_login_configurado" ? (
        <p className="text-suave">O login ainda não foi configurado neste servidor.</p>
      ) : (
        <>
          {sessao.estado === "dominio_recusado" && (
            <p role="alert" className="rounded-md border border-destaque-borda bg-destaque-claro p-3 text-sm">
              A conta {sessao.email} não é de um domínio institucional aceito. Entre com o e-mail da instituição.
            </p>
          )}
          {erro && (
            <p role="alert" className="rounded-md border border-destaque-borda bg-destaque-claro p-3 text-sm">
              O link de acesso venceu ou já foi usado. Peça um novo código abaixo.
            </p>
          )}
          <FormEntrar dominios={config.dominios()} volta={destinoSeguro(volta)} />
        </>
      )}
    </div>
  );
}
