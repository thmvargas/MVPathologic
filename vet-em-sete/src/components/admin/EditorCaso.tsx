"use client";

/**
 * Editor de casos do painel de administração. Trabalha sobre o objeto do caso
 * (mesmo formato do JSON em src/dados/casos) e mostra as pendências ao vivo.
 */
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Eye, Plus, Trash2 } from "lucide-react";
import {
  CasoSchema, ESPECIES, GRUPOS_ESPECIE, ROTULO_GRUPO, ROTULO_SISTEMA, SISTEMAS, TIPOS_EXAME,
  pendenciasDoCaso, type Diagnostico, type Pendencia,
} from "@/lib/caso/esquema";
import { salvarCaso, excluirCaso, type Resposta } from "@/app/admin/acoes";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Obj = Record<string, any>;

// ---------------------------------------------------------------------------
// Campos básicos
// ---------------------------------------------------------------------------

const cls = "min-h-11 w-full rounded-md border border-texto/40 bg-fundo px-2 text-sm focus:border-marca focus:outline-none";

function Rotulo({ t, children, dica }: { t: string; children: React.ReactNode; dica?: string }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium">{t}</span>
      {children}
      {dica && <span className="block text-xs text-suave">{dica}</span>}
    </label>
  );
}

function Texto({ v, set, ...p }: { v: any; set: (x: string) => void } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} value={v ?? ""} onChange={(e) => set(e.target.value)} className={cls} />;
}

function Area({ v, set, linhas = 3 }: { v: any; set: (x: string) => void; linhas?: number }) {
  return <textarea value={v ?? ""} onChange={(e) => set(e.target.value)} rows={linhas} className={`${cls} py-2`} />;
}

/** Lista de textos editada como "um item por linha". */
function Linhas({ v, set, linhas = 4 }: { v: string[] | undefined; set: (x: string[]) => void; linhas?: number }) {
  const [texto, setTexto] = useState((v ?? []).join("\n"));
  return (
    <textarea
      value={texto}
      rows={linhas}
      onChange={(e) => {
        setTexto(e.target.value);
        set(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean));
      }}
      className={`${cls} py-2`}
    />
  );
}

function Escolha({ v, set, opcoes, vazio }: { v: any; set: (x: string) => void; opcoes: [string, string][]; vazio?: string }) {
  return (
    <select value={v ?? ""} onChange={(e) => set(e.target.value)} className={cls}>
      {vazio !== undefined && <option value="">{vazio}</option>}
      {opcoes.map(([val, rot]) => (
        <option key={val} value={val}>{rot}</option>
      ))}
    </select>
  );
}

function Marca({ v, set, t }: { v: any; set: (x: boolean) => void; t: string }) {
  return (
    <label className="inline-flex min-h-11 items-center gap-2 text-sm">
      <input type="checkbox" checked={Boolean(v)} onChange={(e) => set(e.target.checked)} className="size-4 accent-[#0018ff]" />
      {t}
    </label>
  );
}

/** Lista de itens com adicionar, remover e reordenar. */
function Lista<T = Obj>({
  itens,
  set,
  novo,
  render,
  rotuloNovo,
}: {
  itens: T[] | undefined;
  set: (x: T[]) => void;
  novo: () => Obj;
  render: (item: T, mudar: (x: T) => void, i: number) => React.ReactNode;
  rotuloNovo: string;
}) {
  const lista = itens ?? [];
  const mover = (i: number, d: number) => {
    const n = [...lista];
    const [x] = n.splice(i, 1);
    n.splice(i + d, 0, x);
    set(n);
  };
  const btn = "inline-flex min-h-9 min-w-9 items-center justify-center rounded border border-linha disabled:opacity-30";
  return (
    <div className="space-y-2">
      {lista.map((item, i) => (
        <div key={i} className="rounded-md border border-linha bg-fundo p-2">
          <div className="mb-2 flex justify-end gap-1">
            <button type="button" aria-label="Subir" disabled={i === 0} onClick={() => mover(i, -1)} className={btn}>
              <ArrowUp aria-hidden size={14} />
            </button>
            <button type="button" aria-label="Descer" disabled={i === lista.length - 1} onClick={() => mover(i, 1)} className={btn}>
              <ArrowDown aria-hidden size={14} />
            </button>
            <button type="button" aria-label="Remover" onClick={() => set(lista.filter((_, j) => j !== i))} className={`${btn} text-destaque-escuro`}>
              <Trash2 aria-hidden size={14} />
            </button>
          </div>
          {render(item, (x) => set(lista.map((y, j) => (j === i ? x : y))), i)}
        </div>
      ))}
      <button type="button" onClick={() => set([...lista, novo() as T])} className="inline-flex min-h-10 items-center gap-1 text-sm text-marca">
        <Plus aria-hidden size={16} /> {rotuloNovo}
      </button>
    </div>
  );
}

