"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, BookOpen, ChartColumn, CircleAlert, ClipboardList, Copy, History, Info, ListChecks, MessageSquareText,
  PawPrint, Pill, RotateCcw, Send, SkipForward, Stethoscope, TestTubes,
} from "lucide-react";
import type { Acao, PalpiteVisto, Visao } from "@/lib/jogo/motor";
import { ROTULO_GRUPO } from "@/lib/caso/esquema";
import type { ItemBusca } from "@/lib/util/texto";
import { dataBR } from "@/lib/util/tempo";
import { textoCompartilhar } from "@/lib/jogo/compartilhar";
import { Bloco, BlocoBloqueado, ListaBlocos } from "./Bloco";
import { Autocompletar } from "./Autocompletar";
import { Etiquetas } from "./Etiquetas";
import { EscolhaExame, ResultadoExame } from "./Exames";
import { EscolhaTratamento, TratamentoCorrigido } from "./Tratamento";

const chave = (casoId: string) => `vet-em-sete:partida:${casoId}`;

function lerSalvo(casoId: string): string | undefined {
  try {
    return localStorage.getItem(chave(casoId)) ?? undefined;
  } catch {
    return undefined;
  }
}
function salvar(casoId: string, token: string | null) {
  try {
    if (token) localStorage.setItem(chave(casoId), token);
    else localStorage.removeItem(chave(casoId));
  } catch {
    /* navegador sem armazenamento: a partida só não é retomada */
  }
}

export type ModoLivre = "treino" | "semestre" | "arquivo" | "exemplo" | "previa";
export type ModoPartida = { tipo: "diario" } | { tipo: "livre"; codigo: string; modo: ModoLivre };

