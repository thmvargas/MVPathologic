import { NextResponse } from "next/server";
import { banco } from "@/lib/dados";

// Lista pública para o autocompletar: só id, nome e sinônimos.
// Os atributos usados no feedback de proximidade ficam no servidor.
export async function GET() {
  const itens = (await banco()).diagnosticos.map(({ id, nome, sinonimos }) => ({ id, nome, sinonimos }));
  return NextResponse.json(itens, { headers: { "Cache-Control": "public, max-age=60" } });
}
