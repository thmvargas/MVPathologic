import Link from "next/link";
import { Archive, ArrowRight, CalendarDays, Dumbbell, GraduationCap, Stethoscope } from "lucide-react";
import { listaCasos } from "@/lib/dados";
import { ROTULO_GRUPO } from "@/lib/caso/esquema";

const MODOS = [
  { titulo: "Caso do dia", texto: "Um caso por dia, igual para todos", icone: CalendarDays },
  { titulo: "Por semestre", texto: "Casos do 1º ao 6º semestre", icone: GraduationCap },
  { titulo: "Treino", texto: "Casos aleatórios, fora do ranking", icone: Dumbbell },
  { titulo: "Casos anteriores", texto: "Arquivo dos casos do dia", icone: Archive },
];

export default function Inicio() {
  const exemplo = listaCasos()[0];
  return (
    <div className="space-y-8">
      <section className="space-y-2 pt-2">
        <h1 className="text-3xl text-vinho">Sete tentativas para o diagnóstico</h1>
        <p className="text-suave">
          A cada palpite errado, uma nova parte do caso aparece: histórico, anamnese, exame físico e exames
          complementares. Depois, escolha o tratamento.
        </p>
      </section>

      <section aria-labelledby="exemplo" className="rounded-lg border border-vinho-borda bg-vinho-claro p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-vinho">Versão de teste</p>
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
