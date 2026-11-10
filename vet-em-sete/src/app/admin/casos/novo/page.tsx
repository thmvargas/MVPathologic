import Link from "next/link";
import { banco } from "@/lib/dados";
import EditorCaso, { casoVazio } from "@/components/admin/EditorCaso";
import { exigirProfessor } from "@/lib/admin";

export default async function NovoCaso() {
  const prof = await exigirProfessor();
  const b = await banco();
  return (
    <div className="space-y-3">
      <Link href="/admin/casos" className="text-sm text-vinho underline">Todos os casos</Link>
      <EditorCaso inicial={{ ...casoVazio(), revisao: { autor: prof.nome } }} novo diagnosticos={b.diagnosticos} />
    </div>
  );
}
