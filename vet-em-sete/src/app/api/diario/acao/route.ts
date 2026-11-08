import { NextResponse } from "next/server";
import { z } from "zod";
import { obterSessao } from "@/lib/sessao";
import { buscarCaso } from "@/lib/dados";
import { ErroDeJogo } from "@/lib/jogo/motor";
import { buscarPartida, jogarNaPartida } from "@/lib/partidas";

const Corpo = z.object({
  partidaId: z.number().int().positive(),
  acao: z.discriminatedUnion("tipo", [
    z.object({ tipo: z.literal("palpite"), diagnosticoId: z.string().max(100) }),
    z.object({ tipo: z.literal("pular") }),
    z.object({ tipo: z.literal("exame"), exameId: z.string().max(100) }),
    z.object({ tipo: z.literal("tratamento"), condutas: z.array(z.string().max(100)).max(50) }),
  ]),
});

export async function POST(req: Request) {
  const sessao = await obterSessao();
  if (sessao.estado !== "ok") return NextResponse.json({ erro: "Sua sessão expirou. Entre de novo." }, { status: 401 });
  const corpo = Corpo.safeParse(await req.json().catch(() => null));
  if (!corpo.success) return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });

  const partida = await buscarPartida(corpo.data.partidaId, sessao.perfil.id);
  if (!partida) return NextResponse.json({ erro: "Partida não encontrada." }, { status: 404 });
  const caso = buscarCaso(partida.caso_id);
  if (!caso) return NextResponse.json({ erro: "Caso não encontrado." }, { status: 404 });

  try {
    const r = await jogarNaPartida(partida, corpo.data.acao, caso);
    if (r.conflito)
      return NextResponse.json({ erro: "A partida mudou em outra aba. Recarregue a página." }, { status: 409 });
    return NextResponse.json({ partidaId: partida.id, data: partida.data_caso, visao: r.visao });
  } catch (e) {
    if (e instanceof ErroDeJogo) return NextResponse.json({ erro: e.message }, { status: 409 });
    throw e;
  }
}
