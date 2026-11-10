import { describe, expect, it } from "vitest";
import { ehProfessor, emailPermitido, lerDominios } from "@/lib/util/dominio";

const dominios = lerDominios(" unifeob.pro.br, @sou.unifeob.edu.br ,");

describe("restrição de domínio de e-mail", () => {
  it("lê a configuração", () => {
    expect(dominios).toEqual(["unifeob.pro.br", "sou.unifeob.edu.br"]);
  });
  it("aceita domínios configurados, sem diferenciar maiúsculas e com espaços", () => {
    expect(emailPermitido("thiago.vargas@unifeob.pro.br", dominios)).toBe(true);
    expect(emailPermitido("  Aluno.Silva@SOU.UNIFEOB.EDU.BR ", dominios)).toBe(true);
  });
  it("recusa outros domínios e imitações", () => {
    expect(emailPermitido("aluno@gmail.com", dominios)).toBe(false);
    expect(emailPermitido("x@unifeob.pro.br.golpe.com", dominios)).toBe(false);
    expect(emailPermitido("x@golpeunifeob.pro.br", dominios)).toBe(false);
    expect(emailPermitido("x@outro.unifeob.pro.br", dominios)).toBe(false);
    expect(emailPermitido("sem-arroba", dominios)).toBe(false);
    expect(emailPermitido("a@b@unifeob.pro.br", dominios)).toBe(false);
  });
  it("sem configuração, ninguém entra", () => {
    expect(emailPermitido("thiago.vargas@unifeob.pro.br", lerDominios(undefined))).toBe(false);
  });
  it("identifica professor pela lista", () => {
    expect(ehProfessor("Thiago.Vargas@unifeob.pro.br", ["thiago.vargas@unifeob.pro.br"])).toBe(true);
    expect(ehProfessor("aluno@sou.unifeob.edu.br", ["thiago.vargas@unifeob.pro.br"])).toBe(false);
  });
});
