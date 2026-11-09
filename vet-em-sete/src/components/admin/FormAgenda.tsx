"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { agendar, type Resposta } from "@/app/admin/acoes";

export default function FormAgenda({ opcoes, minimo }: { opcoes: [string, string][]; minimo: string }) {
  const [data, setData] = useState(minimo);
  const [caso, setCaso] = useState(opcoes[0]?.[0] ?? "");
  const [r, setR] = useState<Resposta | null>(null);
  const [pendente, iniciar] = useTransition();
  const router = useRouter();
  const cls = "min-h-11 w-full rounded-md border border-grafite/40 bg-areia px-2 text-sm";
  if (!opcoes.length) return <p className="text-sm text-suave">Nenhum caso aprovado de uso &quot;caso do dia&quot; para agendar.</p>;
  return (
    <form
      className="grid gap-2 sm:grid-cols-[10rem_1fr_auto] sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        iniciar(async () => {
          const res = await agendar(data, caso);
          setR(res);
          if (res.ok) router.refresh();
        });
      }}
    >
      <label className="space-y-1 text-xs">
        <span className="font-medium">Data</span>
        <input type="date" min={minimo} required value={data} onChange={(e) => setData(e.target.value)} className={cls} />
      </label>
      <label className="space-y-1 text-xs">
        <span className="font-medium">Caso</span>
        <select value={caso} onChange={(e) => setCaso(e.target.value)} className={cls}>
          {opcoes.map(([id, rot]) => <option key={id} value={id}>{rot}</option>)}
        </select>
      </label>
      <button disabled={pendente} className="min-h-11 rounded-md bg-vinho px-4 text-sm font-medium text-areia disabled:opacity-40">Agendar</button>
      {r && <p role={r.ok ? "status" : "alert"} className={`text-sm sm:col-span-3 ${r.ok ? "text-esmeralda" : "text-carmim"}`}>{r.mensagem}</p>}
    </form>
  );
}
