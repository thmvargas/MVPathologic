import { supabaseAdmin } from "@/lib/supabase/servidor";
import { banco } from "@/lib/dados";
import { ROTULO_GRUPO } from "@/lib/caso/esquema";
import { dataBR, formatarDataBR } from "@/lib/util/tempo";
import FormAgenda from "@/components/admin/FormAgenda";
import { BotaoAcao } from "@/components/admin/BotaoAcao";
import { desagendar } from "../acoes";

const DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

export default async function Agenda() {
  const hoje = dataBR();
  const b = await banco();
  const { data } = await supabaseAdmin().from("ves_caso_do_dia").select("data,caso_id,agendado").order("data", { ascending: false }).limit(120);
  const linhas = data ?? [];
  const nome = (id: string) => {
    const c = b.buscarCaso(id);
    return c ? `${b.mapaDiagnosticos.get(c.diagnostico_id)?.nome ?? id} · ${ROTULO_GRUPO[c.grupo_especie]}` : id;
  };
  const usados = new Set(linhas.filter((l) => l.data < hoje).map((l) => l.caso_id));
  const disponiveis = b.casos.filter((c) => c.status === "revisado" && c.uso === "diario");
  const opcoes = disponiveis
    .map((c) => [c.id, `${usados.has(c.id) ? "(já usado) " : ""}${nome(c.id)}`] as [string, string])
    .sort((x, y) => x[1].localeCompare(y[1], "pt-BR"));
  const futuros = linhas.filter((l) => l.data >= hoje).sort((x, y) => x.data.localeCompare(y.data));
  const passados = linhas.filter((l) => l.data < hoje);
  const ainda = disponiveis.filter((c) => !usados.has(c.id) && !futuros.some((f) => f.caso_id === c.id)).length;
  const dia = (d: string) => `${DIAS[new Date(`${d}T12:00:00Z`).getUTCDay()]} ${formatarDataBR(d)}`;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl text-marca">Agenda do caso do dia</h1>
      <p className="text-sm text-suave">
        Dias sem agendamento recebem um caso sorteado entre os aprovados ainda não usados. Restam {ainda} caso(s) inéditos para sorteio.
      </p>
      <section className="space-y-2 rounded-lg border border-linha bg-superficie p-3">
        <h2 className="text-lg">Agendar</h2>
        <FormAgenda opcoes={opcoes} minimo={hoje} />
      </section>
      <section className="space-y-2">
        <h2 className="text-lg">Hoje e próximos dias</h2>
        {futuros.length === 0 ? <p className="text-sm text-suave">Nada agendado.</p> : (
          <ul className="space-y-2">
            {futuros.map((l) => (
              <li key={l.data} className="flex flex-wrap items-center gap-2 rounded-md border border-linha p-3 text-sm">
                <span className="w-32 font-medium">{dia(l.data)}</span>
                <span className="flex-1">{nome(l.caso_id)}{l.data === hoje ? " · hoje" : ""}{!l.agendado ? " · sorteado" : ""}</span>
                {l.data > hoje && <BotaoAcao acao={desagendar.bind(null, l.data)} rotulo="Liberar" variante="perigo" />}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="space-y-2">
        <h2 className="text-lg">Dias anteriores</h2>
        <ul className="space-y-1 text-sm">
          {passados.map((l) => (
            <li key={l.data} className="flex gap-2 border-b border-linha/60 py-1.5">
              <span className="w-32 text-suave">{dia(l.data)}</span>
              <span>{nome(l.caso_id)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
