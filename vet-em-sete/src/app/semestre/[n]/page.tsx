import Link from "next/link";
import { notFound } from "next/navigation";
import { cartao, casosLivres } from "@/lib/catalogo";
import { aplicarFiltro } from "@/lib/util/filtros";
import { gruposPresentes, lerEspecie, situacaoDoAluno } from "@/lib/paginas";
import { AvisoForaDoRanking, FiltroEspecie, ListaCasos } from "@/components/Catalogo";

export const dynamic = "force-dynamic";

export default async function Semestre({
  params,
  searchParams,
}: {
  params: Promise<{ n: string }>;
  searchParams: Promise<{ especie?: string }>;
}) {
  const n = Number((await params).n);
  if (![1, 2, 3, 4, 5, 6].includes(n)) notFound();
  const especie = lerEspecie((await searchParams).especie);
  const doSemestre = aplicarFiltro(await casosLivres(), { semestre: n });
  const lista = aplicarFiltro(doSemestre, { especie });
  const sit = await situacaoDoAluno();
  return (
    <div className="space-y-4 pt-2">
      <Link href="/semestre" className="text-sm text-vinho underline">Todos os semestres</Link>
      <h1 className="text-2xl text-vinho">{n}º semestre</h1>
      <AvisoForaDoRanking />
      <FiltroEspecie grupos={gruposPresentes(doSemestre)} atual={especie} base={`/semestre/${n}`} />
      <ListaCasos modo="semestre" situacao cartoes={lista.map((c) => ({ ...cartao(c), situacao: sit.get(c.id) }))} />
    </div>
  );
}
