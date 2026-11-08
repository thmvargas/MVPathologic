"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { buscarDiagnosticos, normalizar, type ItemBusca } from "@/lib/util/texto";

/**
 * Campo de diagnóstico com autocompletar (padrão ARIA combobox).
 * Só permite escolher um item da lista controlada.
 */
export function Autocompletar({
  itens,
  excluir,
  onEscolher,
  desabilitado,
}: {
  itens: ItemBusca[];
  excluir: ReadonlySet<string>;
  onEscolher: (item: ItemBusca | null) => void;
  desabilitado?: boolean;
}) {
  const [texto, setTexto] = useState("");
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState(0);
  const [escolhido, setEscolhido] = useState<ItemBusca | null>(null);
  const idLista = useId();
  const idRotulo = useId();
  const ref = useRef<HTMLInputElement>(null);

  const disponiveis = useMemo(() => itens.filter((i) => !excluir.has(i.id)), [itens, excluir]);
  const resultados = useMemo(() => buscarDiagnosticos(disponiveis, texto, 8), [disponiveis, texto]);

  useEffect(() => setAtivo(0), [texto]);
  useEffect(() => onEscolher(escolhido), [escolhido, onEscolher]);
  useEffect(() => {
    if (excluir.size) {
      setTexto("");
      setEscolhido(null);
    }
  }, [excluir]);

  function escolher(i: ItemBusca) {
    setEscolhido(i);
    setTexto(i.nome);
    setAberto(false);
  }

  function sinonimoQueCasou(i: ItemBusca): string | null {
    const t = normalizar(texto);
    if (!t || normalizar(i.nome).includes(t)) return null;
    return i.sinonimos.find((s) => normalizar(s).includes(t)) ?? null;
  }

  const mostrar = aberto && resultados.length > 0;

  return (
    <div className="relative">
      <label id={idRotulo} htmlFor={`${idLista}-campo`} className="sr-only">
        Diagnóstico
      </label>
      <div className="flex items-center gap-2 rounded-md border border-grafite/40 bg-areia px-3 focus-within:border-vinho">
        <Search aria-hidden size={18} strokeWidth={1.5} className="shrink-0 text-suave" />
        <input
          ref={ref}
          id={`${idLista}-campo`}
          role="combobox"
          aria-expanded={mostrar}
          aria-controls={idLista}
          aria-autocomplete="list"
          aria-activedescendant={mostrar ? `${idLista}-${ativo}` : undefined}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          disabled={desabilitado}
          placeholder="Digite o diagnóstico"
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            setEscolhido(null);
            setAberto(true);
          }}
          onFocus={() => setAberto(true)}
          onBlur={() => setTimeout(() => setAberto(false), 120)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setAberto(true);
              setAtivo((a) => Math.min(a + 1, resultados.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setAtivo((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter" && mostrar) {
              e.preventDefault();
              escolher(resultados[ativo]);
            } else if (e.key === "Escape") {
              setAberto(false);
            }
          }}
          className="min-h-12 w-full bg-transparent text-base outline-none placeholder:text-suave"
        />
      </div>
      {mostrar && (
        <ul
          id={idLista}
          role="listbox"
          aria-labelledby={idRotulo}
          className="absolute bottom-full z-10 mb-1 max-h-72 w-full overflow-auto rounded-md border border-marfim bg-areia py-1 sm:bottom-auto sm:top-full sm:mb-0 sm:mt-1"
        >
          {resultados.map((r, i) => {
            const sin = sinonimoQueCasou(r);
            return (
              <li
                key={r.id}
                id={`${idLista}-${i}`}
                role="option"
                aria-selected={i === ativo}
                onMouseDown={(e) => {
                  e.preventDefault();
                  escolher(r);
                }}
                onMouseEnter={() => setAtivo(i)}
                className={`cursor-pointer px-3 py-2.5 ${i === ativo ? "bg-vinho-claro" : ""}`}
              >
                <span>{r.nome}</span>
                {sin && <span className="ml-2 text-xs text-suave">({sin})</span>}
              </li>
            );
          })}
        </ul>
      )}
      {aberto && texto.trim() && resultados.length === 0 && (
        <p className="mt-1 text-xs text-suave">Nenhum diagnóstico da lista corresponde a esse termo.</p>
      )}
    </div>
  );
}
