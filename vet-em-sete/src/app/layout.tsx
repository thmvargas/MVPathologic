import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Inter, Lora } from "next/font/google";
import { LayoutDashboard, LogIn, LogOut, Trophy, UserRound } from "lucide-react";
import { obterSessao } from "@/lib/sessao";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const lora = Lora({ subsets: ["latin"], weight: ["600"], variable: "--font-lora", display: "swap" });

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

export const viewport: Viewport = { themeColor: "#f5efe6", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const sessao = await obterSessao().catch(() => ({ estado: "anonimo" as const }));
  return (
    <html lang="pt-BR" className={`${inter.variable} ${lora.variable}`}>
      <body className="min-h-dvh">
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-areia focus:px-3 focus:py-2">
          Pular para o conteúdo
        </a>
        <header className="border-b border-marfim">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-titulo text-xl font-semibold text-vinho">
              Vet em Sete
            </Link>
            {sessao.estado === "ok" ? (
              <nav className="flex items-center gap-1 text-sm">
                {sessao.perfil.papel === "professor" && (
                  <Link href="/professor" aria-label="Painel do professor" className="inline-flex min-h-11 min-w-11 items-center justify-center text-vinho">
                    <LayoutDashboard aria-hidden size={18} strokeWidth={1.5} />
                  </Link>
                )}
                <Link href="/ranking" aria-label="Ranking" className="inline-flex min-h-11 min-w-11 items-center justify-center text-vinho">
                  <Trophy aria-hidden size={18} strokeWidth={1.5} />
                </Link>
                <Link href="/eu" className="inline-flex min-h-11 items-center gap-1.5 px-2 text-vinho">
                  <UserRound aria-hidden size={18} strokeWidth={1.5} />
                  <span className="max-w-32 truncate">{sessao.perfil.apelido}</span>
                </Link>
                <form action="/sair" method="post">
                  <button type="submit" aria-label="Sair" className="inline-flex min-h-11 items-center px-2 text-suave">
                    <LogOut aria-hidden size={18} strokeWidth={1.5} />
                  </button>
                </form>
              </nav>
            ) : sessao.estado === "anonimo" || sessao.estado === "dominio_recusado" ? (
              <Link href="/entrar" className="inline-flex min-h-11 items-center gap-1.5 px-2 text-sm text-vinho">
                <LogIn aria-hidden size={18} strokeWidth={1.5} />
                Entrar
              </Link>
            ) : null}
          </div>
        </header>
        <main id="conteudo" className="mx-auto max-w-2xl px-4 pb-16 pt-4">
          {children}
        </main>
        <footer className="border-t border-marfim">
          <p className="mx-auto max-w-2xl px-4 py-4 text-xs text-suave">
            Conteúdo didático para graduação em Medicina Veterinária. Não substitui avaliação clínica.{" "}
            <Link href="/privacidade" className="underline">Privacidade</Link>
          </p>
        </footer>
      </body>
    </html>
  );
}
