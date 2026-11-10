import { redirect } from "next/navigation";
import { Download } from "lucide-react";
import { obterSessao } from "@/lib/sessao";
import { carregarPainel } from "@/lib/dadosPainel";
import { filtrosParaQuery, lerFiltrosPainel } from "@/lib/filtrosPainel";
import { condutasMarcadas, examesPedidos, porAluno, porCaso, porSistema, porTurma, resumoGeral } from "@/lib/painel";
import { ROTULO_SISTEMA, type Sistema } from "@/lib/caso/esquema";
import { formatarDataBR } from "@/lib/util/tempo";

export const metadata = { title: "Painel do professor · Vet em Sete" };

const pct = (x: number) => `${Math.round(x * 100)}%`;
const num = (x: number | null) => (x === null ? "–" : x.toLocaleString("pt-BR"));
const CLASSE: Record<string, string> = {
  relevante: "Relevante",
  pouco_util: "Pouco útil",
  desnecessario: "Desnecessário",
  adequado: "Adequado",
  aceitavel: "Aceitável",
  contraindicado: "Contraindicado",
};

function Secao({ id, titulo, csv, children }: { id: string; titulo: string; csv?: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id={id} className="text-lg">{titulo}</h2>
        {csv && (
          <a href={csv} className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-vinho px-3 text-sm text-vinho">
            <Download aria-hidden size={16} strokeWidth={1.5} />
            CSV
          </a>
        )}
      </div>
      <div className="-mx-4 overflow-x-auto px-4" tabIndex={0} role="region" aria-labelledby={id}>{children}</div>
    </section>
  );
}

