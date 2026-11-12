import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { banco } from "@/lib/dados";
import { casoPermitido } from "@/lib/catalogo";
import { estadoInicial, montarVisao } from "@/lib/jogo/motor";
import { assinarEstado, lerEstado } from "@/lib/jogo/token";
import { ModoLivreSchema } from "@/lib/jogo/api";
import { criarPartida, estadoDaPartida, partidaAberta } from "@/lib/partidas";
import { obterSessao } from "@/lib/sessao";
import { dataBR } from "@/lib/util/tempo";

const Corpo = z.object({
  codigo: z.string().max(20),
  modo: ModoLivreSchema,
  token: z.string().max(20_000).optional(),
  novo: z.boolean().optional(),
});

/**
 * Abre um caso nos modos fora do ranking (treino, semestre, arquivo, exemplo).
 * Aluno logado: a partida é gravada no banco (entra nas estatísticas e no
 * painel do professor). Sem login: o estado vai num token assinado.
 */
export async function POST(req: Request) {
  const corpo = Corpo.safeParse(await req.json().catch(() => null));
  if (!corpo.success) return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });
  const { codigo, modo, token, novo } = corpo.data;
  const b = await banco();
  const caso = b.casoPorCodigo(codigo);
  if (!caso || !(await casoPermitido(caso, modo)))
    return NextResponse.json({ erro: "Este caso não está disponível neste modo." }, { status: 404 });

  const diagnosticos = b.mapaDiagnosticos;
  const sessao = await obterSessao();
  if (sessao.estado === "ok" && modo !== "exemplo" && modo !== "previa") {
    const uid = sessao.perfil.id;
    const p = (!novo && (await partidaAberta(uid, caso.id, modo))) || (await criarPartida(uid, caso, modo, dataBR()));
    return NextResponse.json({ partidaId: p.id, data: p.data_caso, visao: montarVisao(estadoDaPartida(p), caso, diagnosticos, `partida:${p.id}`) });
  }

  const salvo = token && !novo ? lerEstado(token) : null;
  const valido = salvo && salvo.codigo === codigo && salvo.versao === caso.versao;
  const acoes = valido ? salvo.acoes : [];
  // Partida sem login: semente sorteada no início e guardada no token assinado
  const semente = (valido && salvo.semente) || randomUUID();
  const estado = { ...estadoInicial(caso), acoes };
  return NextResponse.json({
    token: assinarEstado({ codigo, versao: caso.versao, acoes, semente }),
    visao: montarVisao(estado, caso, diagnosticos, `token:${semente}`),
  });
}
