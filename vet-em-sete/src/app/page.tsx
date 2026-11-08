import Link from "next/link";
import { redirect } from "next/navigation";
import { obterSessao } from "@/lib/sessao";
import { dataBR, formatarDataBR } from "@/lib/util/tempo";
import { Archive, ArrowRight, CalendarDays, Dumbbell, GraduationCap, Stethoscope } from "lucide-react";
import { listaCasos } from "@/lib/dados";
import { ROTULO_GRUPO } from "@/lib/caso/esquema";

const MODOS = [
  { titulo: "Por semestre", texto: "Casos do 1º ao 6º semestre", icone: GraduationCap },
  { titulo: "Treino", texto: "Casos aleatórios, fora do ranking", icone: Dumbbell },
  { titulo: "Casos anteriores", texto: "Arquivo dos casos do dia", icone: Archive },
];

export default async function Inicio({ searchParams }: { searchParams: Promise<{ excluido?: string }> }) {
  const { excluido } = await searchParams;
  const sessao = await obterSessao();
  if (sessao.estado === "sem_cadastro") redirect("/cadastro");
  const exemplo = listaCasos()[0];
  return (
    <div className="space-y-8">
      {excluido && (
        <p role="status" className="rounded-md border border-esmeralda-borda bg-esmeralda-claro p-3 text-sm">
          Seus dados do Vet em Sete foram excluídos.
        </p>
      )}
      <section className="space-y-2 pt-2">
        <h1 className="text-3xl text-vinho">Sete tentativas para o diagnóstico</h1>
        <p className="text-suave">
          A cada palpite errado, uma nova parte do caso aparece: histórico, anamnese, exame físico e exames
          complementares. Depois, escolha o tratamento.
        </p>
      </section>

      <section aria-labelledby="hoje" className="rounded-lg border border-vinho bg-vinho p-4 text-areia">
        <p className="text-xs font-medium uppercase tracking-wide">{formatarDataBR(dataBR())}</p>
        <h2 id="hoje" className="mt-1 text-xl">Caso do dia</h2>
        <p className="mt-1 text-sm">Um caso por dia, igual para todos. Vale para o ranking.</p>
        <Link
          href="/hoje"
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md border border-areia px-4 py-2 font-medium text-areia"
        >
          <CalendarDays aria-hidden size={18} strokeWidth={1.5} />
          {sessao.estado === "ok" ? "Jogar o caso do dia" : "Entrar para jogar"}
          <ArrowRight aria-hidden size={18} strokeWidth={1.5} />
        </Link>
      </section>

      <section aria-labelledby="exemplo" className="rounded-lg border border-vinho-borda bg-vinho-claro p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-vinho">Sem login</p>
        <h2 id="exemplo" className="mt-1 text-xl">Caso de exemplo</h2>
        <p className="mt-1 text-sm">
          {ROTULO_GRUPO[exemplo.grupo_especie]} · {exemplo.semestre}º semestre
        </p>
        <Link
          href={`/jogar/${exemplo.id}`}
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md bg-vinho px-4 py-2 font-medium text-areia hover:opacity-90"
        >
          <Stethoscope aria-hidden size={18} strokeWidth={1.5} />
          Jogar
          <ArrowRight aria-hidden size={18} strokeWidth={1.5} />
        </Link>
      </section>

      <section aria-labelledby="modos" className="space-y-3">
        <h2 id="modos" className="text-lg">Modos de jogo</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {MODOS.map(({ titulo, texto, icone: Icone }) => (
            <li key={titulo} className="flex items-start gap-3 rounded-lg border border-marfim p-4">
              <Icone aria-hidden size={22} strokeWidth={1.5} className="mt-0.5 shrink-0 text-vinho" />
              <div>
                <p className="font-medium">{titulo}</p>
                <p className="text-sm text-suave">{texto}</p>
                <p className="mt-1 text-xs text-suave">Em breve</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
