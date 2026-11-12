import { Shuffle } from "lucide-react";
import { casosLivres } from "@/lib/catalogo";
import { ROTULO_GRUPO, ROTULO_SISTEMA } from "@/lib/caso/esquema";
import { gruposPresentes } from "@/lib/paginas";
import { AvisoForaDoRanking } from "@/components/Catalogo";
import { sortear } from "./acoes";

export const metadata = { title: "Treino · Vet em Sete" };
export const dynamic = "force-dynamic";

export default async function Treino({
  searchParams,
}: {
  searchParams: Promise<{ vazio?: string; especie?: string; semestre?: string; sistema?: string }>;
}) {
  const sp = await searchParams;
  const casos = await casosLivres();
  const grupos = gruposPresentes(casos);
  const sistemas = [...new Set(casos.map((c) => c.sistema))].sort((a, b) => ROTULO_SISTEMA[a].localeCompare(ROTULO_SISTEMA[b], "pt-BR"));
  const semestres = [...new Set(casos.map((c) => c.semestre))].sort();
  const campo = "min-h-12 w-full rounded-md border border-texto/40 bg-fundo px-3 text-base";
  return (
    <div className="space-y-5 pt-2">
      <h1 className="text-2xl text-marca">Treino</h1>
      <p className="text-sm">Um caso aleatório do banco, de preferência um que você ainda não jogou.</p>
      <AvisoForaDoRanking />
      {casos.length === 0 ? (
        <p className="rounded-md border border-linha p-3 text-sm text-suave">
          Ainda não há casos liberados para treino. O caso do dia de hoje só entra no treino amanhã.
        </p>
      ) : (
        <form action={sortear} className="space-y-3">
          <label className="block space-y-1">
            <span className="text-sm font-medium">Espécie</span>
            <select name="especie" defaultValue={sp.especie ?? ""} className={campo}>
              <option value="">Todas</option>
              {grupos.map((g) => <option key={g} value={g}>{ROTULO_GRUPO[g]}</option>)}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Semestre</span>
            <select name="semestre" defaultValue={sp.semestre ?? ""} className={campo}>
              <option value="">Todos</option>
              {semestres.map((s) => <option key={s} value={s}>{s}º semestre</option>)}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Sistema</span>
            <select name="sistema" defaultValue={sp.sistema ?? ""} className={campo}>
              <option value="">Todos</option>
              {sistemas.map((s) => <option key={s} value={s}>{ROTULO_SISTEMA[s]}</option>)}
            </select>
          </label>
          {sp.vazio && <p role="alert" className="text-sm text-destaque-escuro">Nenhum caso com esses filtros. Tente outra combinação.</p>}
          <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-marca px-4 font-medium text-fundo">
            <Shuffle aria-hidden size={18} strokeWidth={1.5} />
            Sortear caso
          </button>
        </form>
      )}
    </div>
  );
}
