"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe, Minus, Plane, Plus } from "lucide-react";

import { WhatsAppIcon } from "@/components/packages/package-whatsapp-cta";
import { BrazilianMobilePhoneInput } from "@/components/rei-da-copa/brazilian-mobile-phone-input";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { Select } from "@/components/ui/select";
import { blueFridayCampaign } from "@/config/blue-friday-campaign";
import {
  BLUE_FRIDAY_MAX_PEOPLE,
  BLUE_FRIDAY_PAYMENT_OPTIONS,
  createBlueFridayRequestSchema,
  type BlueFridayPaymentPreferenceValue,
} from "@/lib/blue-friday/rules";
import { trackMetaLead } from "@/lib/meta-pixel";
import { getCampaignDateKey } from "@/lib/rei-da-copa/campaign-window";
import { cn } from "@/lib/utils";
import { whatsappSolidButtonClassName } from "@/lib/whatsapp-styles";

const OTHER_DESTINATION = "__other__";
const CHILD_AGES = Array.from({ length: 16 }, (_, i) => String(i + 2));

const fieldClassName =
  "h-11 rounded-xl border-white/20 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-brand-cyan/60";
const pickerClassName = "h-11 border-white/20 bg-white/10 text-white hover:border-white/50";
const labelClassName = "text-sm font-medium text-white/90";

function pillClassName(selected: boolean) {
  return cn(
    "inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors",
    selected
      ? "border-brand-cyan bg-brand-cyan/15 text-white"
      : "border-white/20 text-white/80 hover:border-white/50 hover:text-white",
  );
}

type Values = {
  name: string;
  phone: string;
  departureCity: string;
  destinationChoice: string;
  destinationOther: string;
  dateMode: "SPECIFIC" | "FLEXIBLE";
  option1Departure: string;
  option1Return: string;
  option2Departure: string;
  option2Return: string;
  flexiblePeriod: string;
  tripDays: string;
  adults: number;
  childrenAges: string[];
  babies: number;
  budgetRange: string;
  paymentPreference: BlueFridayPaymentPreferenceValue | "";
  targetPrice: number | null;
};

const emptyValues: Values = {
  name: "",
  phone: "",
  departureCity: "",
  destinationChoice: "",
  destinationOther: "",
  dateMode: "SPECIFIC",
  option1Departure: "",
  option1Return: "",
  option2Departure: "",
  option2Return: "",
  flexiblePeriod: "",
  tripDays: "",
  adults: 2,
  childrenAges: [],
  babies: 0,
  budgetRange: "",
  paymentPreference: "",
  targetPrice: null,
};

type Passport = { number: number; name: string; destination: string };

/**
 * Cadastro Blue Friday (POST /api/blue-friday/pedidos). Mesmo estilo do
 * formulário de cotação de roteiros. Sucesso mostra o Passaporte Blue com o
 * nome digitado agora (não o do banco) e o link do grupo VIP.
 */
