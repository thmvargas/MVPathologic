import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <div className="space-y-3 pt-6">
      <h1 className="text-2xl text-vinho">Página não encontrada</h1>
      <p>O endereço pode estar errado ou o caso não está mais disponível.</p>
      <Link href="/" className="inline-flex min-h-11 items-center rounded-md bg-vinho px-4 font-medium text-areia">
        Voltar ao início
      </Link>
    </div>
  );
}
