"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BedDouble,
  Bus,
  CarFront,
  Coffee,
  ConciergeBell,
  ExternalLink,
  MapPinned,
  Plane,
  Ship,
  ShieldCheck,
  Ticket,
  UserRound,
  Utensils,
  type LucideIcon,
} from "lucide-react";

import { BlogArticleContent } from "@/components/blog/blog-article-content";
import { ItineraryBanner } from "@/components/itineraries/itinerary-banner";
import { ItineraryGallery } from "@/components/itineraries/itinerary-gallery";
import { ItineraryQuoteForm } from "@/components/itineraries/itinerary-quote-form";
import { ItineraryQuotePopup } from "@/components/itineraries/itinerary-quote-popup";
import { Container } from "@/components/layout/container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { isRichTextEmpty } from "@/lib/blog/content";
import { formatItineraryDays } from "@/lib/itinerary/day-format";
import { toGoogleMapsEmbedUrl, toYouTubeEmbedUrl } from "@/lib/itinerary/embeds";
import { INCLUDED_ITEM_OPTIONS } from "@/lib/itinerary/included-items";
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
  includedItems: string[];
  videoUrl?: string | null;
  mapUrl?: string | null;
  hotels: ItineraryHotel[];
} & Partial<Record<ItineraryTabKey, string | null | undefined>>;

type ItineraryDetailProps = {
  itinerary: ItineraryDetailData;
  /** No admin: sem link externo funcionando. */
  preview?: boolean;
};

export const ITINERARY_DISCLAIMER =
  "* Valores sujeitos a alteração sem aviso prévio. Pacotes sujeitos a disponibilidade e a alterações. Fotos meramente ilustrativas.";

const includedIcons: Record<(typeof INCLUDED_ITEM_OPTIONS)[number]["icon"], LucideIcon> = {
  plane: Plane,
  bus: Bus,
  "bed-double": BedDouble,
  "car-front": CarFront,
  coffee: Coffee,
  utensils: Utensils,
  "concierge-bell": ConciergeBell,
  "user-round": UserRound,
  "map-pinned": MapPinned,
  ticket: Ticket,
  "shield-check": ShieldCheck,
  ship: Ship,
};

const tabContentClassName =
  "text-base leading-7 [&_p]:mt-3 [&_ul]:mt-3 [&_ol]:mt-3 [&_h2]:mt-6 [&_h3]:mt-5 [&>*:first-child]:mt-0";

function hasText(value: string | null | undefined): value is string {
  return Boolean(value) && !isRichTextEmpty(value as string);
}

/** Título de seção com linha dos dois lados (referência do orçamento infotravel). */
function SectionRule({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="flex items-center gap-4 font-heading text-xl font-bold tracking-tight text-foreground before:h-px before:flex-1 before:bg-border/70 after:h-px after:flex-1 after:bg-border/70 sm:text-2xl"
    >
      <span className="shrink-0 text-center">{children}</span>
    </h2>
  );
}

