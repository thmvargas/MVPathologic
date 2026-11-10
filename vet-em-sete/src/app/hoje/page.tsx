import Link from "next/link";
import { redirect } from "next/navigation";
import { LogIn } from "lucide-react";
import { obterSessao } from "@/lib/sessao";
import { dataBR, formatarDataBR } from "@/lib/util/tempo";
import Partida from "@/components/Partida";

export const metadata = { title: "Caso do dia · Vet em Sete" };
export const dynamic = "force-dynamic";

export default async function Hoje() {
  const sessao = await obterSessao();
  if (sessao.estado === "sem_cadastro") redirect("/cadastro");
  if (sessao.estado === "dominio_recusado") redirect("/entrar");
  if (sessao.estado !== "ok")
    return (
      <div className="space-y-4 pt-4">
        <h1 className="text-2xl text-vinho">Caso do dia</h1>
        {sessao.estado === "sem_login_configurado" ? (
          <p className="text-suave">O login ainda não foi configurado neste servidor.</p>
        ) : (
          <>
            <p>Entre com seu e-mail institucional para jogar o caso do dia e entrar no ranking.</p>
            <Link href="/entrar?volta=/hoje" className="inline-flex min-h-12 items-center gap-2 rounded-md bg-vinho px-4 font-medium text-areia">
              <LogIn aria-hidden size={18} strokeWidth={1.5} />
              Entrar
            </Link>
          </>
        )}
      </div>
    );
  return <Partida modo={{ tipo: "diario" }} rotulo={`caso do dia ${formatarDataBR(dataBR())}`} />;
}
