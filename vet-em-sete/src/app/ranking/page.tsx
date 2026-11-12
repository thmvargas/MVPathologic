import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { obterSessao } from "@/lib/sessao";
import { partidasDoRanking, perfisDaInstituicao } from "@/lib/consultas";
import { calcularRanking, mesDe, semanaDe } from "@/lib/ranking";
import { dataBR } from "@/lib/util/tempo";

export const metadata = { title: "Ranking · Vet em Sete" };

function deslocar(data: string, periodo: "semana" | "mes", passo: number): string {
  const d = new Date(`${data}T12:00:00Z`);
  if (periodo === "semana") d.setUTCDate(d.getUTCDate() + 7 * passo);
  else d.setUTCMonth(d.getUTCMonth() + passo, 1);
  return d.toISOString().slice(0, 10);
}

export default async function Ranking({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; escopo?: string; ref?: string; semestre?: string; turma?: string }>;
}) {
  const sessao = await obterSessao();
  if (sessao.estado === "sem_cadastro") redirect("/cadastro");
  if (sessao.estado !== "ok") redirect("/entrar?volta=/ranking");
  const { perfil } = sessao;
  const sp = await searchParams;
  const hoje = dataBR();
  const periodo = sp.periodo === "mes" ? "mes" : "semana";
  const ref = sp.ref && /^\d{4}-\d{2}-\d{2}$/.test(sp.ref) && sp.ref <= hoje ? sp.ref : hoje;
  const p = periodo === "mes" ? mesDe(ref) : semanaDe(ref);
  const professor = perfil.papel === "professor";

  // Escopo: aluno vê geral, o próprio semestre ou a própria turma; professor escolhe.
  const escopo = ["geral", "semestre", "turma"].includes(sp.escopo ?? "") ? sp.escopo! : "geral";
  const filtro =
    professor
      ? { semestre: Number(sp.semestre) || undefined, turma: sp.turma || undefined }
      : escopo === "semestre"
        ? { semestre: perfil.semestre ?? undefined }
        : escopo === "turma"
          ? { semestre: perfil.semestre ?? undefined, turma: perfil.turma ?? undefined }
          : {};

  const perfis = await perfisDaInstituicao(perfil.instituicao);
  const linhas = calcularRanking(await partidasDoRanking(p.inicio, p.fim), perfis, filtro);
  const minha = linhas.find((l) => l.user_id === perfil.id);
  const top = linhas.slice(0, 50);

  const q = (extra: Record<string, string>) =>
    `/ranking?${new URLSearchParams({ periodo, escopo, ref, ...(sp.semestre ? { semestre: sp.semestre } : {}), ...(sp.turma ? { turma: sp.turma } : {}), ...extra })}`;
  const aba = (ativo: boolean) =>
    `inline-flex min-h-11 items-center rounded-full border px-3 text-sm ${ativo ? "border-marca bg-marca text-fundo" : "border-linha text-texto"}`;
  const turmas = [...new Set([...perfis.values()].map((x) => x.turma?.trim()).filter(Boolean) as string[])].sort();

  return (
    <div className="space-y-4 pt-2">
      <h1 className="text-2xl text-marca">Ranking</h1>
      <p className="text-sm text-suave">Soma dos pontos no caso do dia. Desempate: mais acertos, depois menos tentativas.</p>

      <nav aria-label="Período" className="flex flex-wrap gap-2">
        <Link href={q({ periodo: "semana", ref: hoje })} className={aba(periodo === "semana")}>Semanal</Link>
        <Link href={q({ periodo: "mes", ref: hoje })} className={aba(periodo === "mes")}>Mensal</Link>
      </nav>

      {professor ? (
        <form className="flex flex-wrap gap-2" action="/ranking">
          <input type="hidden" name="periodo" value={periodo} />
          <input type="hidden" name="ref" value={ref} />
          <select name="semestre" defaultValue={sp.semestre ?? ""} className="min-h-11 rounded-md border border-texto/40 bg-fundo px-2 text-sm">
            <option value="">Todos os semestres</option>
            {[1, 2, 3, 4, 5, 6].map((s) => <option key={s} value={s}>{s}º semestre</option>)}
          </select>
          <select name="turma" defaultValue={sp.turma ?? ""} className="min-h-11 rounded-md border border-texto/40 bg-fundo px-2 text-sm">
            <option value="">Todas as turmas</option>
            {turmas.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <button className="min-h-11 rounded-md border border-marca px-3 text-sm text-marca">Filtrar</button>
        </form>
      ) : (
        <nav aria-label="Quem aparece" className="flex flex-wrap gap-2">
          <Link href={q({ escopo: "geral" })} className={aba(escopo === "geral")}>Geral</Link>
          <Link href={q({ escopo: "semestre" })} className={aba(escopo === "semestre")}>{perfil.semestre}º semestre</Link>
          <Link href={q({ escopo: "turma" })} className={aba(escopo === "turma")}>Turma {perfil.turma}</Link>
        </nav>
      )}

      <div className="flex items-center justify-between rounded-md border border-linha px-2">
        <Link href={q({ ref: deslocar(ref, periodo, -1) })} aria-label="Período anterior" className="inline-flex min-h-11 min-w-11 items-center justify-center text-marca">
          <ChevronLeft aria-hidden size={20} strokeWidth={1.5} />
        </Link>
        <p className="text-sm font-medium">{p.rotulo}</p>
        {p.fim < hoje ? (
          <Link href={q({ ref: deslocar(ref, periodo, 1) })} aria-label="Próximo período" className="inline-flex min-h-11 min-w-11 items-center justify-center text-marca">
            <ChevronRight aria-hidden size={20} strokeWidth={1.5} />
          </Link>
        ) : (
          <span className="min-w-11" />
        )}
      </div>

      {top.length === 0 ? (
        <p className="text-suave">Ninguém jogou o caso do dia neste período ainda.</p>
      ) : (
        <table className="w-full text-sm">
          <caption className="sr-only">Ranking {p.rotulo}</caption>
          <thead>
            <tr className="border-b border-linha text-left text-xs text-suave">
              <th scope="col" className="py-2 pr-2 font-medium">#</th>
              <th scope="col" className="py-2 pr-2 font-medium">Apelido</th>
              <th scope="col" className="py-2 pr-2 text-right font-medium">Acertos</th>
              <th scope="col" className="py-2 text-right font-medium">Pontos</th>
            </tr>
          </thead>
          <tbody>
            {top.map((l) => (
              <tr key={l.user_id} className={`border-b border-linha/60 ${l.user_id === perfil.id ? "bg-marca-claro font-medium" : ""}`}>
                <td className="py-2 pr-2 tabular-nums">{l.posicao}</td>
                <td className="py-2 pr-2">
                  {l.apelido}
                  <span className="block text-xs font-normal text-suave">
                    {l.semestre}º sem.{l.turma ? ` · ${l.turma}` : ""}
                  </span>
                </td>
                <td className="py-2 pr-2 text-right tabular-nums">{l.acertos}/{l.jogos}</td>
                <td className="py-2 text-right tabular-nums">{l.pontos.toLocaleString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {minha && minha.posicao > 50 && (
        <p className="rounded-md border border-marca-borda bg-marca-claro p-3 text-sm">
          Sua posição: <strong>{minha.posicao}º</strong> com {minha.pontos.toLocaleString("pt-BR")} pontos.
        </p>
      )}
      {!minha && !professor && <p className="text-sm text-suave">Jogue o caso do dia para entrar no ranking deste período.</p>}
    </div>
  );
}