function Tabela({ cab, linhas, destaque }: { cab: string[]; linhas: (string | number)[][]; destaque?: (i: number) => boolean }) {
  if (!linhas.length) return <p className="text-sm text-suave">Sem dados no período.</p>;
  return (
    <table className="w-full min-w-[32rem] text-sm">
      <thead>
        <tr className="border-b border-marfim text-left text-xs text-suave">
          {cab.map((c, i) => (
            <th key={c} scope="col" className={`py-2 pr-3 font-medium ${i > 0 ? "text-right" : ""}`}>{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {linhas.map((l, i) => (
          <tr key={i} className={`border-b border-marfim/60 align-top ${destaque?.(i) ? "bg-carmim-claro" : ""}`}>
            {l.map((v, j) => (
              <td key={j} className={`py-2 pr-3 ${j > 0 ? "text-right tabular-nums" : ""}`}>{v}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default async function Professor({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sessao = await obterSessao();
  if (sessao.estado === "sem_cadastro") redirect("/cadastro");
  if (sessao.estado !== "ok") redirect("/entrar?volta=/professor");
  if (sessao.perfil.papel !== "professor") redirect("/");

  const f = lerFiltrosPainel(await searchParams);
  const { perfis, partidas, casos, turmas } = await carregarPainel(sessao.perfil.instituicao, f);
  const q = filtrosParaQuery(f);
  const csv = (tipo: string) => `/professor/csv?tipo=${tipo}&${q}`;
  const r = resumoGeral(partidas);
  const campo = "min-h-11 w-full rounded-md border border-grafite/40 bg-areia px-2 text-sm";
  const exames = examesPedidos(partidas, casos);
  const condutas = condutasMarcadas(partidas, casos);

  return (
    <div className="space-y-8 pt-2">
      <div>
        <h1 className="text-2xl text-vinho">Painel do professor</h1>
        <p className="text-sm text-suave">
          {formatarDataBR(f.de)} a {formatarDataBR(f.ate)} · só alunos e partidas concluídas
        </p>
      </div>

      <form action="/professor" className="grid grid-cols-2 gap-2 rounded-lg border border-marfim bg-superficie p-3 sm:grid-cols-6">
        <label className="col-span-1 space-y-1 text-xs sm:col-span-1">
          <span>De</span>
          <input type="date" name="de" defaultValue={f.de} className={campo} />
        </label>
        <label className="col-span-1 space-y-1 text-xs">
          <span>Até</span>
          <input type="date" name="ate" defaultValue={f.ate} className={campo} />
        </label>
        <label className="space-y-1 text-xs">
          <span>Semestre</span>
          <select name="semestre" defaultValue={f.semestre ?? ""} className={campo}>
            <option value="">Todos</option>
            {[1, 2, 3, 4, 5, 6].map((s) => <option key={s} value={s}>{s}º</option>)}
          </select>
        </label>
        <label className="space-y-1 text-xs">
          <span>Turma</span>
          <select name="turma" defaultValue={f.turma ?? ""} className={campo}>
            <option value="">Todas</option>
            {turmas.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-xs">
          <span>Modo</span>
          <select name="modo" defaultValue={f.modo ?? ""} className={campo}>
            <option value="">Todos</option>
            <option value="diario">Caso do dia</option>
            <option value="livres">Treino, semestre e arquivo</option>
          </select>
        </label>
        <div className="col-span-2 flex items-end sm:col-span-1">
          <button className="min-h-11 w-full rounded-md bg-vinho px-3 text-sm font-medium text-areia">Aplicar</button>
        </div>
      </form>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["alunos ativos", r.alunos],
          ["partidas", r.jogos],
          ["taxa de acerto", pct(r.taxaAcerto)],
          ["média de tentativas", num(r.mediaTentativas)],
        ].map(([rot, v]) => (
          <div key={rot} className="rounded-lg border border-marfim p-3">
            <p className="font-titulo text-2xl font-semibold text-vinho">{v}</p>
            <p className="text-xs text-suave">{rot}</p>
          </div>
        ))}
      </div>

      <a href={csv("partidas")} className="inline-flex min-h-11 items-center gap-1.5 rounded-md bg-vinho px-4 text-sm font-medium text-areia">
        <Download aria-hidden size={16} strokeWidth={1.5} />
        Exportar todas as partidas (CSV)
      </a>

      <Secao id="alunos" titulo="Por aluno" csv={csv("alunos")}>
        <Tabela
          cab={["Aluno", "Sem.", "Turma", "Partidas", "Acerto", "Média tent.", "Último acesso"]}
          linhas={porAluno(partidas, perfis).map((a) => [
            `${a.perfil.nome} (${a.perfil.apelido})`,
            a.perfil.semestre ?? "–",
            a.perfil.turma ?? "–",
            a.jogos,
            pct(a.taxaAcerto),
            num(a.mediaTentativas),
            new Date(a.ultimoAcesso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }),
          ])}
        />
      </Secao>

      <Secao id="turmas" titulo="Por semestre e turma" csv={csv("turmas")}>
        <Tabela
          cab={["Turma", "Alunos", "Partidas", "Acerto", "Média tent."]}
          linhas={porTurma(partidas, perfis).map((t) => [`${t.semestre ?? "–"}º · ${t.turma}`, t.alunos, t.jogos, pct(t.taxaAcerto), num(t.mediaTentativas)])}
        />
      </Secao>

      <Secao id="casos" titulo="Casos com mais erros" csv={csv("casos")}>
        <Tabela
          cab={["Caso (diagnóstico)", "Partidas", "Acerto", "Média tent."]}
          linhas={porCaso(partidas, casos).map((c) => [c.diagnostico, c.jogos, pct(c.taxaAcerto), num(c.mediaTentativas)])}
        />
      </Secao>

      <Secao id="sistemas" titulo="Sistemas com mais erros">
        <Tabela
          cab={["Sistema", "Partidas", "Acerto", "Média tent."]}
          linhas={porSistema(partidas).map((s) => [ROTULO_SISTEMA[s.sistema as Sistema] ?? s.sistema, s.jogos, pct(s.taxaAcerto), num(s.mediaTentativas)])}
        />
      </Secao>

      <Secao id="exames" titulo="Exames mais pedidos" csv={csv("exames")}>
        <Tabela
          cab={["Caso · exame", "Classificação", "Vezes"]}
          linhas={exames.map((e) => [`${e.diagnostico} · ${e.exame}`, CLASSE[e.classificacao] ?? e.classificacao, e.vezes])}
        />
      </Secao>

      <Secao id="condutas" titulo="Condutas mais marcadas" csv={csv("condutas")}>
        <p className="mb-2 text-xs text-suave">Linhas em destaque: condutas contraindicadas.</p>
        <Tabela
          cab={["Caso · conduta", "Classificação", "Vezes", "% dos tratamentos"]}
          linhas={condutas.map((c) => [`${c.diagnostico} · ${c.conduta}`, CLASSE[c.classificacao] ?? c.classificacao, c.vezes, pct(c.fracao)])}
          destaque={(i) => condutas[i].classificacao === "contraindicado"}
        />
      </Secao>
    </div>
  );
}
