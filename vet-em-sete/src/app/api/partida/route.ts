import { NextResponse } from "next/server";
import { z } from "zod";
import { buscarCaso, mapaDiagnosticos } from "@/lib/dados";
import { estadoInicial, montarVisao } from "@/lib/jogo/motor";
import { assinarEstado, lerEstado } from "@/lib/jogo/token";

const Corpo = z.object({ casoId: z.string().max(100), token: z.string().max(20_000).optional() });

/** Inicia uma partida, ou retoma a partir do token salvo no navegador. */
export async function POST(req: Request) {
  const corpo = Corpo.safeParse(await req.json().catch(() => null));
  if (!corpo.success) return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });
  const caso = buscarCaso(corpo.data.casoId);
  if (!caso) return NextResponse.json({ erro: "Caso não encontrado." }, { status: 404 });

  let estado = corpo.data.token ? lerEstado(corpo.data.token) : null;
  if (!estado || estado.casoId !== caso.id || estado.versao !== caso.versao) estado = estadoInicial(caso);

  return NextResponse.json({ token: assinarEstado(estado), visao: montarVisao(estado, caso, mapaDiagnosticos()) });
}
