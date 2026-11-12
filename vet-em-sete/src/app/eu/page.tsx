import Link from "next/link";
import { redirect } from "next/navigation";
import { Flame, Pencil, Trophy } from "lucide-react";
import { obterSessao } from "@/lib/sessao";
import { partidasFinalizadas } from "@/lib/partidas";
import { calcularEstatisticas, type Agrupado } from "@/lib/estatisticas";
import { dataBR } from "@/lib/util/tempo";
import { ROTULO_GRUPO, ROTULO_SISTEMA, type GrupoEspecie, type Sistema } from "@/lib/caso/esquema";
import { excluirMeusDados } from "./acoes";

export const metadata = { title: "Minhas estatísticas · Vet em Sete" };

const pct = (x: number) => `${Math.round(x * 100)}%`;

function Numero({ rotulo, valor }: { rotulo: string; valor: string | number }) {
  return (
    <div className="rounded-lg border border-linha p-3">
      <p className="font-titulo text-2xl font-semibold text-marca">{valor}</p>
      <p className="text-xs text-suave">{rotulo}</p>
    </div>
  );
}

function Barras({ titulo, itens, rotulo }: { titulo: string; itens: Agrupado[]; rotulo: (k: string) => string }) {
  if (!itens.length) return null;
  return (
    <section className="space-y-2">
      <h2 className="text-lg">{titulo}</h2>
      <ul className="space-y-2">
        {itens.map((g) => (
          <li key={g.chave} className="text-sm">
            <div className="flex justify-between">
              <span>{rotulo(g.chave)}</span>
              <span className="text-suave">
                {g.acertos}/{g.jogadas} · {pct(g.acertos / g.jogadas)}
              </span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-superficie" aria-hidden>
              <div className="h-2 rounded-full bg-sucesso" style={{ width: pct(g.acertos / g.jogadas) }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function Eu({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  const sessao = await obterSessao();
  if (sessao.estado === "sem_cadastro") redirect("/cadastro");
  if (sessao.estado !== "ok") redirect("/entrar?volta=/eu");
  const { perfil } = sessao;
  const e = calcularEstatisticas(await partidasFinalizadas(perfil.id), dataBR());
  const maior = Math.max(1, ...e.distribuicao);
  const rotulosDist = ["1ª", "2ª", "3ª", "4ª", "5ª", "6ª", "7ª", "Não acertou"];

  return (
    <div className="space-y-6 pt-2">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl text-marca">{perfil.apelido}</h1>
          <p className="text-sm text-suave">
            {perfil.nome}
            {perfil.semestre ? ` · ${perfil.semestre}º semestre` : ""}
            {perfil.turma ? ` · turma ${perfil.turma}` : ""}
            {perfil.papel === "professor" ? " · professor" : ""}
          </p>
        </div>
        <Link href="/cadastro?editar=1" className="inline-flex min-h-11 items-center gap-1 text-sm text-marca underline">
          <Pencil aria-hidden size={16} strokeWidth={1.5} />
          Editar cadastro
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Numero rotulo="partidas" valor={e.jogadas} />
        <Numero rotulo="taxa de acerto" valor={pct(e.taxaAcerto)} />
        <Numero rotulo="média de tentativas" valor={e.mediaTentativas?.toLocaleString("pt-BR") ?? "–"} />
        <Numero rotulo="pontos" valor={e.pontosTotais.toLocaleString("pt-BR")} />
      </div>

      <div className="flex flex-wrap gap-3">
        <p className="flex items-center gap-2 rounded-lg border border-alerta-borda bg-alerta-claro px-3 py-2 text-sm">
          <Flame aria-hidden size={18} strokeWidth={1.5} className="text-alerta-escuro" />
          Sequência atual: <strong>{e.streakAtual} {e.streakAtual === 1 ? "dia" : "dias"}</strong>
        </p>
        <p className="flex items-center gap-2 rounded-lg border border-linha px-3 py-2 text-sm">
          <Trophy aria-hidden size={18} strokeWidth={1.5} className="text-marca" />
          Recorde: <strong>{e.streakRecorde}</strong>
        </p>
      </div>

      {e.jogadas === 0 ? (
        <p className="text-suave">
          Você ainda não terminou nenhuma partida. <Link href="/hoje" className="text-marca underline">Jogue o caso do dia</Link>.
        </p>
      ) : (
        <>
          <section className="space-y-2">
            <h2 className="text-lg">Acertos por tentativa</h2>
            <ul className="space-y-1.5">
              {e.distribuicao.map((n, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span className="w-24 shrink-0 text-suave">{rotulosDist[i]}</span>
                  <span
                    className={`flex h-6 min-w-6 items-center justify-end rounded px-1.5 text-xs font-medium text-fundo ${i === 7 ? "bg-texto/60" : "bg-marca"}`}
                    style={{ width: `${Math.max(6, (n / maior) * 100)}%` }}
                  >
                    {n}
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <Barras titulo="Por sistema" itens={e.porSistema} rotulo={(k) => ROTULO_SISTEMA[k as Sistema] ?? k} />
          <Barras titulo="Por espécie" itens={e.porEspecie} rotulo={(k) => ROTULO_GRUPO[k as GrupoEspecie] ?? k} />
        </>
      )}

      <details className="rounded-lg border border-linha p-4 text-sm">
        <summary className="cursor-pointer font-medium">Excluir meus dados do Vet em Sete</summary>
        <form action={excluirMeusDados} className="mt-3 space-y-2">
          <p>
            Apaga seu cadastro e todas as suas partidas deste jogo. Não dá para desfazer. Para confirmar, digite{" "}
            <strong>EXCLUIR</strong>.
          </p>
          {erro === "confirmacao" && <p role="alert" className="text-destaque-escuro">Digite EXCLUIR para confirmar.</p>}
          {erro === "falha" && <p role="alert" className="text-destaque-escuro">Não foi possível excluir agora. Tente de novo.</p>}
          <input name="confirmacao" autoComplete="off" className="min-h-11 w-full rounded-md border border-texto/40 bg-fundo px-3" />
          <button type="submit" className="min-h-11 rounded-md border border-destaque bg-destaque-claro px-4 font-semibold text-destaque-escuro">Excluir</button>
        </form>
      </details>
    </div>
  );
}
