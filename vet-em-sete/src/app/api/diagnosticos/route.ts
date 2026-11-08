import { NextResponse } from "next/server";
import { listaDiagnosticos } from "@/lib/dados";

// Lista pública para o autocompletar: só id, nome e sinônimos.
// Os atributos usados no feedback de proximidade ficam no servidor.
export function GET() {
  const itens = listaDiagnosticos().map(({ id, nome, sinonimos }) => ({ id, nome, sinonimos }));
  return NextResponse.json(itens, { headers: { "Cache-Control": "public, max-age=300" } });
}