export function ItineraryDetail({ itinerary, preview = false }: ItineraryDetailProps) {
  const tabs = itineraryTabs.filter(([key]) => hasText(itinerary[key]));
  const hotels = itinerary.hotels.filter((hotel) => hotel.name.trim());
  const included = INCLUDED_ITEM_OPTIONS.filter((item) => itinerary.includedItems.includes(item.key));
  const videoEmbed = toYouTubeEmbedUrl(itinerary.videoUrl);
  const mapEmbed = toGoogleMapsEmbedUrl(itinerary.mapUrl);
  const [firstTab] = tabs;

  const hotelOptions = hotels.map((hotel) => hotel.name);

  return (
    <>
      <ItineraryBanner title={itinerary.title || "Título do roteiro"} image={itinerary.coverImage} priority={!preview} centered>
        <p>
          <span>
            Duração: <strong className="font-semibold text-white">{itinerary.duration || "—"}</strong>
          </span>
          <span aria-hidden className="mx-2 text-white/40">
            ·
          </span>
          <span>
            A partir de:{" "}
            <strong className="font-semibold text-brand-cyan">{itinerary.priceFrom?.trim() || "Consulte*"}</strong>
          </span>
        </p>
      </ItineraryBanner>

      <Container className="pt-6 sm:pt-8">
        {!preview ? (
          <Link
            href="/roteiros"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Todos os roteiros
          </Link>
        ) : null}
      </Container>

      {/* As duas colunas começam na mesma linha: foto à esquerda, reserva à direita. */}
      <Container className="grid gap-8 pb-8 pt-5 sm:pb-10 sm:pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,23rem)] lg:gap-10">
        <div className="min-w-0 space-y-8 sm:space-y-10">

      <ItineraryGallery title={itinerary.title} cover={itinerary.coverImage} gallery={itinerary.gallery} />

      {itinerary.description.trim() ? (
        <p className="whitespace-pre-line text-base leading-relaxed text-muted-foreground sm:text-lg">
          {itinerary.description}
        </p>
      ) : null}

      {included.length > 0 ? (
        <section aria-labelledby="roteiro-inclui" className="space-y-5">
          <SectionRule id="roteiro-inclui">O roteiro inclui</SectionRule>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {included.map((item) => {
              const Icon = includedIcons[item.icon];
              return (
                <li
                  key={item.key}
                  className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-3.5 py-3 text-sm font-medium text-foreground"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">
                    <Icon className="size-4.5" strokeWidth={1.75} aria-hidden />
                  </span>
                  {item.label}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {videoEmbed ? (
        <div className="overflow-hidden rounded-2xl bg-brand-navy">
          <iframe
            src={videoEmbed}
            title={`Vídeo: ${itinerary.title}`}
            className="aspect-video w-full"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : null}

      {tabs.length > 0 ? (
        <Accordion
          type="multiple"
          defaultValue={firstTab ? [firstTab[0]] : []}
          className="overflow-hidden rounded-2xl border border-border/70 bg-card"
        >
          {tabs.map(([key, label]) => (
            <AccordionItem key={key} value={key} className="px-5 sm:px-6">
              <AccordionTrigger className="py-4 font-heading text-base font-semibold uppercase tracking-wide text-foreground hover:no-underline sm:text-lg">
                {label}
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <BlogArticleContent
                  html={key === "itinerary" ? formatItineraryDays(itinerary[key] as string) : (itinerary[key] as string)}
                  className={tabContentClassName}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : null}

      {hotels.length > 0 ? (
        <section aria-labelledby="roteiro-hoteis" className="space-y-6">
          <SectionRule id="roteiro-hoteis">Escolha o hotel de sua preferência</SectionRule>
          <div className="space-y-6">
            {hotels.map((hotel, index) => (
              <HotelCard key={`${hotel.name}-${index}`} hotel={hotel} preview={preview} />
            ))}
          </div>
        </section>
      ) : null}

      {mapEmbed ? (
        <section aria-labelledby="roteiro-mapa" className="space-y-5">
          <SectionRule id="roteiro-mapa">Localização</SectionRule>
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-muted/20">
            <iframe
              src={mapEmbed}
              title={`Mapa: ${itinerary.title}`}
              className="aspect-[16/9] w-full sm:aspect-[21/9]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </section>
      ) : null}

      <p className="text-sm text-muted-foreground">{ITINERARY_DISCLAIMER}</p>
        </div>

        {/* Reserva na lateral, perto do topo; no mobile vai pro fim (e o popup cobre quem não rola). */}
        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <ItineraryQuoteForm title={itinerary.title} hotelOptions={hotelOptions} preview={preview} />
        </aside>
      </Container>

      {!preview ? (
        <ItineraryQuotePopup title={itinerary.title} image={itinerary.coverImage} hotelOptions={hotelOptions} />
      ) : null}
    </>
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
  const showImage = Boolean(imageSrc) && !imageFailed;

  return (
    <article className="overflow-hidden rounded-2xl border border-border/70 bg-card">
      <div className={cn("grid gap-0", showImage && "md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]")}>
        {showImage ? (
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
          <h3 className="font-heading text-lg font-bold tracking-tight text-foreground sm:text-xl">{hotel.name}</h3>

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