export function BlueFridayForm({ liveLabel }: { liveLabel: string }) {
  const [values, setValues] = useState<Values>(emptyValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [website, setWebsite] = useState(""); // honeypot
  const [human, setHuman] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [passport, setPassport] = useState<Passport | null>(null);

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function setChildren(count: number) {
    setValues((current) => ({
      ...current,
      childrenAges: Array.from({ length: count }, (_, i) => current.childrenAges[i] ?? ""),
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;

    const destination =
      values.destinationChoice === OTHER_DESTINATION ? values.destinationOther : values.destinationChoice;
    const payload = {
      name: values.name,
      phone: values.phone,
      departureCity: values.departureCity,
      destination,
      dateMode: values.dateMode,
      option1Departure: values.option1Departure,
      option1Return: values.option1Return,
      option2Departure: values.option2Departure,
      option2Return: values.option2Return,
      flexiblePeriod: values.flexiblePeriod,
      tripDays: values.tripDays.trim() ? Number(values.tripDays) : null,
      adults: values.adults,
      childrenAges: values.childrenAges.map((age) => Number(age || 0)),
      babies: values.babies,
      budgetRange: values.budgetRange,
      paymentPreference: values.paymentPreference,
      targetPrice: values.targetPrice,
      website,
    };

    const parsed = createBlueFridayRequestSchema(blueFridayCampaign, getCampaignDateKey()).safeParse(payload);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        next[key] ??= issue.message;
      }
      setErrors(next);
      setSubmitError("Revise os campos destacados.");
      return;
    }

    setErrors({});
    setSubmitError(null);
    setSending(true);

    try {
      const response = await fetch("/api/blue-friday/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string; passportNumber?: number }
        | null;

      if (!response.ok || !data?.ok || data.passportNumber == null) {
        setSubmitError(data?.error ?? "Não conseguimos enviar agora. Tente de novo.");
        return;
      }

      trackMetaLead({ source: "blue_friday", content_name: destination.trim() });
      setPassport({ number: data.passportNumber, name: values.name.trim(), destination: destination.trim() });
    } catch {
      setSubmitError("Sem conexão com o servidor. Tente de novo.");
    } finally {
      setSending(false);
    }
  }

  function requestAnother() {
    setValues((current) => ({ ...emptyValues, name: current.name, phone: current.phone }));
    setPassport(null);
    setHuman(false);
  }

  if (passport) {
    return <PassportCard passport={passport} liveLabel={liveLabel} onRequestAnother={requestAnother} />;
  }

  const error = (key: string) =>
    errors[key] ? <p className="text-xs text-red-300">{errors[key]}</p> : null;

  return (
    <form onSubmit={handleSubmit} noValidate className="relative grid gap-5 text-white">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="bf-nome" className={labelClassName}>
            Nome *
          </label>
          <Input
            id="bf-nome"
            value={values.name}
            onChange={(event) => set("name", event.target.value)}
            autoComplete="name"
            placeholder="Nome e sobrenome"
            aria-invalid={Boolean(errors.name)}
            className={fieldClassName}
          />
          {error("name")}
        </div>
        <div className="space-y-1.5">
          <label htmlFor="bf-whatsapp" className={labelClassName}>
            WhatsApp *
          </label>
          <BrazilianMobilePhoneInput
            id="bf-whatsapp"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="(51) 99999-9999"
            value={values.phone}
            onValueChange={(next) => set("phone", next.formattedValue)}
            aria-invalid={Boolean(errors.phone)}
            className={fieldClassName}
          />
          {error("phone")}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="bf-saida" className={labelClassName}>
            Saída de (cidade ou aeroporto) *
          </label>
          <Input
            id="bf-saida"
            value={values.departureCity}
            onChange={(event) => set("departureCity", event.target.value)}
            placeholder="Ex.: Porto Alegre (POA)"
            aria-invalid={Boolean(errors.departureCity)}
            className={fieldClassName}
          />
          {error("departureCity")}
        </div>
        <div className="space-y-1.5">
          <label htmlFor="bf-destino" className={labelClassName}>
            Destino desejado *
          </label>
          <Select
            id="bf-destino"
            value={values.destinationChoice}
            onChange={(value) => set("destinationChoice", value)}
            placeholder="Escolha o destino"
            options={[
              ...blueFridayCampaign.destinations.map((destination) => ({ value: destination, label: destination })),
              { value: OTHER_DESTINATION, label: "Outro destino" },
            ]}
            invalid={Boolean(errors.destination)}
            className={pickerClassName}
          />
          {values.destinationChoice === OTHER_DESTINATION ? (
            <Input
              aria-label="Qual destino?"
              value={values.destinationOther}
              onChange={(event) => set("destinationOther", event.target.value)}
              placeholder="Qual destino?"
              className={cn(fieldClassName, "mt-2")}
            />
          ) : null}
          {error("destination")}
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className={cn("mb-2", labelClassName)}>Quando você quer viajar? *</legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Quando você quer viajar?">
          {(
            [
              ["SPECIFIC", "Tenho datas"],
              ["FLEXIBLE", "Sou flexível"],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={values.dateMode === mode}
              onClick={() => set("dateMode", mode)}
              className={pillClassName(values.dateMode === mode)}
            >
              {label}
            </button>
          ))}
        </div>

        {values.dateMode === "SPECIFIC" ? (
          <div className="grid gap-4">
            <DateOption
              title="Opção 1"
              departure={values.option1Departure}
              back={values.option1Return}
              onDeparture={(value) => set("option1Departure", value)}
              onBack={(value) => set("option1Return", value)}
              departureError={errors.option1Departure}
              backError={errors.option1Return}
              idPrefix="bf-op1"
            />
            <DateOption
              title="Opção 2 (opcional)"
              hint="Duas opções de data aumentam a chance de achar a melhor oferta."
              departure={values.option2Departure}
              back={values.option2Return}
              onDeparture={(value) => set("option2Departure", value)}
              onBack={(value) => set("option2Return", value)}
              departureError={errors.option2Departure}
              backError={errors.option2Return}
              idPrefix="bf-op2"
            />
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Período">
              {blueFridayCampaign.flexiblePeriods.map((period) => (
                <button
                  key={period}
                  type="button"
                  role="radio"
                  aria-checked={values.flexiblePeriod === period}
                  onClick={() => set("flexiblePeriod", period)}
                  className={pillClassName(values.flexiblePeriod === period)}
                >
                  {period}
                </button>
              ))}
            </div>
            {error("flexiblePeriod")}
            <div className="space-y-1.5">
              <label htmlFor="bf-dias" className={labelClassName}>
                Quantos dias de viagem?
              </label>
              <Input
                id="bf-dias"
                type="number"
                min={1}
                max={60}
                inputMode="numeric"
                value={values.tripDays}
                onChange={(event) => set("tripDays", event.target.value)}
                placeholder="Ex.: 7"
                aria-invalid={Boolean(errors.tripDays)}
                className={cn(fieldClassName, "max-w-32")}
              />
              {error("tripDays")}
            </div>
          </div>
        )}
      </fieldset>

      <fieldset className="space-y-2">
        <legend className={labelClassName}>Passageiros *</legend>
        <p className="text-xs text-white/60">Crianças de 2 a 17 anos · Bebês até 24 meses.</p>
        <Counter label="Adultos" value={values.adults} min={1} onChange={(value) => set("adults", value)} />
        <Counter label="Crianças" value={values.childrenAges.length} min={0} onChange={setChildren} />
        {values.childrenAges.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {values.childrenAges.map((age, index) => (
              <Select
                key={index}
                aria-label={`Idade da criança ${index + 1}`}
                value={age}
                onChange={(value) =>
                  set(
                    "childrenAges",
                    values.childrenAges.map((current, i) => (i === index ? value : current)),
                  )
                }
                placeholder={`Idade da criança ${index + 1}`}
                options={CHILD_AGES.map((value) => ({ value, label: `${value} anos` }))}
                invalid={Boolean(errors.childrenAges) && !age}
                className={pickerClassName}
              />
            ))}
          </div>
        ) : null}
        {error("childrenAges")}
        <Counter label="Bebês" value={values.babies} min={0} onChange={(value) => set("babies", value)} />
      </fieldset>

      <fieldset>
        <legend className={cn("mb-2", labelClassName)}>Orçamento total da viagem *</legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Orçamento total da viagem">
          {blueFridayCampaign.budgetRanges.map((range) => (
            <button
              key={range}
              type="button"
              role="radio"
              aria-checked={values.budgetRange === range}
              onClick={() => set("budgetRange", range)}
              className={pillClassName(values.budgetRange === range)}
            >
              {range}
            </button>
          ))}
        </div>
        <div className="mt-1.5">{error("budgetRange")}</div>
      </fieldset>

      <fieldset>
        <legend className={cn("mb-2", labelClassName)}>Como prefere pagar? *</legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Como prefere pagar?">
          {BLUE_FRIDAY_PAYMENT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={values.paymentPreference === option.value}
              onClick={() => set("paymentPreference", option.value)}
              className={pillClassName(values.paymentPreference === option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="mt-1.5">{error("paymentPreference")}</div>
      </fieldset>

      <div className="space-y-1.5">
        <label htmlFor="bf-valor" className={labelClassName}>
          Qual valor faria você comprar essa viagem na Blue Friday?
        </label>
        <p className="text-xs text-white/60">Opcional. Ajuda a equipe a buscar a oferta certa.</p>
        <div className="relative max-w-56">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/60">
            R$
          </span>
          <MoneyInput
            id="bf-valor"
            value={values.targetPrice}
            onValueChange={(value) => set("targetPrice", value)}
            placeholder="0,00"
            aria-invalid={Boolean(errors.targetPrice)}
            className={cn(fieldClassName, "pl-9")}
          />
        </div>
        {error("targetPrice")}
      </div>

      {/* Honeypot: fora da tela e fora do tab; bot preenche, humano não vê. */}
      <div className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden" aria-hidden>
        <label htmlFor="bf-website">Website</label>
        <input
          id="bf-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3">
        <label
          htmlFor="bf-humano"
          className="inline-flex cursor-pointer items-center gap-2.5 rounded-xl border border-white/20 bg-white/5 px-3.5 py-2.5 text-sm text-white/90"
        >
          <input
            id="bf-humano"
            type="checkbox"
            checked={human}
            onChange={(event) => setHuman(event.target.checked)}
            className="size-4.5 shrink-0 rounded border-white/40 accent-brand-cyan"
          />
          Não sou um robô
        </label>

        {submitError ? (
          <p className="rounded-xl border border-red-300/40 bg-red-500/15 px-3.5 py-2.5 text-sm text-white" role="alert">
            {submitError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!human || sending}
          title={human ? undefined : 'Marque "Não sou um robô" para enviar.'}
          className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-linear-to-r from-amber-300 to-amber-400 text-sm font-bold uppercase tracking-wide text-brand-navy shadow-[0_0_30px_-6px] shadow-amber-300/60 transition-[filter,transform] hover:brightness-105 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? "Gerando seu passaporte..." : "Gerar meu Passaporte Blue"}
        </button>

        <p className="text-xs text-white/60">
          Ao enviar, você aceita receber o contato da equipe pelo WhatsApp sobre a Blue Friday.{" "}
          <Link href="/politica-de-privacidade" className="underline underline-offset-4 hover:text-white">
            Política de privacidade
          </Link>
        </p>
      </div>
    </form>
  );
}

function DateOption({
  title,
  hint,
  departure,
  back,
  onDeparture,
  onBack,
  departureError,
  backError,
  idPrefix,
}: {
  title: string;
  hint?: string;
  departure: string;
  back: string;
  onDeparture: (value: string) => void;
  onBack: (value: string) => void;
  departureError?: string;
  backError?: string;
  idPrefix: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
      <p className="text-sm font-semibold text-white">{title}</p>
      {hint ? <p className="mt-0.5 text-xs text-white/60">{hint}</p> : null}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor={`${idPrefix}-ida`} className="text-xs text-white/70">
            Ida
          </label>
          <DatePicker
            id={`${idPrefix}-ida`}
            value={departure}
            onChange={onDeparture}
            invalid={Boolean(departureError)}
            className={pickerClassName}
          />
          {departureError ? <p className="text-xs text-red-300">{departureError}</p> : null}
        </div>
        <div className="space-y-1.5">
          <label htmlFor={`${idPrefix}-volta`} className="text-xs text-white/70">
            Volta
          </label>
          <DatePicker
            id={`${idPrefix}-volta`}
            value={back}
            onChange={onBack}
            invalid={Boolean(backError)}
            className={pickerClassName}
          />
          {backError ? <p className="text-xs text-red-300">{backError}</p> : null}
        </div>
      </div>
    </div>
  );
}

/** Mesmo contador do formulário de roteiros: rótulo à esquerda, −/número/+ à direita. */
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
  const id = `bf-${label.toLowerCase()}`;
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
          max={BLUE_FRIDAY_MAX_PEOPLE}
          value={value}
          onChange={(event) => {
            const next = Number.parseInt(event.target.value, 10);
            if (Number.isNaN(next)) return;
            onChange(Math.min(BLUE_FRIDAY_MAX_PEOPLE, Math.max(min, next)));
          }}
          className="h-9 w-12 shrink-0 rounded-lg border border-white/20 bg-white/10 text-center text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/60 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          aria-label={`Mais ${label.toLowerCase()}`}
          className={buttonClassName}
          onClick={() => onChange(Math.min(BLUE_FRIDAY_MAX_PEOPLE, value + 1))}
          disabled={value >= BLUE_FRIDAY_MAX_PEOPLE}
        >
          <Plus className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

function PassportCard({
  passport,
  liveLabel,
  onRequestAnother,
}: {
  passport: Passport;
  liveLabel: string;
  onRequestAnother: () => void;
}) {
  return (
    <div className="text-white" role="status" aria-live="polite">
      <p className="text-center text-sm font-semibold uppercase tracking-wider text-brand-cyan">
        Cadastro confirmado!
      </p>
      <h3 className="mt-1 text-center font-heading text-2xl font-bold sm:text-3xl">Seu Passaporte Blue chegou</h3>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-white/75">
        Agora entre no grupo VIP: é lá que saem o link da live, as surpresas e as ofertas antes de todo mundo.
      </p>

      <div className="relative mx-auto mt-6 max-w-sm overflow-hidden rounded-2xl border border-amber-300/40 bg-linear-to-br from-[#0b2a6b] via-[#0a1d4d] to-[#06112e] p-6 shadow-[0_0_60px_-12px] shadow-brand-cyan/50">
        <Globe aria-hidden className="absolute -right-10 -top-10 size-44 text-white/5" strokeWidth={1} />
        <div className="relative flex items-center justify-between">
          <p className="font-heading text-lg font-extrabold uppercase leading-none tracking-wide text-amber-300">
            Passaporte
            <br />
            Blue
          </p>
          <Plane aria-hidden className="size-7 text-amber-300" />
        </div>
        <dl className="relative mt-6 grid gap-3 text-sm">
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-white/50">Nº</dt>
            <dd className="font-mono text-2xl font-bold tracking-widest">
              {String(passport.number).padStart(5, "0")}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-white/50">Titular</dt>
            <dd className="font-semibold">{passport.name}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-white/50">Destino</dt>
            <dd className="font-semibold">{passport.destination}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-white/50">Blue Live</dt>
            <dd className="font-semibold">{liveLabel}</dd>
          </div>
        </dl>
      </div>

      <div className="mx-auto mt-6 flex max-w-sm flex-col gap-2.5">
        <a
          href={blueFridayCampaign.whatsappGroupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            whatsappSolidButtonClassName,
            "inline-flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-bold uppercase tracking-wide",
          )}
        >
          <WhatsAppIcon className="size-5" />
          Entrar no grupo VIP
        </a>
        <button
          type="button"
          onClick={onRequestAnother}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-white/25 text-sm font-semibold text-white/90 transition-colors hover:border-white/60 hover:text-white"
        >
          Pedir outro destino
        </button>
      </div>
    </div>
  );
}
