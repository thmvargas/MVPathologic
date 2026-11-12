import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { casosLivres } from "@/lib/catalogo";

export const metadata = { title: "Por semestre · Vet em Sete" };
export const dynamic = "force-dynamic";

const CONTEUDO: Record<number, string> = {
  1: "Ciências básicas: anatomia, histologia, fisiologia",
  2: "Ciências básicas: anatomia, histologia, fisiologia",
  3: "Patologia geral, microbiologia, imunologia",
  4: "Patologia geral, microbiologia, imunologia, procedimentos clínicos",
  5: "Clínicas",
  6: "Clínicas",
};

export default async function Semestres() {
  const casos = await casosLivres();
  return (
    <div className="space-y-5 pt-2">
      <h1 className="text-2xl text-marca">Por semestre</h1>
      <p className="text-sm text-suave">Casos compatíveis com o que a turma já estudou. Fora do ranking.</p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {[1, 2, 3, 4, 5, 6].map((n) => {
          const qtd = casos.filter((c) => c.semestre === n).length;
          return (
            <li key={n}>
              <Link
                href={`/semestre/${n}`}
                className="flex min-h-16 items-center gap-3 rounded-lg border border-linha bg-fundo px-4 py-3 hover:border-marca"
              >
                <span className="font-titulo text-2xl font-semibold text-marca">{n}º</span>
                <span className="flex-1">
                  <span className="block text-sm">{CONTEUDO[n]}</span>
                  <span className="block text-xs text-suave">
                    {qtd === 0 ? "Sem casos ainda" : `${qtd} caso${qtd > 1 ? "s" : ""}`}
                  </span>
                </span>
                <ArrowRight aria-hidden size={18} strokeWidth={1.5} className="text-marca" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
