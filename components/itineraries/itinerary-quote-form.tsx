"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, CheckCircle2, Minus, Plus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { content } from "@/config/content";
import { MAX_PEOPLE, type ItineraryQuoteInput } from "@/lib/itinerary/quote";
import { getItineraryWhatsAppUrl } from "@/lib/itinerary/whatsapp";
import { trackMetaLead } from "@/lib/meta-pixel";
import { cn } from "@/lib/utils";

type ItineraryQuoteFormProps = {
  title: string;
  slug: string;
  hotelOptions: string[];
  preview?: boolean;
  /** Sem a moldura/fundo próprio (quando o container já tem). */
  embedded?: boolean;
  /** Prefixo dos ids dos campos. */
  idPrefix?: string;
};

const EXTRAS = content.itineraries.extras;
const DURATIONS = content.itineraries.durations;
const OTHER_DURATION = "Outra";

const fieldClassName =
  "h-11 rounded-xl border-white/20 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-brand-cyan/60";
const labelClassName = "text-sm font-medium text-white/90";
const submitClassName =
  "inline-flex h-11 w-full items-center justify-center rounded-xl bg-white text-sm font-semibold uppercase tracking-wide text-brand-navy transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/70 disabled:cursor-not-allowed disabled:opacity-50";

function pillClassName(selected: boolean) {
  return cn(
    "inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors",
    selected
      ? "border-brand-cyan bg-brand-cyan/15 text-white"
      : "border-white/20 text-white/80 hover:border-white/50 hover:text-white",
  );
}

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

/**
 * "Informações e reservas" da referência. Envia por e-mail pra equipe
 * (POST /api/roteiros/cotacao, mesmo desenho do Rei da Copa). Se o envio
 * falhar, oferece o WhatsApp com a mensagem já montada.
 */
