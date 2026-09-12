export const motionEase = [0.22, 1, 0.36, 1] as const;

/**
 * Reveal de bloco: lento o bastante pra ser percebido (pedido do dono, ver
 * prints/repaginacao.md) e disparado quando a seção já está bem dentro do
 * viewport, pra não animar coisa que o usuário ainda não vê.
 */
export const scrollRevealDefaults = {
  y: 40,
  duration: 1.1,
  viewportMargin: "-96px",
  stagger: 0.15,
} as const;
