"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CATEGORIAS, ESPECIES, ROTULO_CATEGORIA, ROTULO_SISTEMA, SISTEMAS, type Diagnostico,
} from "@/lib/caso/esquema";
import { excluirDiagnostico, salvarDiagnostico, type Resposta } from "@/app/admin/acoes";

const cls = "min-h-11 w-full rounded-md border border-texto/40 bg-fundo px-2 text-sm";

function slug(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

export default function EditorDiagnostico({ inicial, novo }: { inicial?: Diagnostico; novo?: boolean }) {
  const [d, setD] = useState<Diagnostico>(
    inicial ?? { id: "", nome: "", sinonimos: [], especies: ["canina"], sistemas: ["digestorio"], categoria: "infecciosa_viral" },
  );
  const [sin, setSin] = useState(d.sinonimos.join(", "));
  const [r, setR] = useState<Resposta | null>(null);
  const [pendente, iniciar] = useTransition();
  const router = useRouter();

  const alternar = <T extends string>(lista: T[], v: T) => (lista.includes(v) ? lista.filter((x) => x !== v) : [...lista, v]);

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        const final = {
          ...d,
          id: novo ? d.id || slug(d.nome) : d.id,
          sinonimos: sin.split(",").map((x) => x.trim()).filter(Boolean),
          agente_grupo: d.agente_grupo || undefined,
          agente_genero: d.agente_genero || undefined,
        };
        iniciar(async () => {
          const res = await salvarDiagnostico(JSON.stringify(final));
          setR(res);
          if (res.ok) router.refresh();
        });
      }}
    >
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="space-y-1 text-xs">
          <span className="font-medium">Nome</span>
          <input required value={d.nome} onChange={(e) => setD({ ...d, nome: e.target.value })} className={cls} />
        </label>
        <label className="space-y-1 text-xs">
          <span className="font-medium">Sinônimos e siglas (separados por vírgula)</span>
          <input value={sin} onChange={(e) => setSin(e.target.value)} className={cls} />
        </label>
        <label className="space-y-1 text-xs">
          <span className="font-medium">Categoria etiológica</span>
          <select value={d.categoria} onChange={(e) => setD({ ...d, categoria: e.target.value as Diagnostico["categoria"] })} className={cls}>
            {CATEGORIAS.map((c) => <option key={c} value={c}>{ROTULO_CATEGORIA[c]}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-xs">
          <span className="font-medium">Sistema principal</span>
          <select
            value={d.sistemas[0]}
            onChange={(e) => {
              const v = e.target.value as Diagnostico["sistemas"][number];
              setD({ ...d, sistemas: [v, ...d.sistemas.filter((s) => s !== v)] });
            }}
            className={cls}
          >
            {SISTEMAS.map((s) => <option key={s} value={s}>{ROTULO_SISTEMA[s]}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-xs">
          <span className="font-medium">Grupo do agente (família, ordem)</span>
          <input value={d.agente_grupo ?? ""} onChange={(e) => setD({ ...d, agente_grupo: e.target.value })} placeholder="Ex.: Anaplasmataceae" className={cls} />
        </label>
        <label className="space-y-1 text-xs">
          <span className="font-medium">Gênero do agente</span>
          <input value={d.agente_genero ?? ""} onChange={(e) => setD({ ...d, agente_genero: e.target.value })} placeholder="Ex.: Ehrlichia" className={cls} />
        </label>
      </div>
      <fieldset className="text-xs">
        <legend className="font-medium">Outros sistemas acometidos</legend>
        <div className="mt-1 flex flex-wrap gap-x-3">
          {SISTEMAS.filter((s) => s !== d.sistemas[0]).map((s) => (
            <label key={s} className="inline-flex min-h-9 items-center gap-1.5">
              <input type="checkbox" checked={d.sistemas.includes(s)} onChange={() => setD({ ...d, sistemas: [d.sistemas[0], ...alternar(d.sistemas.slice(1), s)] })} />
              {ROTULO_SISTEMA[s]}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="text-xs">
        <legend className="font-medium">Espécies</legend>
        <div className="mt-1 flex flex-wrap gap-x-3">
          {ESPECIES.map((e) => (
            <label key={e} className="inline-flex min-h-9 items-center gap-1.5">
              <input type="checkbox" checked={d.especies.includes(e)} onChange={() => setD({ ...d, especies: alternar(d.especies, e) })} />
              {e}
            </label>
          ))}
        </div>
      </fieldset>
      {r && <p role={r.ok ? "status" : "alert"} className={`text-sm ${r.ok ? "text-sucesso-escuro" : "text-destaque-escuro"}`}>{r.mensagem}</p>}
      <div className="flex gap-2">
        <button disabled={pendente} className="min-h-11 rounded-md bg-marca px-4 text-sm font-medium text-fundo disabled:opacity-40">
          {novo ? "Cadastrar" : "Salvar"}
        </button>
        {!novo && (
          <button
            type="button"
            disabled={pendente}
            onClick={() =>
              window.confirm(`Excluir "${d.nome}"?`) &&
              iniciar(async () => {
                const res = await excluirDiagnostico(d.id);
                setR(res);
                if (res.ok) router.refresh();
              })
            }
            className="min-h-11 rounded-md border border-destaque px-4 text-sm text-destaque-escuro"
          >
            Excluir
          </button>
        )}
      </div>
    </form>
  );
}