export function ItineraryQuoteForm({
  title,
  slug,
  hotelOptions,
  preview = false,
  embedded = false,
  idPrefix = "roteiro",
}: ItineraryQuoteFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [hotel, setHotel] = useState("");
  const [origin, setOrigin] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [babies, setBabies] = useState(0);
  const [travelDate, setTravelDate] = useState("");
  const [duration, setDuration] = useState("");
  const [customDays, setCustomDays] = useState("");
  const [extras, setExtras] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [human, setHuman] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  // "Outra" vira "12 dias"; o resto vai como está no botão.
  const tripDays =
    duration === OTHER_DURATION ? (customDays.trim() && `${customDays.trim()} dias`) : duration;

  const whatsappHref = getItineraryWhatsAppUrl(title, {
    hotel: hotel || undefined,
    origin: origin.trim() || undefined,
    adults,
    children,
    babies,
    travelDate: travelDate.trim() || undefined,
    tripDays: tripDays || undefined,
    extras,
    message: [name.trim() && `Nome: ${name.trim()}`, message.trim()].filter(Boolean).join("\n") || undefined,
  });

  function toggleExtra(extra: string) {
    setExtras((list) => (list.includes(extra) ? list.filter((item) => item !== extra) : [...list, extra]));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (preview || status.kind === "sending") return;

    const payload: ItineraryQuoteInput = {
      itineraryTitle: title,
      itinerarySlug: slug,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      hotel: hotel || undefined,
      origin: origin.trim() || undefined,
      travelDate: travelDate.trim() || undefined,
      tripDays: tripDays || undefined,
      adults,
      children,
      babies,
      extras,
      message: message.trim() || undefined,
      website,
    };

    setStatus({ kind: "sending" });

    try {
      const response = await fetch("/api/roteiros/cotacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;

      if (!response.ok || !data?.ok) {
        setStatus({ kind: "error", message: data?.error ?? "Não conseguimos enviar agora." });
        return;
      }

      trackMetaLead({ source: "itinerary_quote", content_name: title });
      setStatus({ kind: "sent" });
    } catch {
      setStatus({ kind: "error", message: "Sem conexão com o servidor." });
    }
  }

  if (status.kind === "sent") {
    return (
      <section
        data-quote-form
        className={cn("text-white", !embedded && "rounded-2xl bg-brand-navy p-5 sm:p-6")}
        aria-live="polite"
      >
        <CheckCircle2 className="size-10 text-brand-cyan" aria-hidden />
        <h2 className="mt-3 font-heading text-xl font-bold uppercase leading-tight tracking-tight sm:text-2xl">
          Pedido enviado!
        </h2>
        <p className="mt-2 text-sm text-white/80">
          Recebemos seu pedido de cotação de <strong className="text-white">{title}</strong>. A equipe responde em
          breve pelo WhatsApp informado.
        </p>
      </section>
    );
  }

  return (
    <form
      data-quote-form
      onSubmit={handleSubmit}
      aria-labelledby={`${idPrefix}-reservas`}
      className={cn("relative text-white", !embedded && "rounded-2xl bg-brand-navy p-5 sm:p-6")}
      noValidate
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-cyan">Informações e reservas</p>
      <h2 id={`${idPrefix}-reservas`} className="mt-1.5 font-heading text-xl font-bold uppercase leading-tight tracking-tight sm:text-2xl">
        {title || "Roteiro"}
      </h2>

      <div className="mt-5 grid gap-4">
        <div className="space-y-1.5">
          <label htmlFor={`${idPrefix}-nome`} className={labelClassName}>
            Nome *
          </label>
          <Input
            id={`${idPrefix}-nome`}
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            required
            placeholder="Seu nome"
            className={fieldClassName}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${idPrefix}-whatsapp`} className={labelClassName}>
            WhatsApp *
          </label>
          <Input
            id={`${idPrefix}-whatsapp`}
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            autoComplete="tel"
            required
            placeholder="(51) 9 9999-9999"
            className={fieldClassName}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${idPrefix}-email`} className={labelClassName}>
            E-mail
          </label>
          <Input
            id={`${idPrefix}-email`}
            type="email"
            inputMode="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            placeholder="voce@exemplo.com"
            className={fieldClassName}
          />
        </div>

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

        <fieldset className="space-y-2" role="radiogroup" aria-label="Quantos dias">
          <legend className={labelClassName}>Quantos dias</legend>
          <div className="flex flex-wrap gap-2">
            {[...DURATIONS, OTHER_DURATION].map((option) => {
              const selected = duration === option;
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setDuration(selected ? "" : option)}
                  className={pillClassName(selected)}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {duration === OTHER_DURATION ? (
            <div className="space-y-1.5 pt-1">
              <label htmlFor={`${idPrefix}-dias`} className="text-xs text-white/60">
                Quantidade de dias total da viagem
              </label>
              <Input
                id={`${idPrefix}-dias`}
                type="number"
                min={1}
                max={90}
                inputMode="numeric"
                value={customDays}
                onChange={(event) => setCustomDays(event.target.value)}
                placeholder="Ex.: 12"
                className={cn(fieldClassName, "max-w-32")}
              />
            </div>
          ) : null}
        </fieldset>

        <fieldset className="space-y-2">
          <legend className={labelClassName}>Passageiros</legend>
          <p className="text-xs text-white/60">Crianças de 2 a 17 anos · Bebês até 24 meses.</p>
          <Counter idPrefix={idPrefix} label="Adultos" value={adults} min={1} onChange={setAdults} />
          <Counter idPrefix={idPrefix} label="Crianças" value={children} min={0} onChange={setChildren} />
          <Counter idPrefix={idPrefix} label="Bebês" value={babies} min={0} onChange={setBabies} />
        </fieldset>

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

        {/* Honeypot: fora da tela e fora do tab; bot preenche, humano não vê. */}
        <div className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden" aria-hidden>
          <label htmlFor={`${idPrefix}-website`}>Website</label>
          <input
            id={`${idPrefix}-website`}
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <label
          htmlFor={`${idPrefix}-humano`}
          className="inline-flex cursor-pointer items-center gap-2.5 rounded-xl border border-white/20 bg-white/5 px-3.5 py-2.5 text-sm text-white/90"
        >
          <input
            id={`${idPrefix}-humano`}
            type="checkbox"
            checked={human}
            onChange={(event) => setHuman(event.target.checked)}
            className="size-4.5 shrink-0 rounded border-white/40 accent-brand-cyan"
          />
          Não sou um robô
        </label>

        <button
          type="submit"
          disabled={preview || !human || status.kind === "sending" || !name.trim() || !phone.trim()}
          className={submitClassName}
          title={human ? undefined : 'Marque "Não sou um robô" para enviar.'}
        >
          {status.kind === "sending" ? "Enviando..." : "Enviar"}
        </button>

        {status.kind === "error" ? (
          <p className="rounded-xl border border-red-300/40 bg-red-500/15 px-3.5 py-2.5 text-sm text-white" role="alert">
            {status.message}{" "}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline underline-offset-4"
            >
              Mandar pelo WhatsApp
            </a>
          </p>
        ) : null}

        <p className="text-xs text-white/60">
          Seus dados vão só pra equipe responder esta cotação.{" "}
          <Link href="/politica-de-privacidade" className="underline underline-offset-4 hover:text-white">
            Política de privacidade
          </Link>
        </p>
      </div>
    </form>
  );
}

/** Uma linha por contador: rótulo à esquerda, −/número/+ à direita. Cabe na lateral de 320px e no celular. */
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
    <div className="flex items-center justify-between gap-3">
      <label htmlFor={id} className="text-sm text-white/90">
        {label}
      </label>
      <div className="flex shrink-0 items-center gap-1.5">
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
          className="h-9 w-12 shrink-0 rounded-lg border border-white/20 bg-white/10 text-center text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/60 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
