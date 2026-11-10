import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/servidor";
import { banco, codigoDoCaso } from "@/lib/dados";
import EditorCaso from "@/components/admin/EditorCaso";

export default async function EditarCaso({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await supabaseAdmin().from("ves_casos").select("conteudo").eq("id", id).maybeSingle();
  if (!data) notFound();
  const b = await banco();
  const jogavel = b.buscarCaso(id); // só casos completos podem ser jogados na prévia
  return (
    <div className="space-y-3">
      <Link href="/admin/casos" className="text-sm text-vinho underline">Todos os casos</Link>
      <EditorCaso
        key={JSON.stringify(data.conteudo).length + id}
        inicial={data.conteudo as Record<string, unknown>}
        novo={false}
        diagnosticos={b.diagnosticos}
        linkPrevia={jogavel ? `/jogar/${codigoDoCaso(jogavel)}?modo=previa` : undefined}
      />
    </div>
  );
}
