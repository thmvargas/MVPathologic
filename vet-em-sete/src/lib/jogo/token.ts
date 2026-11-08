import { createHmac, timingSafeEqual } from "node:crypto";
import type { Estado } from "./motor";

/**
 * Estado da partida assinado (HMAC-SHA256). Usado enquanto o jogo roda sem
 * login (Etapa 2): o navegador guarda o token, mas não consegue alterá-lo sem
 * a assinatura invalidar. A partir da Etapa 3 o estado oficial passa para a
 * tabela `partidas` no banco.
 */

function segredo(): string {
  const s = process.env.SEGREDO_PARTIDA;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "production")
    throw new Error("Defina SEGREDO_PARTIDA (32+ caracteres) nas variáveis de ambiente.");
  return "segredo-de-desenvolvimento-nao-usar-em-producao";
}

const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64url");

function assinatura(corpo: string): string {
  return createHmac("sha256", segredo()).update(corpo).digest("base64url");
}

export function assinarEstado(estado: Estado): string {
  const corpo = b64(JSON.stringify(estado));
  return `${corpo}.${assinatura(corpo)}`;
}

export function lerEstado(token: string): Estado | null {
  if (typeof token !== "string" || token.length > 20_000) return null;
  const [corpo, sig] = token.split(".");
  if (!corpo || !sig) return null;
  const esperado = Buffer.from(assinatura(corpo));
  const recebido = Buffer.from(sig);
  if (esperado.length !== recebido.length || !timingSafeEqual(esperado, recebido)) return null;
  try {
    const e = JSON.parse(Buffer.from(corpo, "base64url").toString("utf8"));
    if (typeof e?.casoId !== "string" || typeof e?.versao !== "number" || !Array.isArray(e?.acoes)) return null;
    return e as Estado;
  } catch {
    return null;
  }
}
