import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabaseSessao } from "@/lib/supabase/servidor";

/**
 * Destino do link enviado por e-mail. Aceita os dois formatos:
 * - token_hash (modelo de e-mail recomendado no README: funciona mesmo se o
 *   link abrir em outro navegador, como o do app do Gmail);
 * - code (modelo padrão do Supabase: só funciona no mesmo navegador).
 */
export async function GET(req: NextRequest) {
  const u = req.nextUrl;
  const supabase = await supabaseSessao();
  const tokenHash = u.searchParams.get("token_hash");
  const tipo = (u.searchParams.get("type") ?? "email") as EmailOtpType;
  const code = u.searchParams.get("code");

  let ok = false;
  if (tokenHash) ok = !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type: tipo })).error;
  else if (code) ok = !(await supabase.auth.exchangeCodeForSession(code)).error;

  return NextResponse.redirect(new URL(ok ? "/cadastro" : "/entrar?erro=link", u.origin));
}
