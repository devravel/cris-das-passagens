"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Minus, Plus } from "lucide-react";

import { CtaButton } from "@/components/ui/cta-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { content } from "@/config/content";
import { getItineraryWhatsAppUrl } from "@/lib/itinerary/whatsapp";
import { cn } from "@/lib/utils";

type ItineraryQuoteFormProps = {
  title: string;
  hotelOptions: string[];
  preview?: boolean;
  /** Dentro do popup: sem a moldura/fundo próprio (o popup já tem). */
  embedded?: boolean;
  /** Ids únicos quando há duas instâncias na página (lateral + popup). */
  idPrefix?: string;
};

const MAX_PEOPLE = 7;
const EXTRAS = content.itineraries.extras;

const fieldClassName =
  "h-11 rounded-xl border-white/20 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-brand-cyan/60";
const labelClassName = "text-sm font-medium text-white/90";

function pillClassName(selected: boolean) {
  return cn(
    "inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors",
    selected
      ? "border-brand-cyan bg-brand-cyan/15 text-white"
      : "border-white/20 text-white/80 hover:border-white/50 hover:text-white",
  );
}

/**
 * "Informações e reservas" da referência. Aqui não manda nada pro servidor:
 * monta a mensagem e abre o WhatsApp (o site não tem formulário de propósito).
 */
export function ItineraryQuoteForm({
  title,
  hotelOptions,
  preview = false,
  embedded = false,
  idPrefix = "roteiro",
}: ItineraryQuoteFormProps) {
  const [hotel, setHotel] = useState("");
  const [origin, setOrigin] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [babies, setBabies] = useState(0);
  const [travelDate, setTravelDate] = useState("");
  const [extras, setExtras] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const href = getItineraryWhatsAppUrl(title, {
    hotel: hotel || undefined,
    origin: origin.trim() || undefined,
    adults,
    children,
    babies,
    travelDate: travelDate.trim() || undefined,
    extras,
    message: message.trim() || undefined,
  });

  function toggleExtra(extra: string) {
    setExtras((list) => (list.includes(extra) ? list.filter((item) => item !== extra) : [...list, extra]));
  }

  return (
    <section
      data-quote-form
      aria-labelledby={`${idPrefix}-reservas`}
      className={cn("text-white", !embedded && "rounded-2xl bg-brand-navy p-5 sm:p-6")}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-cyan">Informações e reservas</p>
      <h2 id={`${idPrefix}-reservas`} className="mt-1.5 font-heading text-xl font-bold uppercase leading-tight tracking-tight sm:text-2xl">
        {title || "Roteiro"}
      </h2>
      <p className="mt-2 text-sm text-white/75">
        Preencha o que já souber e fale com a gente no WhatsApp. A cotação sai por lá, sem cadastro.
      </p>

      <div className="mt-5 grid gap-4">
        {hotelOptions.length > 0 ? (
          <fieldset>
            <legend className={cn("mb-2", labelClassName)}>Hotel / tarifa</legend>
            <div className="flex flex-wrap gap-2">
              {hotelOptions.map((option) => {
                const selected = hotel === option;
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setHotel(selected ? "" : option)}
                    className={pillClassName(selected)}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        <div className="space-y-1.5">
          <label htmlFor={`${idPrefix}-origem`} className={labelClassName}>
            Saída de (cidade/UF)
          </label>
          <Input
            id={`${idPrefix}-origem`}
            value={origin}
            onChange={(event) => setOrigin(event.target.value)}
            placeholder="Ex.: Osório/RS"
            className={fieldClassName}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${idPrefix}-data`} className={labelClassName}>
            Data aproximada da viagem
          </label>
          <Input
            id={`${idPrefix}-data`}
            value={travelDate}
            onChange={(event) => setTravelDate(event.target.value)}
            placeholder="Ex.: julho de 2027"
            className={fieldClassName}
          />
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <Counter idPrefix={idPrefix} label="Adultos" value={adults} min={1} onChange={setAdults} />
          <Counter idPrefix={idPrefix} label="Crianças" value={children} min={0} onChange={setChildren} />
          <Counter idPrefix={idPrefix} label="Bebês" value={babies} min={0} onChange={setBabies} />
        </div>

        {EXTRAS.length > 0 ? (
          <fieldset>
            <legend className={cn("mb-1", labelClassName)}>Quer incluir?</legend>
            <p className="mb-2 text-xs text-white/60">Serviços à parte, cotados junto.</p>
            <div className="flex flex-wrap gap-2">
              {EXTRAS.map((extra) => {
                const selected = extras.includes(extra);
                return (
                  <button
                    key={extra}
                    type="button"
                    role="checkbox"
                    aria-checked={selected}
                    onClick={() => toggleExtra(extra)}
                    className={pillClassName(selected)}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "grid size-4 place-items-center rounded border",
                        selected ? "border-brand-cyan bg-brand-cyan text-brand-navy" : "border-white/40",
                      )}
                    >
                      {selected ? <Check className="size-3" strokeWidth={3} /> : null}
                    </span>
                    {extra}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        <div className="space-y-1.5">
          <label htmlFor={`${idPrefix}-mensagem`} className={labelClassName}>
            Mensagem
          </label>
          <Textarea
            id={`${idPrefix}-mensagem`}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Alguma dúvida ou pedido especial?"
            className={cn(fieldClassName, "h-auto min-h-20")}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {preview ? (
          <CtaButton label="Falar no WhatsApp" type="button" disabled className="w-full" />
        ) : (
          <CtaButton href={href} label="Falar no WhatsApp" trackingSource="itinerary_whatsapp" className="w-full" />
        )}
        <p className="text-xs text-white/60">
          Nada é enviado pelo site: a conversa acontece no WhatsApp.{" "}
          <Link href="/politica-de-privacidade" className="underline underline-offset-4 hover:text-white">
            Política de privacidade
          </Link>
        </p>
      </div>
    </section>
  );
}

function Counter({
  idPrefix,
  label,
  value,
  min,
  onChange,
}: {
  idPrefix: string;
  label: string;
  value: number;
  min: number;
  onChange: (value: number) => void;
}) {
  const id = `${idPrefix}-${label.toLowerCase()}`;
  const buttonClassName =
    "grid size-9 shrink-0 place-items-center rounded-lg border border-white/20 text-white/80 transition-colors hover:border-white/50 hover:text-white disabled:opacity-40 disabled:hover:border-white/20";

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <div className="flex items-center gap-1.5">
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
          className="h-9 w-full min-w-0 rounded-lg border border-white/20 bg-white/10 text-center text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/60 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