export default function Partida({ modo, rotulo }: { modo: ModoPartida; rotulo: string }) {
  const chaveLocal = modo.tipo === "livre" ? `${modo.modo}:${modo.codigo}` : "diario";
  const [token, setToken] = useState<string | null>(null);
  const [partidaId, setPartidaId] = useState<number | null>(null);
  const [dataCaso, setDataCaso] = useState<string | null>(null);
  const [visao, setVisao] = useState<Visao | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [diagnosticos, setDiagnosticos] = useState<ItemBusca[]>([]);
  const [escolhido, setEscolhido] = useState<ItemBusca | null>(null);

  const receber = useCallback(
    (j: { token?: string; partidaId?: number; data?: string; visao: Visao }) => {
      setVisao(j.visao);
      setToken(j.token ?? null);
      if (j.token) salvar(chaveLocal, j.token);
      setPartidaId(j.partidaId ?? null);
      if (j.data) setDataCaso(j.data);
    },
    [chaveLocal],
  );

  const iniciar = useCallback(
    async (novo = false) => {
      setErro(null);
      const r =
        modo.tipo === "diario"
          ? await fetch("/api/diario", { method: "POST" })
          : await fetch("/api/jogo", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                codigo: modo.codigo,
                modo: modo.modo,
                token: novo ? undefined : lerSalvo(chaveLocal),
                novo,
              }),
            });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) return setErro(j.erro ?? "Não foi possível abrir o caso.");
      receber(j);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chaveLocal, receber],
  );

  useEffect(() => {
    iniciar();
    fetch("/api/diagnosticos")
      .then((r) => r.json())
      .then(setDiagnosticos)
      .catch(() => setErro("Não foi possível carregar a lista de diagnósticos."));
  }, [iniciar]);

  async function agir(acao: Acao) {
    if (ocupado || (!token && !partidaId)) return;
    setOcupado(true);
    setErro(null);
    try {
      const r = await fetch("/api/jogo/acao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partidaId ? { partidaId, acao } : { token, acao }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErro(j.erro ?? "Algo deu errado.");
        return;
      }
      receber(j);
    } catch {
      setErro("Sem conexão. Tente de novo.");
    } finally {
      setOcupado(false);
    }
  }

  const tentados = useMemo(
    () => new Set((visao?.palpites ?? []).flatMap((p) => (p.tipo === "pulou" ? [] : [p.id]))),
    [visao?.palpites],
  );

  if (!visao)
    return (
      <p role="status" className="py-10 text-center text-suave">
        {erro ?? "Abrindo o caso..."}
      </p>
    );

  const t = visao.tentativa;
  const emJogo = visao.fase === "diagnostico";
  const nivel = emJogo ? t : 7;
  const p = visao.paciente;
  const fim = visao.fase === "fim";
  // No fim, as pistas recolhem (o aluno pode reabrir) para o resultado ficar visível.
  const k = fim ? "fim" : "jogo";

  return (
    <div className="space-y-4">
      {/* Cabeçalho da partida */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-suave">
          {ROTULO_GRUPO[p.grupo_especie]} · {rotulo}
        </p>
        <Marcador visao={visao} />
      </div>

      {visao.status !== "revisado" && (
        <p className="flex gap-2 rounded-md border border-ambar-borda bg-ambar-claro p-3 text-sm text-grafite">
          <CircleAlert aria-hidden size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-ambar" />
          <span>
            Caso em rascunho, ainda não revisado pelo professor.
            {visao.temItensARevisar && " Valores marcados como \"a revisar\" aguardam conferência."}
          </span>
        </p>
      )}

      {/* Camadas do caso */}
      <Bloco key={k} inicialAberto={!fim} titulo="Paciente e queixa principal" acento="vinho" icone={PawPrint}>
        <p className="mb-2">
          <span className="font-medium">{p.raca}</span> · {p.idade} · {p.sexo}
          {p.peso ? ` · ${p.peso}` : ""}
        </p>
        <ul className="flex flex-wrap gap-1.5">
          {p.queixa_principal.map((q) => (
            <li key={q} className="rounded-full border border-vinho-borda bg-areia px-2.5 py-1 text-sm">
              {q}
            </li>
          ))}
        </ul>
      </Bloco>

      {visao.historico ? (
        <Bloco key={k} inicialAberto={!fim} titulo="Histórico" acento="azul" icone={History} novo={emJogo && t === 2}>
          <ListaBlocos blocos={visao.historico} />
        </Bloco>
      ) : (
        <BlocoBloqueado titulo="Histórico" quando="2ª tentativa" />
      )}

      {visao.anamnese ? (
        <Bloco key={k} inicialAberto={!fim} titulo="Anamnese" acento="violeta" icone={MessageSquareText} novo={emJogo && t === 3}>
          <ListaBlocos blocos={visao.anamnese} />
        </Bloco>
      ) : (
        <BlocoBloqueado titulo="Anamnese" quando="3ª tentativa" />
      )}

      {visao.exame_fisico ? (
        <Bloco key={k} inicialAberto={!fim} titulo="Exame físico" acento="ambar" icone={Stethoscope} novo={emJogo && t === 4}>
          <ExameFisico ef={visao.exame_fisico} mostrarRevisar={visao.status !== "revisado"} />
        </Bloco>
      ) : (
        <BlocoBloqueado titulo="Exame físico" quando="4ª tentativa" />
      )}

      {nivel >= 5 && visao.fase !== "fim" ? (
        <Bloco titulo="Exames complementares" acento="esmeralda" icone={TestTubes} novo={visao.precisaEscolherExame}>
          {visao.examesFeitos.length === 0 ? (
            <p className="text-suave">Nenhum exame pedido ainda.</p>
          ) : (
            <div className="space-y-3">
              {visao.examesFeitos.map((e) => (
                <ResultadoExame key={e.id} exame={{ ...e, comentario_didatico: undefined }} mostrarRevisar={visao.status !== "revisado"} />
              ))}
            </div>
          )}
        </Bloco>
      ) : visao.fase !== "fim" ? (
        <BlocoBloqueado titulo="Exames complementares" quando="5ª tentativa" />
      ) : null}

      {/* Palpites */}
      {visao.palpites.length > 0 && (
        <section aria-labelledby="palpites" className="space-y-2">
          <h2 id="palpites" className="text-base">Seus palpites</h2>
          <ol className="space-y-2">
            {visao.palpites.map((pp) => (
              <LinhaPalpite key={pp.tentativa} p={pp} />
            ))}
          </ol>
        </section>
      )}

      {erro && (
        <p role="alert" className="rounded-md border border-carmim-borda bg-carmim-claro p-3 text-sm text-carmim">
          {erro}
        </p>
      )}

      {/* Área de ação */}
      {emJogo && (
        <section aria-label="Sua jogada" className="space-y-3 rounded-lg border border-marfim bg-superficie p-4">
          {visao.precisaEscolherExame && visao.examesDisponiveis ? (
            <EscolhaExame
              key={t}
              opcoes={visao.examesDisponiveis}
              tentativa={t}
              ocupado={ocupado}
              onPedir={(id) => agir({ tipo: "exame", exameId: id })}
            />
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (escolhido) agir({ tipo: "palpite", diagnosticoId: escolhido.id });
              }}
              className="space-y-3"
            >
              <p className="text-sm">
                <span className="font-semibold">Tentativa {t} de {visao.maxTentativas}.</span> Qual é o diagnóstico?
              </p>
              <Autocompletar itens={diagnosticos} excluir={tentados} onEscolher={setEscolhido} desabilitado={ocupado} />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!escolhido || ocupado}
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md bg-vinho px-4 font-medium text-areia disabled:opacity-40"
                >
                  <Send aria-hidden size={18} strokeWidth={1.5} />
                  Enviar palpite
                </button>
                <button
                  type="button"
                  onClick={() => agir({ tipo: "pular" })}
                  disabled={ocupado}
                  className="inline-flex min-h-12 items-center gap-2 rounded-md border border-vinho px-4 font-medium text-vinho disabled:opacity-40"
                >
                  <SkipForward aria-hidden size={18} strokeWidth={1.5} />
                  Pular
                </button>
              </div>
              <p className="text-xs text-suave">Pular gasta a tentativa e revela a próxima parte do caso.</p>
            </form>
          )}
        </section>
      )}

      {visao.fase === "tratamento" && visao.tratamentosOpcoes && (
        <>
          <ResultadoDiagnostico visao={visao} />
          <section aria-labelledby="trat" className="space-y-3 rounded-lg border border-marfim bg-superficie p-4">
            <h2 id="trat" className="flex items-center gap-2 text-lg">
              <Pill aria-hidden size={20} strokeWidth={1.5} className="text-vinho" />
              Tratamento
            </h2>
            <EscolhaTratamento
              opcoes={visao.tratamentosOpcoes}
              valeponto={Boolean(visao.acertou)}
              ocupado={ocupado}
              onConfirmar={(ids) => agir({ tipo: "tratamento", condutas: ids })}
            />
          </section>
        </>
      )}

      {fim && (
        <Final
          visao={visao}
          dataCaso={dataCaso ?? dataBR()}
          onRecomecar={
            modo.tipo === "livre"
              ? () => {
                  salvar(chaveLocal, null);
                  setVisao(null);
                  iniciar(true);
                }
              : undefined
          }
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

function Marcador({ visao }: { visao: Visao }) {
  const cor = (i: number) => {
    const p = visao.palpites[i];
    if (!p) return i + 1 === visao.tentativa && visao.fase === "diagnostico" ? "border-vinho bg-areia" : "border-marfim bg-areia";
    if (p.tipo === "acerto") return "border-esmeralda bg-esmeralda";
    if (p.tipo === "pulou") return "border-marfim bg-superficie";
    return p.proximidade.muitoPerto ? "border-ambar bg-ambar" : "border-grafite/60 bg-grafite/60";
  };
  return (
    <div className="flex items-center gap-2">
      <ol className="flex gap-1" aria-hidden>
        {Array.from({ length: visao.maxTentativas }, (_, i) => (
          <li key={i} className={`size-3.5 rounded-full border ${cor(i)}`} />
        ))}
      </ol>
      <span className="text-sm font-medium">
        {visao.fase === "diagnostico" ? `Tentativa ${visao.tentativa}/${visao.maxTentativas}` : visao.acertou ? "Acertou" : "Fim das tentativas"}
      </span>
    </div>
  );
}

function LinhaPalpite({ p }: { p: PalpiteVisto }) {
  if (p.tipo === "pulou")
    return (
      <li className="flex items-center gap-2 rounded-md border border-marfim px-3 py-2 text-sm text-suave">
        <span className="w-6 font-medium">{p.tentativa}.</span> Pulou
      </li>
    );
  if (p.tipo === "acerto")
    return (
      <li className="flex items-center gap-2 rounded-md border border-esmeralda bg-esmeralda px-3 py-2 text-sm font-medium text-areia">
        <span className="w-6">{p.tentativa}.</span> {p.nome}
      </li>
    );
  return (
    <li className="space-y-2 rounded-md border border-marfim bg-areia px-3 py-2 text-sm">
      <p>
        <span className="inline-block w-6 font-medium">{p.tentativa}.</span>
        {p.nome}
      </p>
      <Etiquetas p={p.proximidade} />
    </li>
  );
}

function ExameFisico({ ef, mostrarRevisar }: { ef: NonNullable<Visao["exame_fisico"]>; mostrarRevisar: boolean }) {
  return (
    <div className="space-y-3">
      <dl className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
        {ef.parametros.map((x) => (
          <div key={x.nome} className="flex justify-between gap-2 border-b border-ambar-borda py-1">
            <dt className="text-suave">{x.nome}</dt>
            <dd className={`text-right ${x.alterado ? "font-semibold" : ""}`}>
              {x.valor}
              {x.unidade ? ` ${x.unidade}` : ""}
              {x.alterado === "alto" && " ↑"}
              {x.alterado === "baixo" && " ↓"}
              {x.referencia && <span className="block text-xs font-normal text-suave">ref. {x.referencia}{mostrarRevisar && x.a_revisar ? " · a revisar" : ""}</span>}
            </dd>
          </div>
        ))}
      </dl>
      <ListaBlocos blocos={ef.achados} />
    </div>
  );
}

function ResultadoDiagnostico({ visao }: { visao: Visao }) {
  return visao.acertou ? (
    <div className="rounded-lg border border-esmeralda bg-esmeralda p-4 text-areia" role="status">
      <p className="text-sm">Acertou na {visao.palpites.length}ª tentativa</p>
      <p className="font-titulo text-2xl font-semibold">{visao.diagnostico?.nome}</p>
    </div>
  ) : (
    <div className="rounded-lg border border-vinho bg-vinho p-4 text-areia" role="status">
      <p className="text-sm">Não foi desta vez. O diagnóstico era</p>
      <p className="font-titulo text-2xl font-semibold">{visao.diagnostico?.nome}</p>
    </div>
  );
}

function Final({ visao, dataCaso, onRecomecar }: { visao: Visao; dataCaso: string; onRecomecar?: () => void }) {
  const [copiado, setCopiado] = useState(false);
  const pt = visao.pontuacao!;
  const ex = visao.explicacao!;

  async function copiar() {
    const texto = textoCompartilhar(visao, dataCaso, typeof window !== "undefined" ? window.location.origin : undefined);
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = texto;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  }

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => ref.current?.scrollIntoView({ block: "start" }), []);

  return (
    <div ref={ref} className="scroll-mt-4 space-y-4">
      <ResultadoDiagnostico visao={visao} />

      <section aria-labelledby="pontos" className="rounded-lg border border-marfim p-4">
        <h2 id="pontos" className="text-lg">Pontuação</h2>
        <table className="mt-2 w-full text-sm">
          <tbody>
            {pt.linhas.map((l, i) => (
              <tr key={i} className="border-b border-marfim/60 align-top">
                <th scope="row" className="py-1.5 pr-2 text-left font-normal">
                  {l.rotulo}
                  {l.detalhe && <span className="block text-xs text-suave">{l.detalhe}</span>}
                </th>
                <td className="py-1.5 text-right tabular-nums whitespace-nowrap">{l.pontos > 0 ? `+${l.pontos}` : l.pontos}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" className="pt-2 text-left font-titulo text-base">Total</th>
              <td className="pt-2 text-right font-titulo text-xl font-semibold text-vinho tabular-nums">{pt.total}</td>
            </tr>
          </tfoot>
        </table>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={copiar} className="inline-flex min-h-12 items-center gap-2 rounded-md bg-vinho px-4 font-medium text-areia">
            <Copy aria-hidden size={18} strokeWidth={1.5} />
            {copiado ? "Copiado" : "Copiar resultado"}
          </button>
          {onRecomecar ? (
            <button onClick={onRecomecar} className="inline-flex min-h-12 items-center gap-2 rounded-md border border-vinho px-4 font-medium text-vinho">
              <RotateCcw aria-hidden size={18} strokeWidth={1.5} />
              Jogar de novo
            </button>
          ) : (
            <a href="/eu" className="inline-flex min-h-12 items-center gap-2 rounded-md border border-vinho px-4 font-medium text-vinho">
              <ChartColumn aria-hidden size={18} strokeWidth={1.5} />
              Minhas estatísticas
            </a>
          )}
        </div>
        <p aria-live="polite" className="sr-only">{copiado ? "Resultado copiado" : ""}</p>
      </section>

      <Bloco titulo="Resumo do caso" acento="vinho" icone={BookOpen}>
        <p>{ex.resumo}</p>
      </Bloco>

      <Bloco titulo="Fisiopatologia" acento="violeta" icone={Activity}>
        <ul className="list-disc space-y-1 pl-5">
          {ex.fisiopatologia.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </Bloco>

      <Bloco titulo="Por que cada pista importava" acento="azul" icone={ListChecks}>
        <dl className="space-y-2">
          {ex.pistas.map((x) => (
            <div key={x.achado}>
              <dt className="font-medium">{x.achado}</dt>
              <dd className="text-suave">{x.por_que_importa}</dd>
            </div>
          ))}
        </dl>
      </Bloco>

      <Bloco titulo="Diagnósticos diferenciais" acento="ambar" icone={ClipboardList}>
        <dl className="space-y-2">
          {visao.diferenciais!.map((d) => (
            <div key={d.nome}>
              <dt className="font-medium">{d.nome}</dt>
              <dd className="text-suave">{d.como_descartar}</dd>
            </div>
          ))}
        </dl>
      </Bloco>

      <Bloco titulo="Exames complementares" acento="esmeralda" icone={TestTubes}>
        <p className="mb-3">{ex.comentario_exames}</p>
        <div className="space-y-3">
          {visao.examesTodos!.map((e) => (
            <div key={e.id}>
              <p className="mb-1 text-xs text-suave">{e.pedido ? "Você pediu este exame" : "Não pedido"}</p>
              <ResultadoExame exame={e} mostrarRevisar={visao.status !== "revisado"} />
            </div>
          ))}
        </div>
      </Bloco>

      <Bloco titulo="Tratamento" acento="carmim" icone={Pill}>
        <p className="mb-3">{ex.comentario_tratamento}</p>
        <TratamentoCorrigido itens={visao.tratamentoCorrigido!} />
      </Bloco>

      <Bloco titulo="Referências" acento="vinho" icone={Info} inicialAberto={false}>
        <ul className="space-y-2">
          {visao.referencias!.map((r) => (
            <li key={r.id}>{r.citacao}</li>
          ))}
        </ul>
      </Bloco>
    </div>
  );
}
