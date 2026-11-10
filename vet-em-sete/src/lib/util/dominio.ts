/**
 * Restrição de e-mail institucional. Os domínios vêm da configuração
 * (variável ALLOWED_EMAIL_DOMAINS, separada por vírgula), nunca do código.
 * A comparação é exata no domínio: "aluno@sou.unifeob.edu.br" casa com
 * "sou.unifeob.edu.br", mas "x@sou.unifeob.edu.br.golpe.com" não.
 */
export function lerDominios(valor: string | undefined): string[] {
  return (valor ?? "")
    .split(",")
    .map((d) => d.trim().toLowerCase().replace(/^@/, ""))
    .filter(Boolean);
}

export function dominioDoEmail(email: string): string | null {
  const e = email.trim().toLowerCase();
  const m = /^[^\s@]+@([a-z0-9-]+(\.[a-z0-9-]+)+)$/.exec(e);
  return m ? m[1] : null;
}

export function emailPermitido(email: string, dominios: readonly string[]): boolean {
  const d = dominioDoEmail(email);
  if (!d) return false;
  return dominios.some((p) => p.toLowerCase() === d);
}

export function ehProfessor(email: string, listaProfessores: readonly string[]): boolean {
  const e = email.trim().toLowerCase();
  return listaProfessores.some((p) => p.trim().toLowerCase() === e);
}
