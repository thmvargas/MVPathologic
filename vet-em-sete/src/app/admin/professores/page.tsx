import { supabaseAdmin } from "@/lib/supabase/servidor";
import { config } from "@/lib/config";
import FormProfessor from "@/components/admin/FormProfessor";
import { BotaoAcao } from "@/components/admin/BotaoAcao";
import { removerProfessor } from "../acoes";

export default async function Professores() {
  const fixos = config.professores();
  const { data, error } = await supabaseAdmin().from("ves_professores").select("email,adicionado_por,criado_em").order("criado_em");
  return (
    <div className="space-y-4">
      <h1 className="text-2xl text-vinho">Professores</h1>
      <p className="text-sm text-suave">
        Quem estiver nesta lista entra como professor: vê o painel, edita casos e não aparece no ranking. O convidado
        entra pelo endereço do jogo com o próprio e-mail; não é enviado convite automático.
      </p>
      {error ? (
        <p className="text-sm text-carmim">Rode a migração 002 no Supabase para convidar professores.</p>
      ) : (
        <FormProfessor />
      )}
      <ul className="space-y-2">
        {fixos.map((e) => (
          <li key={e} className="rounded-md border border-marfim p-3 text-sm">
            {e} <span className="text-xs text-suave">· fixo na configuração</span>
          </li>
        ))}
        {(data ?? []).filter((p) => !fixos.includes(p.email)).map((p) => (
          <li key={p.email} className="flex flex-wrap items-center gap-2 rounded-md border border-marfim p-3 text-sm">
            <span className="flex-1">
              {p.email}
              <span className="block text-xs text-suave">convidado por {p.adicionado_por}</span>
            </span>
            <BotaoAcao acao={removerProfessor.bind(null, p.email)} rotulo="Remover" variante="perigo" confirmar={`Remover ${p.email}?`} />
          </li>
        ))}
      </ul>
    </div>
  );
}
