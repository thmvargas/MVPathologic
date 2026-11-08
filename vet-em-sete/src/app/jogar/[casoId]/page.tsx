import { notFound } from "next/navigation";
import { buscarCaso } from "@/lib/dados";
import Partida from "@/components/Partida";

export default async function JogarCaso({ params }: { params: Promise<{ casoId: string }> }) {
  const { casoId } = await params;
  if (!buscarCaso(casoId)) notFound();
  return <Partida modo={{ tipo: "exemplo", casoId }} rotulo="caso de exemplo, fora do ranking" />;
}
