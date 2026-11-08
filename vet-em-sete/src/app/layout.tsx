import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Inter, Lora } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const lora = Lora({ subsets: ["latin"], weight: ["600"], variable: "--font-lora", display: "swap" });

export const metadata: Metadata = {
  title: "Vet em Sete",
  description: "Jogo diário de raciocínio diagnóstico em medicina veterinária: sete tentativas para chegar ao diagnóstico.",
};

export const viewport: Viewport = { themeColor: "#f5efe6", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
          </div>
        </header>
        <main id="conteudo" className="mx-auto max-w-2xl px-4 pb-16 pt-4">
          {children}
        </main>
        <footer className="border-t border-marfim">
          <p className="mx-auto max-w-2xl px-4 py-4 text-xs text-suave">
            Conteúdo didático para graduação em Medicina Veterinária. Não substitui avaliação clínica.
          </p>
        </footer>
      </body>
    </html>
  );
}
