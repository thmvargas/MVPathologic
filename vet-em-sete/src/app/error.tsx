"use client";

import Link from "next/link";

export default function Erro({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="space-y-3 pt-6">
      <h1 className="text-2xl text-marca">Algo deu errado</h1>
      <p>Não foi possível carregar esta página agora. Tente de novo em instantes.</p>
      <div className="flex flex-wrap gap-2">
        <button onClick={reset} className="inline-flex min-h-11 items-center rounded-md bg-marca px-4 font-medium text-fundo">
          Tentar de novo
        </button>
        <Link href="/" className="inline-flex min-h-11 items-center rounded-md border border-marca px-4 font-medium text-marca">
          Início
        </Link>
      </div>
    </div>
  );
}
