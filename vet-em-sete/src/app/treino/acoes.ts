"use server";

import { redirect } from "next/navigation";
import { casosLivres } from "@/lib/catalogo";
import { codigoDoCaso } from "@/lib/dados";
import { aplicarFiltro, sortearTreino } from "@/lib/util/filtros";
import { lerEspecie, situacaoDoAluno } from "@/lib/paginas";
import { SISTEMAS } from "@/lib/caso/esquema";

export async function sortear(form: FormData) {
  const especie = lerEspecie(String(form.get("especie") ?? ""));
  const semestre = Number(form.get("semestre")) || undefined;
  const sistemaBruto = String(form.get("sistema") ?? "");
  const sistema = SISTEMAS.find((s) => s === sistemaBruto);
  const lista = aplicarFiltro(await casosLivres(), { especie, semestre, sistema });
  const jogados = new Set([...(await situacaoDoAluno()).entries()].filter(([, s]) => s !== "em_andamento").map(([id]) => id));
  const caso = sortearTreino(lista, jogados);
  if (!caso) {
    const q = new URLSearchParams({ vazio: "1", ...(especie ? { especie } : {}), ...(semestre ? { semestre: String(semestre) } : {}), ...(sistema ? { sistema } : {}) });
    redirect(`/treino?${q}`);
  }
  redirect(`/jogar/${codigoDoCaso(caso)}?modo=treino`);
}
