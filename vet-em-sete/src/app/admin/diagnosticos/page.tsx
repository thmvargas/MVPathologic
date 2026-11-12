import { banco } from "@/lib/dados";
import { ROTULO_CATEGORIA, ROTULO_SISTEMA } from "@/lib/caso/esquema";
import { normalizar } from "@/lib/util/texto";
import EditorDiagnostico from "@/components/admin/EditorDiagnostico";

export default async function AdminDiagnosticos({ searchParams }: { searchParams: Promise<{ busca?: string }> }) {
  const { busca } = await searchParams;
  const b = await banco();
  const t = normalizar(busca ?? "");
  const lista = b.diagnosticos
    .filter((d) => !t || normalizar([d.nome, ...d.sinonimos, d.agente_genero ?? ""].join(" ")).includes(t))
    .sort((x, y) => x.nome.localeCompare(y.nome, "pt-BR"));
  return (
    <div className="space-y-4">
      <h1 className="text-2xl text-marca">Diagnósticos ({b.diagnosticos.length})</h1>
      <p className="text-sm text-suave">
        Lista controlada usada no autocompletar e no feedback de proximidade (sistema, categoria e agente).
        {b.origem === "repositorio" && " Para editar, importe antes os casos do repositório na aba Casos."}
      </p>
      <details className="rounded-lg border border-marca-borda bg-marca-claro p-3">
        <summary className="cursor-pointer font-medium">Cadastrar diagnóstico</summary>
        <div className="mt-3"><EditorDiagnostico novo /></div>
      </details>
      <form action="/admin/diagnosticos">
        <input name="busca" defaultValue={busca} placeholder="Buscar por nome, sigla ou agente" className="min-h-11 w-full rounded-md border border-texto/40 bg-fundo px-3 text-sm" />
      </form>
      <ul className="space-y-2">
        {lista.map((d) => (
          <li key={d.id}>
            <details className="rounded-lg border border-linha">
              <summary className="cursor-pointer px-3 py-2">
                <span className="font-medium">{d.nome}</span>
                <span className="block text-xs text-suave">
                  {ROTULO_SISTEMA[d.sistemas[0]]} · {ROTULO_CATEGORIA[d.categoria]}
                  {d.agente_genero ? ` · ${d.agente_genero}` : ""}
                </span>
              </summary>
              <div className="border-t border-linha p-3"><EditorDiagnostico inicial={d} /></div>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