function Blocos({ v, set }: { v: Obj[] | undefined; set: (x: Obj[]) => void }) {
  return (
    <Lista
      itens={v}
      set={set}
      novo={() => ({ titulo: "", itens: [] })}
      rotuloNovo="Adicionar bloco"
      render={(b, m) => (
        <div className="space-y-2">
          <Rotulo t="Título do bloco">
            <Texto v={b.titulo} set={(x) => m({ ...b, titulo: x })} />
          </Rotulo>
          <Rotulo t="Itens (um por linha, palavras-chave)">
            <Linhas v={b.itens} set={(x) => m({ ...b, itens: x })} />
          </Rotulo>
        </div>
      )}
    />
  );
}

function Secao({ t, children, aberta = false }: { t: string; children: React.ReactNode; aberta?: boolean }) {
  return (
    <details open={aberta} className="rounded-lg border border-linha">
      <summary className="cursor-pointer px-4 py-3 font-titulo text-lg font-semibold">{t}</summary>
      <div className="space-y-3 border-t border-linha px-4 py-3">{children}</div>
    </details>
  );
}

// ---------------------------------------------------------------------------
// Editor
// ---------------------------------------------------------------------------

export function casoVazio(): Obj {
  return {
    id: "",
    status: "rascunho",
    versao: 1,
    especie: "canina",
    grupo_especie: "caes",
    raca: "",
    idade: "",
    sexo: "",
    queixa_principal: [],
    semestre: 5,
    uso: "diario",
    sistema: "digestorio",
    dificuldade: 1,
    historico: [{ titulo: "Ambiente", itens: [] }],
    anamnese: [{ titulo: "Evolução", itens: [] }],
    exame_fisico: { parametros: [], achados: [] },
    exames: [],
    diagnostico_id: "",
    diferenciais: [],
    tratamentos: [],
    explicacao: { resumo: "", fisiopatologia: [], pistas: [], comentario_exames: "", comentario_tratamento: "" },
    referencias: [],
    revisao: { autor: "" },
  };
}

