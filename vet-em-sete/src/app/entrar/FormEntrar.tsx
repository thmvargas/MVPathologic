"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Mail } from "lucide-react";
import { enviarCodigo, verificarCodigo } from "./acoes";

export default function FormEntrar({ dominios, volta }: { dominios: string[]; volta: string }) {
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [etapa, setEtapa] = useState<"email" | "codigo">("email");
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();
  const router = useRouter();

  const botao = "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-marca px-4 font-medium text-fundo disabled:opacity-40";
  const campo = "min-h-12 w-full rounded-md border border-texto/40 bg-fundo px-3 text-base focus:border-marca focus:outline-none";

  if (etapa === "email")
    return (
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          setErro(null);
          iniciar(async () => {
            const r = await enviarCodigo(email);
            if (r.ok) setEtapa("codigo");
            else setErro(r.erro);
          });
        }}
      >
        <label className="block space-y-1">
          <span className="text-sm font-medium">E-mail institucional</span>
          <input
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder={`seu.nome@${dominios[dominios.length - 1] ?? "instituicao.edu.br"}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={campo}
          />
        </label>
        {erro && <p role="alert" className="text-sm text-destaque-escuro">{erro}</p>}
        <button type="submit" disabled={pendente} className={botao}>
          <Mail aria-hidden size={18} strokeWidth={1.5} />
          {pendente ? "Enviando..." : "Receber código por e-mail"}
        </button>
        <p className="text-xs text-suave">Sem senha: você recebe um código de 6 dígitos e um link de acesso.</p>
      </form>
    );

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        setErro(null);
        iniciar(async () => {
          const r = await verificarCodigo(email, codigo);
          if (r.ok) {
            router.replace(volta);
            router.refresh();
          } else setErro(r.erro);
        });
      }}
    >
      <p className="text-sm">
        Enviamos um código para <span className="font-medium">{email}</span>. Digite abaixo, ou toque no link do e-mail.
        Confira também a caixa de spam.
      </p>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Código</span>
        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9 ]*"
          maxLength={12}
          required
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          className={`${campo} text-center text-2xl tracking-[0.4em]`}
        />
      </label>
      {erro && <p role="alert" className="text-sm text-destaque-escuro">{erro}</p>}
      <button type="submit" disabled={pendente} className={botao}>
        <KeyRound aria-hidden size={18} strokeWidth={1.5} />
        {pendente ? "Conferindo..." : "Entrar"}
      </button>
      <button
        type="button"
        onClick={() => {
          setEtapa("email");
          setCodigo("");
          setErro(null);
        }}
        className="min-h-11 w-full text-sm text-marca underline"
      >
        Usar outro e-mail ou pedir novo código
      </button>
    </form>
  );
}
