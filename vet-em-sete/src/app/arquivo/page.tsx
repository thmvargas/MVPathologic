import { cartao, casosDoArquivo } from "@/lib/catalogo";
import { gruposPresentes, lerEspecie, situacaoDoAluno } from "@/lib/paginas";
import { AvisoForaDoRanking, FiltroEspecie, ListaCasos } from "@/components/Catalogo";

export const metadata = { title: "Casos anteriores · Vet em Sete" };
export const dynamic = "force-dynamic";

export default async function Arquivo({ searchParams }: { searchParams: Promise<{ especie?: string }> }) {
  const especie = lerEspecie((await searchParams).especie);
  const todos = await casosDoArquivo();
  const lista = todos.filter((x) => !especie || x.caso.grupo_especie === especie);
  const sit = await situacaoDoAluno();
  return (
    <div className="space-y-4 pt-2">
      <h1 className="text-2xl text-vinho">Casos anteriores</h1>
      <AvisoForaDoRanking />
      <FiltroEspecie grupos={gruposPresentes(todos.map((x) => x.caso))} atual={especie} base="/arquivo" />
      <ListaCasos modo="arquivo" situacao cartoes={lista.map((x) => ({ ...cartao(x.caso, x.data), situacao: sit.get(x.caso.id) }))} />
    </div>
  );
}
