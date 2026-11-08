import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config } from "@/lib/config";

/** Cliente com a sessão do usuário (cookies). Usado só para autenticação. */
export async function supabaseSessao() {
  const loja = await cookies();
  return createServerClient(config.supabaseUrl, config.supabaseAnon, {
    cookies: {
      getAll: () => loja.getAll(),
      setAll: (lista) => {
        try {
          lista.forEach(({ name, value, options }) => loja.set(name, value, options));
        } catch {
          // Chamado de um Server Component: o proxy.ts renova os cookies.
        }
      },
    },
  });
}

let admin: SupabaseClient | null = null;

/**
 * Cliente com a chave service_role: só no servidor. Todas as tabelas ves_
 * passam por aqui (no banco elas não têm política nenhuma para o navegador).
 */
export function supabaseAdmin(): SupabaseClient {
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!chave) throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  admin ??= createClient(config.supabaseUrl, chave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return admin;
}
