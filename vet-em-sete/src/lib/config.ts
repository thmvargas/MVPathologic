import { lerDominios } from "@/lib/util/dominio";

/** Configuração lida das variáveis de ambiente (ver .env.example). */
export const config = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  dominios: () => lerDominios(process.env.ALLOWED_EMAIL_DOMAINS),
  professores: () => lerDominios(process.env.PROFESSOR_EMAILS), // mesma limpeza: vírgulas, espaços, minúsculas
  instituicao: () => process.env.INSTITUICAO_PADRAO?.trim() || "UNIFEOB",
  siteUrl: () => (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
};

/** Login e banco só funcionam com as três chaves do Supabase configuradas. */
export function loginConfigurado(): boolean {
  return Boolean(config.supabaseUrl && config.supabaseAnon && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
