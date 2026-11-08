import { NextResponse } from "next/server";
import { z } from "zod";
import { buscarCaso, mapaDiagnosticos } from "@/lib/dados";
import { aplicarAcao, ErroDeJogo, montarVisao } from "@/lib/jogo/motor";
import { assinarEstado, lerEstado } from "@/lib/jogo/token";

const Acao = z.discriminatedUnion("tipo", [
  z.object({ tipo: z.literal("palpite"), diagnosticoId: z.string().max(100) }),
  z.object({ tipo: z.literal("pular") }),
  z.object({ tipo: z.literal("exame"), exameId: z.string().max(100) }),
  z.object({ tipo: z.literal("tratamento"), condutas: z.array(z.string().max(100)).max(50) }),
]);
const Corpo = z.object({ token: z.string().max(20_000), acao: Acao });

export async function POST(req: Request) {
  const corpo = Corpo.safeParse(await req.json().catch(() => null));
  if (!corpo.success) return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });
  const estado = lerEstado(corpo.data.token);
  if (!estado) return NextResponse.json({ erro: "Partida inválida. Recomece o caso." }, { status: 400 });
  const caso = buscarCaso(estado.casoId);
  if (!caso) return NextResponse.json({ erro: "Caso não encontrado." }, { status: 404 });

  const diagnosticos = mapaDiagnosticos();
  try {
    const novo = aplicarAcao(estado, corpo.data.acao, caso, diagnosticos);
    return NextResponse.json({ token: assinarEstado(novo), visao: montarVisao(novo, caso, diagnosticos) });
  } catch (e) {
    if (e instanceof ErroDeJogo) return NextResponse.json({ erro: e.message }, { status: 409 });
    throw e;
  }
}
