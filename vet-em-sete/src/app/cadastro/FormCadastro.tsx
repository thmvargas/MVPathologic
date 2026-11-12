"use client";

import { useActionState } from "react";
import Link from "next/link";
import { salvarCadastro, type EstadoForm } from "./acoes";

type Inicial = { nome: string; apelido: string; semestre: number | null; turma: string | null };

export default function FormCadastro({ professor, inicial }: { professor: boolean; inicial?: Inicial }) {
  const [estado, acao, pendente] = useActionState<EstadoForm, FormData>(salvarCadastro, {});
  const campo = "min-h-12 w-full rounded-md border border-texto/40 bg-fundo px-3 text-base focus:border-marca focus:outline-none";
  return (
    <form action={acao} className="space-y-4">
      <label className="block space-y-1">
        <span className="text-sm font-medium">Nome completo</span>
        <input name="nome" required minLength={3} maxLength={120} autoComplete="name" defaultValue={inicial?.nome} className={campo} />
        <span className="block text-xs text-suave">Visível só para o professor.</span>
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Apelido</span>
        <input name="apelido" required minLength={2} maxLength={24} defaultValue={inicial?.apelido} className={campo} />
        <span className="block text-xs text-suave">É o nome que aparece no ranking.</span>
      </label>
      {!professor && (
        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1">
            <span className="text-sm font-medium">Semestre</span>
            <select name="semestre" required defaultValue={inicial?.semestre ?? ""} className={campo}>
              <option value="" disabled>
                Escolha
              </option>
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <option key={s} value={s}>
                  {s}º semestre
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Turma</span>
            <input name="turma" required maxLength={40} placeholder="Ex.: A noturno" defaultValue={inicial?.turma ?? ""} className={campo} />
          </label>
        </div>
      )}
      <label className="flex min-h-12 items-start gap-3 text-sm">
        <input type="checkbox" name="aceite" required className="mt-1 size-4 shrink-0 accent-[#0018ff]" />
        <span>
          Li o <Link href="/privacidade" target="_blank" className="text-marca underline">aviso de privacidade</Link> e
          concordo com o uso dos meus dados de jogo para fins didáticos.
        </span>
      </label>
      {estado.erro && <p role="alert" className="text-sm text-destaque-escuro">{estado.erro}</p>}
      <button type="submit" disabled={pendente} className="min-h-12 w-full rounded-md bg-marca px-4 font-medium text-fundo disabled:opacity-40">
        {pendente ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
