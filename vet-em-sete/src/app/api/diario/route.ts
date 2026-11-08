import { NextResponse } from "next/server";
import { obterSessao } from "@/lib/sessao";
import { obterCasoDoDia } from "@/lib/casoDoDia";
import { buscarCaso, mapaDiagnosticos } from "@/lib/dados";
import { montarVisao } from "@/lib/jogo/motor";
import { criarPartida, estadoDaPartida, partidaDiaria } from "@/lib/partidas";
import { dataBR } from "@/lib/util/tempo";

/** Abre (ou retoma) a partida oficial do caso do dia do aluno logado. */
export async function POST() {
  const sessao = await obterSessao();
  if (sessao.estado !== "ok") return NextResponse.json({ erro: "Entre para jogar o caso do dia." }, { status: 401 });
  const hoje = dataBR();
  const userId = sessao.perfil.id;

  let partida = await partidaDiaria(userId, hoje);
  let caso = partida ? buscarCaso(partida.caso_id) : await obterCasoDoDia(hoje);
  if (!caso) return NextResponse.json({ erro: "Ainda não há caso do dia publicado." }, { status: 404 });
  partida ??= await criarPartida(userId, caso, "diario", hoje);
  if (partida.caso_id !== caso.id) caso = buscarCaso(partida.caso_id)!;

  return NextResponse.json({
    partidaId: partida.id,
    data: partida.data_caso,
    visao: montarVisao(estadoDaPartida(partida), caso, mapaDiagnosticos()),
  });
}
