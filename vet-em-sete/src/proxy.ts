import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Renova a sessão do Supabase a cada navegação (o token expira em 1 h e é
 * trocado aqui de forma transparente). Não bloqueia nada: quem decide o que
 * exige login são as próprias páginas.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let resposta = NextResponse.next({ request });
  if (!url || !anon) return resposta;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (lista) => {
        lista.forEach(({ name, value }) => request.cookies.set(name, value));
        resposta = NextResponse.next({ request });
        lista.forEach(({ name, value, options }) => resposta.cookies.set(name, value, options));
      },
    },
  });
  await supabase.auth.getUser();
  return resposta;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/diagnosticos|.*\\.(?:png|jpg|svg|ico|webp)$).*)"],
};
