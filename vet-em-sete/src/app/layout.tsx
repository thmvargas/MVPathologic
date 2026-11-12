import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import { LayoutDashboard, LogIn, LogOut, Trophy, UserRound } from "lucide-react";
import { obterSessao } from "@/lib/sessao";
import { MarcaVetEmSete } from "@/components/Marca";
import "./globals.css";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-montserrat", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Vet em Sete",
  description: "Jogo diário de raciocínio diagnóstico em medicina veterinária: sete tentativas para chegar ao diagnóstico.",
  openGraph: {
    title: "Vet em Sete",
    description: "Um caso clínico veterinário por dia. Sete tentativas para o diagnóstico.",
    locale: "pt_BR",
    type: "website",
  },
};

// Todas as páginas dependem de quem está logado: nada é pré-gerado no build.
export const dynamic = "force-dynamic";

export const viewport: Viewport = { themeColor: "#0018ff", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const sessao = await obterSessao().catch(() => ({ estado: "anonimo" as const }));
  return (
    <html lang="pt-BR" className={montserrat.variable}>
      <body className="min-h-dvh">
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-fundo focus:px-3 focus:py-2">
          Pular para o conteúdo
        </a>
        <header className="bg-marca text-white">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-2 px-4 py-2.5">
            <Link href="/" aria-label="Vet em Sete, página inicial" className="inline-flex min-h-11 items-center">
              <MarcaVetEmSete variante="branco" />
            </Link>
            {sessao.estado === "ok" ? (
              <nav className="flex items-center gap-1 text-sm">
                {sessao.perfil.papel === "professor" && (
                  <Link href="/professor" aria-label="Painel do professor" className="inline-flex min-h-11 min-w-11 items-center justify-center text-white">
                    <LayoutDashboard aria-hidden size={18} strokeWidth={1.5} />
                  </Link>
                )}
                <Link href="/ranking" aria-label="Ranking" className="inline-flex min-h-11 min-w-11 items-center justify-center text-white">
                  <Trophy aria-hidden size={18} strokeWidth={1.5} />
                </Link>
                <Link href="/eu" aria-label={`Minhas estatísticas (${sessao.perfil.apelido})`} className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 px-1 text-white">
                  <UserRound aria-hidden size={18} strokeWidth={1.5} />
                  <span className="hidden max-w-32 truncate sm:inline">{sessao.perfil.apelido}</span>
                </Link>
                <form action="/sair" method="post">
                  <button type="submit" aria-label="Sair" className="inline-flex min-h-11 min-w-11 items-center justify-center text-white">
                    <LogOut aria-hidden size={18} strokeWidth={1.5} />
                  </button>
                </form>
              </nav>
            ) : sessao.estado === "anonimo" || sessao.estado === "dominio_recusado" ? (
              <Link href="/entrar" className="inline-flex min-h-11 items-center gap-1.5 px-2 text-sm font-semibold text-white">
                <LogIn aria-hidden size={18} strokeWidth={1.5} />
                Entrar
              </Link>
            ) : null}
          </div>
        </header>
        <main id="conteudo" className="mx-auto max-w-2xl px-4 pb-16 pt-4">
          {children}
        </main>
        <footer className="border-t border-linha bg-superficie">
          <div className="mx-auto max-w-2xl space-y-3 px-4 py-5">
            <MarcaVetEmSete variante="preto" />
            <p className="text-sm font-medium italic text-marca">Lugar de gente que sonha, faz e acontece.</p>
            <p className="text-xs text-suave">
              Conteúdo didático para graduação em Medicina Veterinária. Não substitui avaliação clínica.{" "}
              <Link href="/privacidade" className="underline">Privacidade</Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
