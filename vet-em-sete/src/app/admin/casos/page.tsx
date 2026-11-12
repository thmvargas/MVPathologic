import Link from "next/link";
import { Plus } from "lucide-react";
import { casosParaAdmin } from "@/lib/adminDados";
import { banco } from "@/lib/dados";
import { ROTULO_GRUPO, type GrupoEspecie } from "@/lib/caso/esquema";
import { BotaoAcao } from "@/components/admin/BotaoAcao";
import { importarRepositorio } from "../acoes";

const STATUS: Record<string, [string, string]> = {
  rascunho: ["Rascunho", "bg-alerta-claro text-alerta-escuro border border-alerta-borda"],
  em_revisao: ["Em revisão", "bg-marca-claro text-marca border border-marca-borda"],
  revisado: ["Aprovado", "bg-sucesso text-texto"],
  arquivado: ["Arquivado", "bg-superficie text-suave border border-linha"],
};

export default async function AdminCasos({ searchParams }: { searchParams: Promise<{ status?: string; especie?: string }> }) {
  const sp = await searchParams;
  const { tabelas, linhas } = await casosParaAdmin();
  const b = await banco();
  const nomeDx = (id: unknown) => b.mapaDiagnosticos.get(String(id))?.nome ?? String(id ?? "—");
  const lista = linhas.filter(
    (l) => (!sp.status || l.status === sp.status) && (!sp.especie || l.conteudo.grupo_especie === sp.especie),
  );
  const contagem = (s: string) => linhas.filter((l) => l.status === s).length;
  const chip = (ativo: boolean) => `inline-flex min-h-10 items-center rounded-full border px-3 text-xs ${ativo ? "border-marca bg-marca text-fundo" : "border-linha"}`;
  const q = (o: Record<string, string | undefined>) => {
    const p = new URLSearchParams(Object.entries({ ...sp, ...o }).filter(([, v]) => v) as [string, string][]);
    return `/admin/casos${p.size ? `?${p}` : ""}`;
  };

  if (!tabelas)
    return (
      <div className="space-y-3 rounded-lg border border-alerta-borda bg-alerta-claro p-4 text-sm">
        <h1 className="text-xl">Falta um passo no Supabase</h1>
        <p>
          Rode o arquivo <code>supabase/ves_002_casos_admin.sql</code> no SQL Editor do Supabase. Depois volte aqui e
          clique em &quot;Importar do repositório&quot;.
        </p>
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl text-marca">Casos</h1>
        <div className="flex flex-wrap gap-2">
          <BotaoAcao acao={importarRepositorio} rotulo="Importar do repositório" />
          <Link href="/admin/casos/novo" className="inline-flex min-h-11 items-center gap-1.5 rounded-md bg-marca px-3 text-sm font-medium text-fundo">
            <Plus aria-hidden size={16} strokeWidth={1.5} />
            Novo caso
          </Link>
        </div>
      </div>

      {linhas.length === 0 && (
        <p className="rounded-md border border-alerta-borda bg-alerta-claro p-3 text-sm">
          O banco ainda está vazio: o jogo está usando os casos do repositório. Clique em &quot;Importar do
          repositório&quot; para trazê-los para cá e poder editar.
        </p>
      )}

      <nav aria-label="Filtrar por situação" className="flex flex-wrap gap-2">
        <Link href={q({ status: undefined })} className={chip(!sp.status)}>Todos ({linhas.length})</Link>
        {Object.entries(STATUS).map(([s, [rot]]) => (
          <Link key={s} href={q({ status: s })} className={chip(sp.status === s)}>{rot} ({contagem(s)})</Link>
        ))}
      </nav>
      <nav aria-label="Filtrar por espécie" className="flex flex-wrap gap-2">
        <Link href={q({ especie: undefined })} className={chip(!sp.especie)}>Todas as espécies</Link>
        {Object.entries(ROTULO_GRUPO).map(([g, rot]) => (
          <Link key={g} href={q({ especie: g })} className={chip(sp.especie === g)}>{rot}</Link>
        ))}
      </nav>

      <ul className="space-y-2">
        {lista.map((l) => {
          const [rot, cor] = STATUS[l.status] ?? [l.status, ""];
          const c = l.conteudo;
          return (
            <li key={l.id}>
              <Link href={`/admin/casos/${l.id}`} className="block rounded-lg border border-linha p-3 hover:border-marca">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex-1 font-medium">{nomeDx(c.diagnostico_id)}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cor}`}>{rot}</span>
                </div>
                <p className="mt-0.5 text-sm text-suave">
                  {ROTULO_GRUPO[c.grupo_especie as GrupoEspecie] ?? "—"} · {String(c.semestre ?? "—")}º sem. ·{" "}
                  {l.uso === "treino" ? "só treino" : "caso do dia"} · v{l.versao} · <code className="text-xs">{l.id}</code>
                </p>
                {l.problemas.length > 0 && (
                  <p className="mt-1 text-xs text-alerta-escuro">
                    {l.problemas.length} pendência{l.problemas.length > 1 ? "s" : ""}
                    {!l.valido && " · incompleto (fora do jogo)"}
                  </p>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
