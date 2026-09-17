"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";

import { ItineraryBanner } from "@/components/itineraries/itinerary-banner";
import { ItineraryCardRow } from "@/components/itineraries/itinerary-card-row";
import type { ItineraryCardData } from "@/components/itineraries/itinerary-card";
import { Container } from "@/components/layout/container";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { cn } from "@/lib/utils";

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  itineraries: ItineraryCardData[];
};

type ItineraryCatalogProps = {
  categories: CatalogCategory[];
  bannerImage: string;
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/** Banner + busca + divisórias. Filtro é só no navegador, em cima do que a página já trouxe. */
export function ItineraryCatalog({ categories, bannerImage }: ItineraryCatalogProps) {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const filtered = useMemo(() => {
    const needle = normalize(query);
    return categories
      .filter((category) => !categoryId || category.id === categoryId)
      .map((category) => ({
        ...category,
        itineraries: needle
          ? category.itineraries.filter((itinerary) => normalize(itinerary.title).includes(needle))
          : category.itineraries,
      }))
      .filter((category) => category.itineraries.length > 0);
  }, [categories, query, categoryId]);

  const hasOverlap = filtered.length > 0;

  return (
    <>
      <ItineraryBanner
        title="Todos os roteiros"
        image={bannerImage}
        priority
        centered
        className={cn("min-h-80 sm:min-h-[26rem] lg:min-h-[32rem]", hasOverlap && "pb-24 sm:pb-32")}
      >
        <div className="mt-5 flex w-full flex-col gap-2 bg-white p-2 shadow-[0_18px_50px_-20px_rgba(10,24,56,0.6)] sm:flex-row sm:gap-0 sm:p-2.5">
          <label className="relative flex min-w-0 flex-1 items-center">
            <Search className="pointer-events-none absolute left-3.5 size-4.5 text-muted-foreground" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Encontre seu destino"
              aria-label="Encontre seu destino"
              className="h-11 w-full bg-transparent pl-11 pr-3 text-base text-foreground outline-none placeholder:text-muted-foreground/70 focus:placeholder:text-transparent [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Limpar busca"
                className="absolute right-2 grid size-7 place-items-center text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" aria-hidden />
              </button>
            ) : null}
          </label>
          <CategorySelect
            categories={categories}
            value={categoryId}
            onChange={setCategoryId}
            className="sm:ml-2 sm:border-l sm:border-border/70 sm:pl-2"
          />
        </div>
      </ItineraryBanner>

      <Container className={cn("pb-8 sm:pb-10", hasOverlap ? "relative z-10 -mt-20 sm:-mt-28" : "pt-8 sm:pt-10")}>
        {filtered.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-md border border-dashed border-border/70 p-8 text-center text-muted-foreground">
            Nenhum roteiro encontrado{query ? ` para "${query}"` : ""}.
          </div>
        ) : (
          <div className="space-y-10 sm:space-y-12">
            {filtered.map((category, categoryIndex) => (
              <section key={category.id} id={category.slug} aria-labelledby={`categoria-${category.slug}`}>
                <ScrollReveal>
                  <h2
                    id={`categoria-${category.slug}`}
                    className={cn(
                      "mb-4 font-heading text-2xl font-bold uppercase tracking-tight sm:text-[1.65rem]",
                      // A primeira divisória fica em cima da foto do banner.
                      categoryIndex === 0 ? "text-white drop-shadow" : "text-foreground",
                    )}
                  >
                    {category.name}
                  </h2>
                </ScrollReveal>
                <ItineraryCardRow itineraries={category.itineraries} priorityCount={categoryIndex === 0 ? 4 : 0} />
              </section>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}

/** Select estilizado (regra do workspace: nunca <select> nativo). Botão + listbox, fecha em Esc e clique fora. */
function CategorySelect({
  categories,
  value,
  onChange,
  className,
}: {
  categories: CatalogCategory[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listId = useId();
  const selected = categories.find((category) => category.id === value);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const options = [{ id: "", name: "Todas as categorias" }, ...categories];

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((state) => !state)}
        className="flex h-11 w-full items-center justify-between gap-3 px-3.5 text-xs font-bold uppercase tracking-[0.12em] text-foreground outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/60 sm:w-44"
      >
        <span className="truncate">{selected ? selected.name : "Categoria"}</span>
        <ChevronDown className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")} aria-hidden />
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Categoria"
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 max-h-72 overflow-y-auto bg-white py-1 text-sm text-foreground shadow-[0_18px_50px_-20px_rgba(10,24,56,0.6)] ring-1 ring-border/70"
        >
          {options.map((option) => {
            const isSelected = option.id === value;
            return (
              <li key={option.id || "all"} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left transition-colors hover:bg-muted/60",
                    isSelected && "font-semibold text-brand",
                  )}
                >
                  {option.name}
                  {isSelected ? <Check className="size-4" aria-hidden /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
