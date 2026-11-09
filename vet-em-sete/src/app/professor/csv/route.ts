import { NextResponse, type NextRequest } from "next/server";
import { obterSessao } from "@/lib/sessao";
import { carregarPainel } from "@/lib/dadosPainel";
import { lerFiltrosPainel } from "@/lib/filtrosPainel";
import { banco } from "@/lib/dados";
import { condutasMarcadas, examesPedidos, palpitesTexto, paraCSV, porAluno, porCaso, porTurma } from "@/lib/painel";
import { ROTULO_GRUPO, ROTULO_SISTEMA, type GrupoEspecie, type Sistema } from "@/lib/caso/esquema";

const MODO: Record<string, string> = { diario: "caso do dia", treino: "treino", semestre: "semestre", arquivo: "arquivo" };

export async function GET(req: NextRequest) {
  const sessao = await obterSessao();
  if (sessao.estado !== "ok" || sessao.perfil.papel !== "professor")
    return NextResponse.json({ erro: "Acesso restrito ao professor." }, { status: 403 });

  const sp = Object.fromEntries(req.nextUrl.searchParams.entries());
  const f = lerFiltrosPainel(sp);
  const { perfis, partidas, casos } = await carregarPainel(sessao.perfil.instituicao, f);
  const tipo = sp.tipo ?? "partidas";
  let cab: string[] = [];
  let linhas: unknown[][] = [];

  if (tipo === "alunos") {
    cab = ["nome", "apelido", "email", "semestre", "turma", "partidas", "acertos", "taxa_acerto", "media_tentativas", "pontos", "ultimo_acesso"];
    linhas = porAluno(partidas, perfis).map((a) => [
      a.perfil.nome, a.perfil.apelido, a.perfil.email, a.perfil.semestre, a.perfil.turma, a.jogos, a.acertos,
      Math.round(a.taxaAcerto * 1000) / 1000, a.mediaTentativas, a.pontos, a.ultimoAcesso,
    ]);
  } else if (tipo === "turmas") {
    cab = ["semestre", "turma", "alunos", "partidas", "acertos", "taxa_acerto", "media_tentativas"];
    linhas = porTurma(partidas, perfis).map((t) => [t.semestre, t.turma, t.alunos, t.jogos, t.acertos, Math.round(t.taxaAcerto * 1000) / 1000, t.mediaTentativas]);
  } else if (tipo === "casos") {
    cab = ["caso_id", "diagnostico", "partidas", "acertos", "taxa_acerto", "media_tentativas"];
    linhas = porCaso(partidas, casos).map((c) => [c.casoId, c.diagnostico, c.jogos, c.acertos, Math.round(c.taxaAcerto * 1000) / 1000, c.mediaTentativas]);
  } else if (tipo === "exames") {
    cab = ["caso_id", "diagnostico", "exame", "classificacao", "vezes"];
    linhas = examesPedidos(partidas, casos).map((e) => [e.casoId, e.diagnostico, e.exame, e.classificacao, e.vezes]);
  } else if (tipo === "condutas") {
    cab = ["caso_id", "diagnostico", "conduta", "classificacao", "vezes", "fracao_dos_tratamentos"];
    linhas = condutasMarcadas(partidas, casos).map((c) => [c.casoId, c.diagnostico, c.conduta, c.classificacao, c.vezes, Math.round(c.fracao * 1000) / 1000]);
  } else {
    const b = await banco();
    const nomes = new Map(b.diagnosticos.map((d) => [d.id, d.nome]));
    cab = ["data", "modo", "nome", "apelido", "email", "semestre", "turma", "diagnostico_correto", "especie", "sistema", "acertou", "tentativa_acerto", "pontos", "palpites", "exames", "condutas"];
    linhas = partidas.map((p) => {
      const pf = perfis.get(p.user_id)!;
      const caso = b.buscarCaso(p.caso_id);
      const exames = p.acoes.flatMap((a) => (a.tipo === "exame" ? [caso?.exames.find((e) => e.id === a.exameId)?.nome ?? a.exameId] : []));
      const trat = p.acoes.find((a) => a.tipo === "tratamento");
      const condutas = trat && trat.tipo === "tratamento" ? trat.condutas.map((c) => caso?.tratamentos.find((t) => t.id === c)?.texto ?? c) : [];
      return [
        p.data_caso, MODO[p.modo] ?? p.modo, pf.nome, pf.apelido, pf.email, pf.semestre, pf.turma,
        casos.get(p.caso_id)?.diagnosticoNome ?? p.caso_id,
        ROTULO_GRUPO[p.grupo_especie as GrupoEspecie] ?? p.grupo_especie,
        ROTULO_SISTEMA[p.sistema as Sistema] ?? p.sistema,
        p.acertou ? "sim" : "não", p.tentativa_acerto, p.pontos_total,
        palpitesTexto(p.acoes, nomes), exames.join(" | "), condutas.join(" | "),
      ];
    });
  }

  const nome = `vet-em-sete-${tipo}-${f.de}-a-${f.ate}.csv`;
  return new NextResponse(paraCSV(cab, linhas), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nome}"`,
      "Cache-Control": "no-store",
    },
  });
}
