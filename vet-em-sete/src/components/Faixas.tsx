/**
 * Faixas diagonais azul e rosa com o slogan, como na capa do modelo de
 * apresentação UNIFEOB. Puramente decorativas; sem logotipo por cima
 * (o manual proíbe aplicar o logo sobre grafismos).
 */
const SLOGAN = "Lugar de gente que sonha, faz e acontece";

export function Faixas() {
  const texto = Array(4).fill(SLOGAN).join("  •  ");
  return (
    <div aria-hidden className="relative -mx-4 h-20 overflow-hidden sm:mx-0 sm:rounded-lg">
      <div className="absolute -left-8 -right-8 top-6 h-7 rotate-[3deg] bg-destaque" />
      <div className="absolute -left-8 -right-8 top-7 flex h-8 -rotate-[2deg] items-center overflow-hidden whitespace-nowrap bg-marca text-sm font-semibold italic text-white">
        <span className="pl-6">{texto}</span>
      </div>
    </div>
  );
}
