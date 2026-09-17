/**
 * Aba "Roteiro": parágrafo que começa com "1º Dia: ...", "3º ao 7º Dia: ..." ou
 * "Dia 2: ..." vira um bloco com o marcador em destaque. O Cristian continua
 * digitando texto normal no tiptap; só o visual muda.
 */
const DAY_MARKER = /^(\d+\s*[ºo°]?(?:\s*ao?\s*\d+\s*[ºo°]?)?\s*dia|dia\s*\d+(?:\s*(?:ao?|-|–)\s*\d+)?)\s*[:\-–]?\s*/i;
const INLINE_EMPHASIS = /<\/?(?:strong|b|em)>/gi;

function splitDayParagraph(inner: string) {
  // Bloco de dia já tem o marcador em destaque; o negrito do editor sai.
  const text = inner.replace(INLINE_EMPHASIS, "").trim();
  const match = text.match(DAY_MARKER);
  if (!match) return null;

  const marker = match[1].replace(/\s+/g, " ").trim();
  const remainder = text.slice(match[0].length).trim();

  // "São Paulo/Porto Seguro: Apresentação no aeroporto..." → título + corpo
  const colon = remainder.indexOf(":");
  if (colon > 0 && colon <= 90) {
    return { marker, title: remainder.slice(0, colon).trim(), body: remainder.slice(colon + 1).trim() };
  }

  // Linha curta sem pontuação de frase = só o título (corpo vem no próximo parágrafo)
  if (remainder.length <= 90 && !/[.!?]/.test(remainder)) {
    return { marker, title: remainder, body: "" };
  }

  return { marker, title: "", body: remainder };
}

export function formatItineraryDays(html: string): string {
  if (!/dia/i.test(html)) return html;

  return html.replace(/<p>([\s\S]*?)<\/p>/gi, (paragraph, inner: string) => {
    const day = splitDayParagraph(inner);
    if (!day) return paragraph;

    return (
      `<div class="itn-day"><span class="itn-day__badge">${day.marker}</span>` +
      `<div class="itn-day__body">` +
      (day.title ? `<strong class="itn-day__title">${day.title}</strong>` : "") +
      (day.body ? `<p>${day.body}</p>` : "") +
      `</div></div>`
    );
  });
}

// ponytail: checagem mínima — `node --experimental-strip-types lib/itinerary/day-format.ts`
if (typeof process !== "undefined" && process.argv[1]?.endsWith("day-format.ts")) {
  const out = formatItineraryDays(
    "<p><strong>1º Dia: São Paulo/Porto Seguro:</strong> Apresentação no aeroporto. Embarque.</p>" +
      "<p>3º ao 7º Dia: Arraial d'Ajuda: Café da manhã no hotel. Dias livres.</p>" +
      "<p>Dia 2: Aparecida - Guaratinguetá - Aparecida</p><p>Após café, visita guiada.</p>" +
      "<p>Texto que não é dia nenhum.</p>",
  );
  console.assert(out.includes('itn-day__badge">1º Dia<'), "marcador 1º Dia");
  console.assert(out.includes('itn-day__title">São Paulo/Porto Seguro<'), "título com dois pontos");
  console.assert(out.includes("<p>Apresentação no aeroporto. Embarque.</p>"), "corpo");
  console.assert(out.includes('itn-day__badge">3º ao 7º Dia<'), "intervalo de dias");
  console.assert(out.includes('itn-day__badge">Dia 2<') && out.includes("Aparecida - Guaratinguetá - Aparecida</strong>"), "girotrip");
  console.assert(out.includes("<p>Texto que não é dia nenhum.</p>"), "parágrafo comum intacto");
  console.log("ok");
}