export default function EditorCaso({
  inicial,
  novo,
  diagnosticos,
  linkPrevia,
}: {
  inicial: Obj;
  novo: boolean;
  diagnosticos: Diagnostico[];
  linkPrevia?: string;
}) {
  const [c, setC] = useState<Obj>(inicial);
  const [resposta, setResposta] = useState<Resposta | null>(null);
  const [aba, setAba] = useState<"form" | "json">("form");
  const [jsonTexto, setJsonTexto] = useState("");
  const [jsonErro, setJsonErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();
  const router = useRouter();

  const set = (k: string) => (v: any) => setC((o) => ({ ...o, [k]: v }));
  const setIn = (k: string, k2: string) => (v: any) => setC((o) => ({ ...o, [k]: { ...(o[k] ?? {}), [k2]: v } }));

  const mapa = useMemo(() => new Map(diagnosticos.map((d) => [d.id, d])), [diagnosticos]);
  const opcoesDx: [string, string][] = useMemo(
    () => diagnosticos.map((d) => [d.id, d.nome] as [string, string]).sort((a, b) => a[1].localeCompare(b[1], "pt-BR")),
    [diagnosticos],
  );
  const refs: [string, string][] = (c.referencias ?? []).map((r: Obj) => [r.id, r.id] as [string, string]);

  const validacao = useMemo(() => {
    const r = CasoSchema.safeParse(c);
    if (!r.success) return { completo: false, lista: r.error.issues.slice(0, 15).map((i) => ({ campo: i.path.join("."), problema: i.message })) as Pendencia[] };
    return { completo: true, lista: pendenciasDoCaso(r.data, mapa) };
  }, [c, mapa]);

  function enviar(acao: "salvar" | "aprovar" | "rascunho" | "arquivar") {
    iniciar(async () => {
      const r = await salvarCaso(JSON.stringify(c), acao, novo);
      setResposta(r);
      if (r.ok && novo && r.id) router.push(`/admin/casos/${r.id}`);
      else if (r.ok) router.refresh();
    });
  }

  const statusRotulo = { rascunho: "Rascunho", em_revisao: "Em revisão", revisado: "Aprovado", arquivado: "Arquivado" }[c.status as string] ?? c.status;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="flex-1 text-2xl text-marca">
          {novo ? "Novo caso" : mapa.get(c.diagnostico_id)?.nome ?? c.id}
        </h1>
        <span className="rounded-full border border-linha px-2 py-0.5 text-xs">{statusRotulo} · v{c.versao}</span>
      </div>

      {/* Pendências */}
      <div className={`rounded-lg border p-3 text-sm ${validacao.lista.length ? "border-alerta-borda bg-alerta-claro" : "border-sucesso-borda bg-sucesso-claro"}`}>
        {validacao.lista.length === 0 ? (
          <p>Sem pendências: o caso pode ser aprovado.</p>
        ) : (
          <>
            <p className="font-medium">
              {validacao.completo ? "Pendências antes da aprovação" : "Campos obrigatórios faltando"} ({validacao.lista.length})
            </p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs">
              {validacao.lista.map((p, i) => (
                <li key={i}>
                  <code>{p.campo}</code>: {p.problema}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="flex gap-2" role="tablist">
        {(["form", "json"] as const).map((a) => (
          <button
            key={a}
            role="tab"
            aria-selected={aba === a}
            onClick={() => {
              if (a === "json") setJsonTexto(JSON.stringify(c, null, 2));
              setAba(a);
            }}
            className={`min-h-10 rounded-full border px-3 text-sm ${aba === a ? "border-marca bg-marca text-fundo" : "border-linha"}`}
          >
            {a === "form" ? "Formulário" : "JSON (avançado)"}
          </button>
        ))}
      </div>

      {aba === "json" ? (
        <div className="space-y-2">
          <p className="text-xs text-suave">Cole ou edite o caso inteiro em JSON. Clique em &quot;Aplicar&quot; para voltar ao formulário.</p>
          <textarea value={jsonTexto} onChange={(e) => setJsonTexto(e.target.value)} rows={24} className={`${cls} py-2 font-mono text-xs`} spellCheck={false} />
          {jsonErro && <p role="alert" className="text-sm text-destaque-escuro">{jsonErro}</p>}
          <button
            type="button"
            onClick={() => {
              try {
                const o = JSON.parse(jsonTexto);
                if (!novo && o.id !== c.id) throw new Error("O identificador (id) não pode mudar.");
                setC(o);
                setJsonErro(null);
                setAba("form");
              } catch (e) {
                setJsonErro(e instanceof Error ? e.message : "JSON inválido.");
              }
            }}
            className="min-h-11 rounded-md border border-marca px-3 text-sm text-marca"
          >
            Aplicar
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <Secao t="Paciente e classificação" aberta>
            <div className="grid gap-3 sm:grid-cols-2">
              <Rotulo t="Identificador" dica="Só minúsculas, números e hífen. Não muda depois de criado.">
                <Texto v={c.id} set={set("id")} disabled={!novo} placeholder="gato-lipidose-001" />
              </Rotulo>
              <Rotulo t="Uso">
                <Escolha v={c.uso} set={set("uso")} opcoes={[["diario", "Caso do dia (entra no treino depois de usado)"], ["treino", "Só treino e modo por semestre"]]} />
              </Rotulo>
              <Rotulo t="Grupo de espécie">
                <Escolha v={c.grupo_especie} set={set("grupo_especie")} opcoes={GRUPOS_ESPECIE.map((g) => [g, ROTULO_GRUPO[g]])} />
              </Rotulo>
              <Rotulo t="Espécie">
                <Escolha v={c.especie} set={set("especie")} opcoes={ESPECIES.map((e) => [e, e])} />
              </Rotulo>
              <Rotulo t="Raça"><Texto v={c.raca} set={set("raca")} /></Rotulo>
              <Rotulo t="Idade"><Texto v={c.idade} set={set("idade")} placeholder="4 anos" /></Rotulo>
              <Rotulo t="Sexo"><Texto v={c.sexo} set={set("sexo")} placeholder="fêmea castrada" /></Rotulo>
              <Rotulo t="Peso (opcional)"><Texto v={c.peso} set={(x) => set("peso")(x || undefined)} /></Rotulo>
              <Rotulo t="Semestre">
                <Escolha v={String(c.semestre)} set={(x) => set("semestre")(Number(x))} opcoes={[1, 2, 3, 4, 5, 6].map((n) => [String(n), `${n}º`])} />
              </Rotulo>
              <Rotulo t="Dificuldade">
                <Escolha v={String(c.dificuldade)} set={(x) => set("dificuldade")(Number(x))} opcoes={[["1", "Básico"], ["2", "Intermediário"], ["3", "Avançado"]]} />
              </Rotulo>
              <Rotulo t="Sistema principal">
                <Escolha v={c.sistema} set={set("sistema")} opcoes={SISTEMAS.map((s) => [s, ROTULO_SISTEMA[s]])} />
              </Rotulo>
            </div>
            <Rotulo t="Queixa principal (um item por linha)">
              <Linhas v={c.queixa_principal} set={set("queixa_principal")} linhas={2} />
            </Rotulo>
          </Secao>

          <Secao t="Histórico (2ª tentativa)"><Blocos v={c.historico} set={set("historico")} /></Secao>
          <Secao t="Anamnese (3ª tentativa)"><Blocos v={c.anamnese} set={set("anamnese")} /></Secao>

          <Secao t="Exame físico (4ª tentativa)">
            <p className="text-xs font-medium">Parâmetros</p>
            <Lista
              itens={c.exame_fisico?.parametros}
              set={setIn("exame_fisico", "parametros")}
              novo={() => ({ nome: "", valor: "" })}
              rotuloNovo="Adicionar parâmetro"
              render={(x, m) => (
                <div className="grid gap-2 sm:grid-cols-3">
                  <Rotulo t="Nome"><Texto v={x.nome} set={(v) => m({ ...x, nome: v })} /></Rotulo>
                  <Rotulo t="Valor"><Texto v={x.valor} set={(v) => m({ ...x, valor: v })} /></Rotulo>
                  <Rotulo t="Unidade"><Texto v={x.unidade} set={(v) => m({ ...x, unidade: v || undefined })} /></Rotulo>
                  <Rotulo t="Referência"><Texto v={x.referencia} set={(v) => m({ ...x, referencia: v || undefined })} /></Rotulo>
                  <Rotulo t="Fonte"><Escolha v={x.fonte} set={(v) => m({ ...x, fonte: v || undefined })} opcoes={refs} vazio="—" /></Rotulo>
                  <Rotulo t="Alterado">
                    <Escolha v={x.alterado} set={(v) => m({ ...x, alterado: v || undefined })} opcoes={[["alto", "Alto ↑"], ["baixo", "Baixo ↓"], ["anormal", "Anormal"]]} vazio="Normal" />
                  </Rotulo>
                  <Marca v={x.a_revisar} set={(v) => m({ ...x, a_revisar: v || undefined })} t="A revisar" />
                </div>
              )}
            />
            <p className="pt-2 text-xs font-medium">Achados por sistema</p>
            <Blocos v={c.exame_fisico?.achados} set={setIn("exame_fisico", "achados")} />
          </Secao>

          <Secao t="Exames complementares (5ª a 7ª tentativa)">
            <p className="text-xs text-suave">Misture exames relevantes, pouco úteis e desnecessários (pelo menos 2, 1 e 1).</p>
            <Lista
              itens={c.exames}
              set={set("exames")}
              novo={() => ({ id: `exame${(c.exames?.length ?? 0) + 1}`, tipo: "hemograma", nome: "", classificacao: "relevante", resultado: {}, comentario_didatico: "" })}
              rotuloNovo="Adicionar exame"
              render={(e, m) => (
                <div className="space-y-2">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Rotulo t="Nome mostrado ao aluno"><Texto v={e.nome} set={(v) => m({ ...e, nome: v })} /></Rotulo>
                    <Rotulo t="Código interno"><Texto v={e.id} set={(v) => m({ ...e, id: v })} /></Rotulo>
                    <Rotulo t="Tipo"><Escolha v={e.tipo} set={(v) => m({ ...e, tipo: v })} opcoes={TIPOS_EXAME.map((t) => [t, t])} /></Rotulo>
                    <Rotulo t="Classificação">
                      <Escolha v={e.classificacao} set={(v) => m({ ...e, classificacao: v })} opcoes={[["relevante", "Relevante"], ["pouco_util", "Pouco útil"], ["desnecessario", "Desnecessário"]]} />
                    </Rotulo>
                  </div>
                  <p className="text-xs font-medium">Tabela de resultados (opcional)</p>
                  <Lista
                    itens={e.resultado?.tabela}
                    set={(t) => m({ ...e, resultado: { ...e.resultado, tabela: t.length ? t : undefined } })}
                    novo={() => ({ analito: "", valor: "", unidade: "", referencia: "", fonte: refs[0]?.[0] ?? "", a_revisar: true })}
                    rotuloNovo="Adicionar linha"
                    render={(l, ml) => (
                      <div className="grid gap-2 sm:grid-cols-3">
                        <Rotulo t="Analito"><Texto v={l.analito} set={(v) => ml({ ...l, analito: v })} /></Rotulo>
                        <Rotulo t="Valor"><Texto v={l.valor} set={(v) => ml({ ...l, valor: v })} /></Rotulo>
                        <Rotulo t="Unidade"><Texto v={l.unidade} set={(v) => ml({ ...l, unidade: v })} /></Rotulo>
                        <Rotulo t="Referência"><Texto v={l.referencia} set={(v) => ml({ ...l, referencia: v })} /></Rotulo>
                        <Rotulo t="Fonte"><Escolha v={l.fonte} set={(v) => ml({ ...l, fonte: v })} opcoes={refs} vazio="—" /></Rotulo>
                        <Rotulo t="Alterado"><Escolha v={l.alterado} set={(v) => ml({ ...l, alterado: v || undefined })} opcoes={[["alto", "Alto ↑"], ["baixo", "Baixo ↓"]]} vazio="Normal" /></Rotulo>
                        <Marca v={l.a_revisar} set={(v) => ml({ ...l, a_revisar: v || undefined })} t="A revisar" />
                      </div>
                    )}
                  />
                  <Rotulo t="Laudo descritivo (um item por linha)">
                    <Linhas v={e.resultado?.descricao} set={(v) => m({ ...e, resultado: { ...e.resultado, descricao: v.length ? v : undefined } })} />
                  </Rotulo>
                  <Rotulo t="Conclusão"><Texto v={e.resultado?.conclusao} set={(v) => m({ ...e, resultado: { ...e.resultado, conclusao: v || undefined } })} /></Rotulo>
                  <Rotulo t="Comentário didático (aparece no fim)"><Area v={e.comentario_didatico} set={(v) => m({ ...e, comentario_didatico: v })} /></Rotulo>
                </div>
              )}
            />
          </Secao>

          <Secao t="Gabarito e diferenciais">
            <Rotulo t="Diagnóstico correto" dica="Falta algum? Cadastre em Administração → Diagnósticos.">
              <Escolha v={c.diagnostico_id} set={set("diagnostico_id")} opcoes={opcoesDx} vazio="Escolha" />
            </Rotulo>
            <p className="text-xs font-medium">Diferenciais (geram o aviso &quot;muito perto&quot;)</p>
            <Lista
              itens={c.diferenciais}
              set={set("diferenciais")}
              novo={() => ({ diagnostico_id: "", como_descartar: "" })}
              rotuloNovo="Adicionar diferencial"
              render={(d, m) => (
                <div className="space-y-2">
                  <Escolha v={d.diagnostico_id} set={(v) => m({ ...d, diagnostico_id: v })} opcoes={opcoesDx} vazio="Escolha" />
                  <Rotulo t="Como descartar"><Area v={d.como_descartar} set={(v) => m({ ...d, como_descartar: v })} linhas={2} /></Rotulo>
                </div>
              )}
            />
          </Secao>

          <Secao t="Tratamento">
            <Lista
              itens={c.tratamentos}
              set={set("tratamentos")}
              novo={() => ({ id: `conduta${(c.tratamentos?.length ?? 0) + 1}`, texto: "", tipo: "farmaco", classificacao: "adequado", justificativa: "" })}
              rotuloNovo="Adicionar conduta"
              render={(t, m) => (
                <div className="space-y-2">
                  <Rotulo t="Conduta (como o aluno vê)"><Texto v={t.texto} set={(v) => m({ ...t, texto: v })} /></Rotulo>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Rotulo t="Código interno"><Texto v={t.id} set={(v) => m({ ...t, id: v })} /></Rotulo>
                    <Rotulo t="Tipo">
                      <Escolha v={t.tipo} set={(v) => m({ ...t, tipo: v })} opcoes={[["farmaco", "Fármaco"], ["suporte", "Suporte"], ["manejo", "Manejo"], ["cirurgia", "Cirurgia"], ["eutanasia", "Eutanásia"], ["sanitaria", "Sanitária"], ["exame", "Exame/monitoramento"]]} />
                    </Rotulo>
                    <Rotulo t="Classificação">
                      <Escolha v={t.classificacao} set={(v) => m({ ...t, classificacao: v })} opcoes={[["adequado", "Adequado"], ["aceitavel", "Aceitável"], ["desnecessario", "Desnecessário"], ["contraindicado", "Contraindicado"]]} />
                    </Rotulo>
                  </div>
                  <Rotulo t="Justificativa"><Area v={t.justificativa} set={(v) => m({ ...t, justificativa: v })} linhas={2} /></Rotulo>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Rotulo t="Dose (opcional)"><Texto v={t.dose?.texto} set={(v) => m({ ...t, dose: v ? { ...(t.dose ?? { fonte: refs[0]?.[0] ?? "" }), texto: v } : undefined })} /></Rotulo>
                    {t.dose && (
                      <>
                        <Rotulo t="Fonte da dose"><Escolha v={t.dose.fonte} set={(v) => m({ ...t, dose: { ...t.dose, fonte: v } })} opcoes={refs} vazio="—" /></Rotulo>
                        <Marca v={t.dose.a_revisar} set={(v) => m({ ...t, dose: { ...t.dose, a_revisar: v || undefined } })} t="Dose a revisar" />
                      </>
                    )}
                  </div>
                </div>
              )}
            />
          </Secao>

          <Secao t="Explicação didática">
            <Rotulo t="Resumo"><Area v={c.explicacao?.resumo} set={setIn("explicacao", "resumo")} /></Rotulo>
            <Rotulo t="Fisiopatologia (um ponto por linha)"><Linhas v={c.explicacao?.fisiopatologia} set={setIn("explicacao", "fisiopatologia")} linhas={5} /></Rotulo>
            <p className="text-xs font-medium">Por que cada pista importava</p>
            <Lista
              itens={c.explicacao?.pistas}
              set={setIn("explicacao", "pistas")}
              novo={() => ({ achado: "", por_que_importa: "" })}
              rotuloNovo="Adicionar pista"
              render={(p, m) => (
                <div className="grid gap-2 sm:grid-cols-2">
                  <Rotulo t="Achado"><Texto v={p.achado} set={(v) => m({ ...p, achado: v })} /></Rotulo>
                  <Rotulo t="Por que importa"><Texto v={p.por_que_importa} set={(v) => m({ ...p, por_que_importa: v })} /></Rotulo>
                </div>
              )}
            />
            <Rotulo t="Comentário sobre os exames"><Area v={c.explicacao?.comentario_exames} set={setIn("explicacao", "comentario_exames")} /></Rotulo>
            <Rotulo t="Comentário sobre o tratamento"><Area v={c.explicacao?.comentario_tratamento} set={setIn("explicacao", "comentario_tratamento")} /></Rotulo>
          </Secao>

          <Secao t="Referências">
            <Lista
              itens={c.referencias}
              set={set("referencias")}
              novo={() => ({ id: `ref${(c.referencias?.length ?? 0) + 1}`, citacao: "" })}
              rotuloNovo="Adicionar referência"
              render={(r, m) => (
                <div className="grid gap-2 sm:grid-cols-4">
                  <Rotulo t="Código"><Texto v={r.id} set={(v) => m({ ...r, id: v })} /></Rotulo>
                  <div className="sm:col-span-3">
                    <Rotulo t="Citação (ABNT)"><Area v={r.citacao} set={(v) => m({ ...r, citacao: v })} linhas={2} /></Rotulo>
                  </div>
                </div>
              )}
            />
          </Secao>

          <Secao t="Revisão">
            <Rotulo t="Autor"><Texto v={c.revisao?.autor} set={setIn("revisao", "autor")} /></Rotulo>
            <Rotulo t="Observações para a revisão"><Area v={c.revisao?.observacoes} set={(v) => setIn("revisao", "observacoes")(v || undefined)} /></Rotulo>
            {c.revisao?.revisor && (
              <p className="text-sm text-suave">Aprovado por {c.revisao.revisor} em {c.revisao.revisado_em}.</p>
            )}
          </Secao>
        </div>
      )}

      {/* Barra de ações */}
      <div className="sticky bottom-0 -mx-4 space-y-2 border-t border-linha bg-fundo px-4 py-3">
        {resposta && (
          <div role={resposta.ok ? "status" : "alert"} className={`text-sm ${resposta.ok ? "text-sucesso-escuro" : "text-destaque-escuro"}`}>
            {resposta.mensagem}
            {!resposta.ok && resposta.pendencias && resposta.pendencias.length > 0 && (
              <ul className="mt-1 list-disc pl-5 text-xs">
                {resposta.pendencias.slice(0, 8).map((p, i) => <li key={i}>{p.problema}</li>)}
              </ul>
            )}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={pendente} onClick={() => enviar("salvar")} className="min-h-11 rounded-md bg-marca px-4 text-sm font-medium text-fundo disabled:opacity-40">
            {pendente ? "Salvando..." : "Salvar"}
          </button>
          {!novo && c.status !== "revisado" && (
            <button
              type="button"
              disabled={pendente || validacao.lista.length > 0}
              onClick={() => enviar("aprovar")}
              title={validacao.lista.length ? "Resolva as pendências para aprovar" : undefined}
              className="min-h-11 rounded-md bg-sucesso px-4 text-sm font-medium text-texto disabled:opacity-40"
            >
              Aprovar
            </button>
          )}
          {!novo && c.status === "revisado" && (
            <button type="button" disabled={pendente} onClick={() => enviar("rascunho")} className="min-h-11 rounded-md border border-marca px-4 text-sm text-marca">
              Voltar para rascunho
            </button>
          )}
          {!novo && c.status !== "arquivado" && (
            <button type="button" disabled={pendente} onClick={() => window.confirm("Arquivar este caso? Ele sai do jogo.") && enviar("arquivar")} className="min-h-11 rounded-md border border-linha px-4 text-sm">
              Arquivar
            </button>
          )}
          {linkPrevia && (
            <a href={linkPrevia} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-marca px-4 text-sm text-marca">
              <Eye aria-hidden size={16} strokeWidth={1.5} /> Jogar como aluno
            </a>
          )}
          {!novo && c.status === "rascunho" && (
            <button
              type="button"
              disabled={pendente}
              onClick={() =>
                window.confirm("Excluir este rascunho de vez?") &&
                iniciar(async () => {
                  const r = await excluirCaso(c.id);
                  setResposta(r);
                  if (r.ok) router.push("/admin/casos");
                })
              }
              className="min-h-11 rounded-md border border-destaque px-4 text-sm text-destaque-escuro"
            >
              Excluir
            </button>
          )}
        </div>
        {linkPrevia && <p className="text-xs text-suave">&quot;Jogar como aluno&quot; usa a última versão salva.</p>}
      </div>
    </div>
  );
}

