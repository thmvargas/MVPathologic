/**
 * Logo + assinatura (Brandbook UNIFEOB, p. 6): logotipo, ponto na cor da
 * escola (Escola Agro, verde) e o nome da área, com altura de no máximo a do
 * logotipo. O logotipo é a imagem oficial, sem alterações de forma.
 */
export function MarcaVetEmSete({ variante = "branco" }: { variante?: "branco" | "preto" }) {
  const cor = variante === "branco" ? "text-white" : "text-texto";
  return (
    <span className={`inline-flex items-center gap-1.5 ${cor}`}>
      <img
        src={`/marca/unifeob-${variante}.png`}
        alt="unifeob"
        width={888}
        height={226}
        className="h-6 w-auto sm:h-7"
      />
      <span aria-hidden className="mt-3 inline-block size-2 shrink-0 rounded-full bg-sucesso sm:size-2.5" />
      <span className="font-sans text-base leading-none font-normal sm:text-lg">Vet em Sete</span>
    </span>
  );
}
