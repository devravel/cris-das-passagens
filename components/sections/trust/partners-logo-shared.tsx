import Image from "next/image";

export type PartnerLogoEntry = {
  src: string;
  alt: string;
  size?: "sm";
};

/** Altura dos logos — escala junto nos breakpoints. */
export const partnerLogoBoxClassName =
  "flex h-10 items-center justify-center sm:h-12 md:h-14 lg:h-16 xl:h-18";

/** Espaço igual entre cada logo (horizontal e vertical, se quebrar linha). */
export const partnerLogoGapClassName =
  "gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8";

const partnerLogoImageClassName =
  "h-full w-auto max-w-full object-contain transition-opacity duration-200 hover:opacity-90";

/** 20% menor na imagem; a caixa responsiva permanece igual aos demais. */
const partnerLogoImageSmClassName =
  "h-[80%] max-h-[80%] w-auto max-w-full object-contain transition-opacity duration-200 hover:opacity-90";

export function PartnerLogoImage({ logo }: { logo: PartnerLogoEntry }) {
  return (
    <div className={partnerLogoBoxClassName}>
      <Image
        src={logo.src}
        alt={logo.alt}
        width={200}
        height={80}
        unoptimized
        className={
          logo.size === "sm"
            ? partnerLogoImageSmClassName
            : partnerLogoImageClassName
        }
      />
    </div>
  );
}

export function chunkPartnerLogos<T>(
  items: readonly T[],
  size: number,
): T[][] {
  if (size <= 0 || items.length === 0) {
    return items.length === 0 ? [] : [[...items]];
  }

  const pages: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    pages.push(items.slice(index, index + size));
  }

  return pages;
}
