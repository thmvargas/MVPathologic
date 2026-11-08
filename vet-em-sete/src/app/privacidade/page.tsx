export const metadata = { title: "Privacidade · Vet em Sete" };

export default function Privacidade() {
  return (
    <article className="space-y-4 pt-2 text-sm leading-relaxed [&_h2]:mt-6 [&_h2]:text-lg [&_ul]:list-disc [&_ul]:pl-5">
      <h1 className="text-2xl text-vinho">Aviso de privacidade</h1>
      <p>
        O Vet em Sete é um jogo didático usado nas disciplinas do curso de Medicina Veterinária. Este aviso explica,
        conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), quais dados coletamos e por quê.
      </p>
      <h2>Quais dados</h2>
      <ul>
        <li>E-mail institucional, usado só para o login.</li>
        <li>Nome, apelido, semestre e turma, informados no cadastro.</li>
        <li>Suas partidas: palpites, exames pedidos, condutas escolhidas, pontuação e horários.</li>
      </ul>
      <h2>Para quê</h2>
      <ul>
        <li>Fazer o jogo funcionar e mostrar suas estatísticas.</li>
        <li>Montar o ranking, que mostra só o apelido.</li>
        <li>Permitir que o professor acompanhe o desempenho da turma e ajuste as aulas.</li>
      </ul>
      <h2>Quem vê</h2>
      <ul>
        <li>Outros alunos veem apenas seu apelido e sua pontuação no ranking.</li>
        <li>Professores da instituição veem nome, e-mail, semestre, turma e partidas.</li>
        <li>Os dados não são vendidos nem compartilhados com terceiros. Ficam armazenados no Supabase (banco de dados) e o site roda na Vercel.</li>
      </ul>
      <h2>Por quanto tempo</h2>
      <p>Enquanto você usar o jogo, ou até pedir a exclusão.</p>
      <h2>Seus direitos</h2>
      <p>
        Você pode corrigir seu cadastro e excluir seus dados do Vet em Sete a qualquer momento na página
        &quot;Minhas estatísticas&quot;. Dúvidas: fale com o professor responsável pela disciplina.
      </p>
      <p className="text-suave">O jogo não substitui avaliação formal e não é usado como nota, salvo se o professor avisar a turma.</p>
    </article>
  );
}
