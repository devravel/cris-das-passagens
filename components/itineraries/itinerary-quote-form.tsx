"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";

import { CtaButton } from "@/components/ui/cta-button";
import { Input } from "@/components/ui/input";
import { getItineraryWhatsAppUrl } from "@/lib/itinerary/whatsapp";
import { cn } from "@/lib/utils";

type ItineraryQuoteFormProps = {
  title: string;
  hotelOptions: string[];
  preview?: boolean;
};

const MAX_PEOPLE = 7;

/**
 * "Informações e reservas" da referência. Aqui não manda nada pro servidor:
 * monta a mensagem e abre o WhatsApp (o site não tem formulário de propósito).
 */
export function ItineraryQuoteForm({ title, hotelOptions, preview = false }: ItineraryQuoteFormProps) {
  const [hotel, setHotel] = useState<string>("");
  const [origin, setOrigin] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [babies, setBabies] = useState(0);

  const href = getItineraryWhatsAppUrl(title, {
    hotel: hotel || undefined,
    origin: origin.trim() || undefined,
    adults,
    children,
    babies,
  });

  return (
    <section
      aria-labelledby="roteiro-reservas"
      className="rounded-2xl bg-brand-navy p-6 text-white sm:p-8"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-cyan">
        Informações e reservas
      </p>
      <h2 id="roteiro-reservas" className="mt-2 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
        {title || "Roteiro"}
      </h2>
      <p className="mt-2 max-w-prose text-sm text-white/75 sm:text-base">
        Preencha o que já souber e fale com a gente no WhatsApp. A cotação sai por lá, sem cadastro.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {hotelOptions.length > 0 ? (
          <fieldset className="sm:col-span-2">
            <legend className="mb-2 text-sm font-medium text-white/90">Hotel / tarifa</legend>
            <div className="flex flex-wrap gap-2">
              {hotelOptions.map((option) => {
                const selected = hotel === option;
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setHotel(selected ? "" : option)}
                    className={cn(
                      "rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors",
                      selected
                        ? "border-brand-cyan bg-brand-cyan/15 text-white"
                        : "border-white/20 text-white/80 hover:border-white/50 hover:text-white",
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="roteiro-origem" className="text-sm font-medium text-white/90">
            Saída de (cidade/UF)
          </label>
          <Input
            id="roteiro-origem"
            value={origin}
            onChange={(event) => setOrigin(event.target.value)}
            placeholder="Ex.: Osório/RS"
            className="h-11 rounded-xl border-white/20 bg-white/10 text-white placeholder:text-white/40"
          />
        </div>

        <Counter label="Adultos" value={adults} min={1} onChange={setAdults} />
        <Counter label="Crianças" value={children} min={0} onChange={setChildren} />
        <Counter label="Bebês" value={babies} min={0} onChange={setBabies} />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-white/60">
          Nada é enviado pelo site: a conversa acontece no WhatsApp.{" "}
          <Link href="/politica-de-privacidade" className="underline underline-offset-4 hover:text-white">
            Política de privacidade
          </Link>
        </p>
        {preview ? (
          <CtaButton label="Falar no WhatsApp" type="button" disabled />
        ) : (
          <CtaButton
            href={href}
            label="Falar no WhatsApp"
            trackingSource="itinerary_whatsapp"
          />
        )}
      </div>
    </section>
  );
}

function Counter({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  onChange: (value: number) => void;
}) {
  const id = `roteiro-${label.toLowerCase()}`;
  const buttonClassName =
    "grid size-9 place-items-center rounded-lg border border-white/20 text-white/80 transition-colors hover:border-white/50 hover:text-white disabled:opacity-40 disabled:hover:border-white/20";

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-white/90">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`Menos ${label.toLowerCase()}`}
          className={buttonClassName}
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
        >
          <Minus className="size-4" aria-hidden />
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={MAX_PEOPLE}
          value={value}
          onChange={(event) => {
            const next = Number.parseInt(event.target.value, 10);
            if (Number.isNaN(next)) return;
            onChange(Math.min(MAX_PEOPLE, Math.max(min, next)));
          }}
          className="h-9 w-14 rounded-lg border border-white/20 bg-white/10 text-center text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/60 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          aria-label={`Mais ${label.toLowerCase()}`}
          className={buttonClassName}
          onClick={() => onChange(Math.min(MAX_PEOPLE, value + 1))}
          disabled={value >= MAX_PEOPLE}
        >
          <Plus className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
