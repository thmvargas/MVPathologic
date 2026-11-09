import { NextResponse } from "next/server";
import { z } from "zod";
import { buscarCaso, casoPorCodigo, mapaDiagnosticos } from "@/lib/dados";
import { aplicarAcao, ErroDeJogo, montarVisao } from "@/lib/jogo/motor";
import { assinarEstado, lerEstado } from "@/lib/jogo/token";
import { AcaoSchema } from "@/lib/jogo/api";
import { buscarPartida, jogarNaPartida } from "@/lib/partidas";
import { obterSessao } from "@/lib/sessao";

const Corpo = z.union([
  z.object({ partidaId: z.number().int().positive(), acao: AcaoSchema }),
  z.object({ token: z.string().max(20_000), acao: AcaoSchema }),
]);

/** Uma jogada em qualquer modo (inclusive o caso do dia, pelo id da partida). */
export async function POST(req: Request) {
  const corpo = Corpo.safeParse(await req.json().catch(() => null));
  if (!corpo.success) return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });
  const { acao } = corpo.data;

  try {
    if ("partidaId" in corpo.data) {
      const sessao = await obterSessao();
      if (sessao.estado !== "ok") return NextResponse.json({ erro: "Sua sessão expirou. Entre de novo." }, { status: 401 });
      const partida = await buscarPartida(corpo.data.partidaId, sessao.perfil.id);
      const caso = partida && buscarCaso(partida.caso_id);
      if (!partida || !caso) return NextResponse.json({ erro: "Partida não encontrada." }, { status: 404 });
      const r = await jogarNaPartida(partida, acao, caso);
      if (r.conflito) return NextResponse.json({ erro: "A partida mudou em outra aba. Recarregue a página." }, { status: 409 });
      return NextResponse.json({ partidaId: partida.id, data: partida.data_caso, visao: r.visao });
    }

    const salvo = lerEstado(corpo.data.token);
    const caso = salvo && casoPorCodigo(salvo.codigo);
    if (!salvo || !caso) return NextResponse.json({ erro: "Partida inválida. Recomece o caso." }, { status: 400 });
    const diagnosticos = mapaDiagnosticos();
    const novo = aplicarAcao({ casoId: caso.id, versao: salvo.versao, acoes: salvo.acoes }, acao, caso, diagnosticos);
    return NextResponse.json({
      token: assinarEstado({ codigo: salvo.codigo, versao: novo.versao, acoes: novo.acoes }),
      visao: montarVisao(novo, caso, diagnosticos),
    });
  } catch (e) {
    if (e instanceof ErroDeJogo) return NextResponse.json({ erro: e.message }, { status: 409 });
    throw e;
  }
}
