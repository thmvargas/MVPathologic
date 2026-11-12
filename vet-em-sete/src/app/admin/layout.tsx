import Link from "next/link";
import { exigirProfessor } from "@/lib/admin";

export const metadata = { title: "Administração · Vet em Sete" };

const ABAS = [
  ["/admin/casos", "Casos"],
  ["/admin/diagnosticos", "Diagnósticos"],
  ["/admin/agenda", "Agenda"],
  ["/admin/professores", "Professores"],
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await exigirProfessor();
  return (
    <div className="space-y-5 pt-2">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-suave">Administração</p>
        <nav aria-label="Administração" className="mt-2 flex flex-wrap gap-2">
          {ABAS.map(([href, rotulo]) => (
            <Link key={href} href={href} className="inline-flex min-h-11 items-center rounded-full border border-linha px-3 text-sm hover:border-marca">
              {rotulo}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
