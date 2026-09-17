"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

import { BlogArticleContent } from "@/components/blog/blog-article-content";
import { ItineraryGallery } from "@/components/itineraries/itinerary-gallery";
import { ItineraryQuoteForm } from "@/components/itineraries/itinerary-quote-form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { isRichTextEmpty } from "@/lib/blog/content";
import {
  hotelPriceLabels,
  itineraryTabs,
  type HotelPriceKey,
  type ItineraryHotel,
  type ItineraryTabKey,
} from "@/lib/itinerary/schemas";
import { resolvePublicImageSrc } from "@/lib/storage/image-src";
import { cn } from "@/lib/utils";

/** Só o que a página precisa. Serve tanto pro banco quanto pro preview do admin. */
export type ItineraryDetailData = {
  title: string;
  duration: string;
  priceFrom?: string | null;
  coverImage: string;
  gallery: string[];
  description: string;
  hotels: ItineraryHotel[];
} & Partial<Record<ItineraryTabKey, string | null | undefined>>;

type ItineraryDetailProps = {
  itinerary: ItineraryDetailData;
  /** No admin: sem link externo funcionando. */
  preview?: boolean;
};

export const ITINERARY_DISCLAIMER =
  "* Valores sujeitos a alteração sem aviso prévio. Pacotes sujeitos a disponibilidade e a alterações. Fotos meramente ilustrativas.";

const sectionTitleClassName =
  "font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl";

function hasText(value: string | null | undefined): value is string {
  return Boolean(value) && !isRichTextEmpty(value as string);
}

export function ItineraryDetail({ itinerary, preview = false }: ItineraryDetailProps) {
  const tabs = itineraryTabs.filter(([key]) => hasText(itinerary[key]));
  const hotels = itinerary.hotels.filter((hotel) => hotel.name.trim());
  const [firstTab] = tabs;

  return (
    <div className="space-y-10 sm:space-y-12">
      <header className="space-y-3">
        <h1 className="text-balance font-heading text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
          {itinerary.title || "Título do roteiro"}
        </h1>
        <p className="text-base text-muted-foreground sm:text-lg">
          <span>
            Duração: <strong className="font-semibold text-foreground">{itinerary.duration || "—"}</strong>
          </span>
          <span aria-hidden className="mx-2 text-border">
            ·
          </span>
          <span>
            A partir de:{" "}
            <strong className="font-semibold text-brand">
              {itinerary.priceFrom?.trim() || "Consulte*"}
            </strong>
          </span>
        </p>
      </header>

      <ItineraryGallery
        title={itinerary.title}
        cover={itinerary.coverImage}
        gallery={itinerary.gallery}
      />

      {itinerary.description.trim() ? (
        <p className="whitespace-pre-line text-base leading-relaxed text-muted-foreground sm:text-lg">
          {itinerary.description}
        </p>
      ) : null}

      {tabs.length > 0 ? (
        <Accordion
          type="multiple"
          defaultValue={firstTab ? [firstTab[0]] : []}
          className="overflow-hidden rounded-2xl border border-border/70 bg-card"
        >
          {tabs.map(([key, label]) => (
            <AccordionItem key={key} value={key} className="px-5 sm:px-6">
              <AccordionTrigger className="py-4 font-heading text-base font-semibold text-foreground hover:no-underline sm:text-lg">
                {label}
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <BlogArticleContent
                  html={itinerary[key] as string}
                  className="text-base leading-7 [&_p]:mt-3 [&_ul]:mt-3 [&_ol]:mt-3 [&_h2]:mt-6 [&_h3]:mt-5 [&>*:first-child]:mt-0"
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : null}

      {hotels.length > 0 ? (
        <section aria-labelledby="roteiro-hoteis" className="space-y-6">
          <h2 id="roteiro-hoteis" className={sectionTitleClassName}>
            Escolha o hotel de sua preferência
          </h2>
          <div className="space-y-6">
            {hotels.map((hotel, index) => (
              <HotelCard key={`${hotel.name}-${index}`} hotel={hotel} preview={preview} />
            ))}
          </div>
        </section>
      ) : null}

      <p className="text-sm text-muted-foreground">{ITINERARY_DISCLAIMER}</p>

      <ItineraryQuoteForm
        title={itinerary.title}
        hotelOptions={hotels.map((hotel) => hotel.name)}
        preview={preview}
      />
    </div>
  );
}

function HotelCard({ hotel, preview }: { hotel: ItineraryHotel; preview: boolean }) {
  const [imageFailed, setImageFailed] = useState(false);
  const details = [
    ["Tipo", hotel.type],
    ["Acomodação", hotel.accommodation],
    ["Diárias com", hotel.board],
  ].filter((row): row is [string, string] => Boolean(row[1]?.trim()));
  const prices = (Object.keys(hotelPriceLabels) as HotelPriceKey[])
    .map((key): [string, string | undefined] => [hotelPriceLabels[key], hotel.prices?.[key]?.trim()])
    .filter((row): row is [string, string] => Boolean(row[1]));
  const imageSrc = hotel.image?.trim() ? resolvePublicImageSrc(hotel.image) : "";

  return (
    <article className="overflow-hidden rounded-2xl border border-border/70 bg-card">
      <div className={cn("grid gap-0", imageSrc && !imageFailed ? "md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]" : "")}>
        {imageSrc && !imageFailed ? (
          <div className="relative aspect-[4/3] w-full bg-muted/30 md:aspect-auto md:min-h-64">
            <Image
              src={imageSrc}
              alt={hotel.name}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover"
              onError={() => setImageFailed(true)}
            />
          </div>
        ) : null}

        <div className="space-y-4 p-5 sm:p-6">
          <h3 className="font-heading text-lg font-bold tracking-tight text-foreground sm:text-xl">
            {hotel.name}
          </h3>

          {details.length > 0 || hotel.website?.trim() ? (
            <dl className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
              {details.map(([label, value]) => (
                <div key={label} className="flex gap-2">
                  <dt className="shrink-0 font-medium text-muted-foreground">{label}:</dt>
                  <dd className="text-foreground">{value}</dd>
                </div>
              ))}
              {hotel.website?.trim() ? (
                <div className="flex gap-2">
                  <dt className="shrink-0 font-medium text-muted-foreground">Site:</dt>
                  <dd className="min-w-0 truncate">
                    <a
                      href={preview ? undefined : hotel.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-brand underline-offset-4 hover:underline"
                    >
                      {hotel.website.replace(/^https?:\/\//, "")}
                      <ExternalLink className="size-3.5" aria-hidden />
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : null}

          {prices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Valores por pessoa</caption>
                <thead>
                  <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Acomodação</th>
                    <th className="py-2 font-medium">Valor por pessoa</th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map(([label, value]) => (
                    <tr key={label} className="border-b border-border/40 last:border-b-0">
                      <td className="py-2 pr-4 text-muted-foreground">{label}</td>
                      <td className="py-2 font-semibold text-foreground">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {hasText(hotel.description) ? (
            <BlogArticleContent
              html={hotel.description as string}
              className="text-sm leading-6 text-muted-foreground [&_p]:mt-2 [&_ul]:mt-2 [&>*:first-child]:mt-0"
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}
