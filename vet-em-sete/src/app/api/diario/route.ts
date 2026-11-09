import { NextResponse } from "next/server";
import { obterSessao } from "@/lib/sessao";
import { obterCasoDoDia } from "@/lib/casoDoDia";
import { banco, casoNaVersao } from "@/lib/dados";
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
  let caso = partida ? await casoNaVersao(partida.caso_id, partida.caso_versao) : await obterCasoDoDia(hoje);
  if (!caso) return NextResponse.json({ erro: "Ainda não há caso do dia publicado." }, { status: 404 });
  partida ??= await criarPartida(userId, caso, "diario", hoje);
  if (partida.caso_id !== caso.id) caso = (await casoNaVersao(partida.caso_id, partida.caso_versao))!;

  return NextResponse.json({
    partidaId: partida.id,
    data: partida.data_caso,
    visao: montarVisao(estadoDaPartida(partida), caso, (await banco()).mapaDiagnosticos),
  });
}
