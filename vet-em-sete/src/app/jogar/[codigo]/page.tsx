import Link from "next/link";
import { banco } from "@/lib/dados";
import { casoPermitido, type ModoLivre } from "@/lib/catalogo";
import { formatarDataBR } from "@/lib/util/tempo";
import Partida from "@/components/Partida";

const ROTULO: Record<ModoLivre, string> = {
  exemplo: "caso de exemplo, fora do ranking",
  treino: "treino, fora do ranking",
  semestre: "modo por semestre, fora do ranking",
  arquivo: "caso anterior, fora do ranking",
  previa: "pré-visualização do professor",
};

export default async function Jogar({
  params,
  searchParams,
}: {
  params: Promise<{ codigo: string }>;
  searchParams: Promise<{ modo?: string; data?: string }>;
}) {
  const { codigo } = await params;
  const sp = await searchParams;
  const modo: ModoLivre = (["treino", "semestre", "arquivo", "exemplo", "previa"] as const).find((m) => m === sp.modo) ?? "exemplo";
  const caso = (await banco()).casoPorCodigo(codigo);
  if (!caso || !(await casoPermitido(caso, modo)))
    return (
      <div className="space-y-3 pt-4">
        <h1 className="text-2xl text-marca">Caso indisponível</h1>
        <p>Este caso não está disponível neste modo agora.</p>
        <Link href="/" className="text-marca underline">Voltar ao início</Link>
      </div>
    );
  const rotulo =
    modo === "arquivo" && sp.data && /^\d{4}-\d{2}-\d{2}$/.test(sp.data)
      ? `caso do dia ${formatarDataBR(sp.data)}, fora do ranking`
      : ROTULO[modo];
  return <Partida modo={{ tipo: "livre", codigo, modo }} rotulo={rotulo} />;
}
