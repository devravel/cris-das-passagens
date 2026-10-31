import {
  CalendarDays,
  Laptop,
  Luggage,
  MonitorPlay,
  Tag,
  Trophy,
  Users,
} from "lucide-react";

import { BlueFridayForm } from "@/components/blue-friday/blue-friday-form";
import { Container } from "@/components/layout/container";
import { WhatsAppIcon } from "@/components/packages/package-whatsapp-cta";
import { PackagesListingSection } from "@/components/sections/packages/packages-listing-section";
import { blueFridayCampaign } from "@/config/blue-friday-campaign";
import { packagesPageSections } from "@/config/packages-page";
import type { RankingEntry } from "@/lib/blue-friday/rules";
import type { PublicPackage } from "@/lib/package/queries";
import { cn } from "@/lib/utils";
import { whatsappSolidButtonClassName } from "@/lib/whatsapp-styles";

const FORM_ID = "passaporte-blue";

const highlights = [
  { icon: MonitorPlay, title: "Live no YouTube", text: "Com ofertas exclusivas" },
  { icon: Users, title: "Passaporte Blue", text: "Cadastro no site e grupo VIP no WhatsApp" },
  { icon: Tag, title: "Pacotes, passagens e muito mais", text: "Destinos nacionais e internacionais" },
];

const steps = [
  { icon: Laptop, title: "Cadastro no site", text: "Garanta seu Passaporte Blue e peça a oferta do seu destino." },
  { icon: WhatsAppIcon, title: "Grupo VIP no WhatsApp", text: "Link da live, surpresas e ofertas antes de todo mundo." },
  { icon: MonitorPlay, title: "Blue Live no YouTube", text: "As ofertas são reveladas ao vivo." },
  { icon: Luggage, title: "Atendimento e vendas", text: "Nosso time transforma o sonho em viagem real." },
];

type BlueFridayLandingProps = {
  liveLabel: string;
  /** Antes da abertura, aberto ou encerrado (janela da config, horário de Brasília). */
  signupStatus: "soon" | "open" | "closed";
  /** "27/10" — quando abrem as inscrições. */
  signupStartLabel: string;
  ranking: RankingEntry[];
  offers: PublicPackage[];
};

/** Página da campanha no visual do cartaz: navy, azul neon e dourado. */
export function BlueFridayLanding({
  liveLabel,
  signupStatus,
  signupStartLabel,
  ranking,
  offers,
}: BlueFridayLandingProps) {
  const signupOpen = signupStatus === "open";
  const offerSections = packagesPageSections
    .map((config) => ({ config, packages: offers.filter((pkg) => pkg.type === config.type) }))
    .filter((section) => section.packages.length > 0);

  return (
    <div className="relative isolate overflow-hidden bg-[#050d2b] text-white">
      {/* Brilhos neon do fundo */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 -top-40 size-[36rem] rounded-full bg-brand-cyan/20 blur-[120px]" />
        <div className="absolute -right-40 top-1/3 size-[32rem] rounded-full bg-blue-600/25 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 size-[28rem] rounded-full bg-blue-500/15 blur-[120px]" />
      </div>

      {/* Hero */}
      <section aria-labelledby="blue-friday-heading" className="pt-12 pb-14 sm:pt-16 sm:pb-20">
        <Container className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-cyan sm:text-sm">
            Cris das Passagens apresenta
          </p>
          <h1
            id="blue-friday-heading"
            className="mt-4 font-heading text-6xl font-extrabold uppercase leading-[0.85] tracking-tight sm:text-8xl lg:text-9xl"
          >
            <span className="block bg-linear-to-b from-white via-sky-200 to-brand-cyan bg-clip-text text-transparent drop-shadow-[0_0_28px_rgba(56,189,248,0.55)]">
              Blue
            </span>
            <span className="block bg-linear-to-b from-white to-slate-300 bg-clip-text text-transparent">Friday</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg font-semibold uppercase tracking-wide text-sky-100 sm:text-xl">
            A Black Friday chegou antes no Cris das Passagens
          </p>

          <p className="mx-auto mt-5 w-fit -rotate-1 rounded-lg bg-linear-to-r from-amber-200 via-amber-300 to-amber-400 px-5 py-2.5 font-heading text-lg font-extrabold uppercase tracking-wide text-[#081845] shadow-[0_0_40px_-8px] shadow-amber-300/70 sm:text-2xl">
            Ofertas incríveis na nossa live
          </p>

          <p className="mt-7 flex flex-wrap items-center justify-center gap-2 text-sm text-white/85 sm:text-base">
            <CalendarDays className="size-5 text-brand-cyan" aria-hidden />
            Blue Live: <strong className="font-semibold text-white">{liveLabel}</strong>
          </p>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {signupOpen ? (
              <a
                href={`#${FORM_ID}`}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-7 text-sm font-bold uppercase tracking-wide text-[#081845] shadow-[0_0_36px_-6px] shadow-brand-cyan/70 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
              >
                Garantir meu Passaporte Blue
              </a>
            ) : null}
            <GroupVipButton />
          </div>

          <ul className="mx-auto mt-12 grid max-w-4xl gap-3 text-left sm:grid-cols-3">
            {highlights.map(({ icon: Icon, title, text }) => (
              <li
                key={title}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
              >
                <Icon className="mt-0.5 size-6 shrink-0 text-brand-cyan" aria-hidden />
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide">{title}</p>
                  <p className="mt-0.5 text-sm text-white/65">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Como funciona */}
      <section aria-labelledby="como-funciona-heading" className="border-t border-white/10 py-14 sm:py-20">
        <Container>
          <h2
            id="como-funciona-heading"
            className="text-center font-heading text-2xl font-bold uppercase tracking-[0.2em] sm:text-3xl"
          >
            Como funciona?
          </h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="text-center">
                <div className="relative mx-auto grid size-20 place-items-center rounded-full border-2 border-brand-cyan/70 shadow-[0_0_30px_-4px] shadow-brand-cyan/50">
                  <Icon className="size-8 text-white" />
                  <span className="absolute -left-1 -top-1 grid size-7 place-items-center rounded-full border-2 border-brand-cyan bg-[#050d2b] text-xs font-bold">
                    {index + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-sm font-bold uppercase tracking-wide">{title}</h3>
                <p className="mx-auto mt-1.5 max-w-56 text-sm text-white/70">{text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Cadastro */}
      <section
        id={FORM_ID}
        aria-labelledby="cadastro-heading"
        className="scroll-mt-24 border-t border-white/10 py-14 sm:py-20"
      >
        <Container size="narrow">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">Passaporte Blue</p>
            <h2 id="cadastro-heading" className="mt-2 font-heading text-3xl font-bold sm:text-4xl">
              Diga para onde quer ir
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-white/70 sm:text-base">
              Com o seu pedido, a equipe busca as melhores ofertas antes da live. Pode pedir mais de um destino com
              o mesmo WhatsApp.
            </p>
          </div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_80px_-30px] shadow-brand-cyan/40 backdrop-blur-sm sm:p-8">
            {signupOpen ? (
              <BlueFridayForm liveLabel={liveLabel} />
            ) : (
              <div className="py-6 text-center">
                <p className="text-white/80">
                  {signupStatus === "soon"
                    ? `As inscrições para o Passaporte Blue abrem em ${signupStartLabel}. Enquanto isso, entre no grupo VIP: é lá que saem as novidades e as surpresas primeiro.`
                    : "As inscrições da Blue Friday estão encerradas. As ofertas continuam abaixo e no grupo VIP."}
                </p>
                <GroupVipButton className="mt-5" />
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Ranking */}
      <section aria-labelledby="ranking-heading" className="border-t border-white/10 py-14 sm:py-20">
        <Container size="narrow">
          <div className="text-center">
            <Trophy className="mx-auto size-9 text-amber-300" aria-hidden />
            <h2 id="ranking-heading" className="mt-3 font-heading text-3xl font-bold sm:text-4xl">
              Destinos mais pedidos
            </h2>
            <p className="mt-2 text-sm text-white/70">Atualizado a cada minuto com os pedidos do site.</p>
          </div>
          <BlueFridayRanking entries={ranking} />
        </Container>
      </section>

      {/* Ofertas da live (pacotes da promoção configurada) */}
      {offerSections.length > 0 ? (
        <section aria-labelledby="ofertas-heading" className="border-t border-white/10 bg-background py-14 text-foreground sm:py-20">
          <Container>
            <h2 id="ofertas-heading" className="text-center font-heading text-3xl font-bold sm:text-4xl">
              Ofertas da Blue Live
            </h2>
            <div className="mt-10 space-y-11 sm:space-y-12">
              {offerSections.map(({ config, packages }, index) => (
                <PackagesListingSection
                  key={config.sectionId}
                  config={config}
                  packages={packages}
                  className={index > 0 ? "border-t border-border/50 pt-11 sm:pt-12" : undefined}
                />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      <section className="border-t border-white/10 py-12 text-center">
        <Container>
          <p className="font-heading text-2xl font-bold italic text-sky-200 sm:text-3xl">
            Grandes destinos, novas histórias.
          </p>
          <a
            href={blueFridayCampaign.whatsappGroupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white/85 underline-offset-4 hover:text-white hover:underline"
          >
            <WhatsAppIcon className="size-4" />
            Entrar no grupo VIP da Blue Friday
          </a>
        </Container>
      </section>
    </div>
  );
}

function GroupVipButton({ className }: { className?: string }) {
  return (
    <a
      href={blueFridayCampaign.whatsappGroupUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        whatsappSolidButtonClassName,
        "inline-flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold uppercase tracking-wide",
        className,
      )}
    >
      <WhatsAppIcon className="size-5" />
      Entrar no grupo VIP
    </a>
  );
}

function BlueFridayRanking({ entries }: { entries: RankingEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="mt-8 rounded-2xl border border-dashed border-white/20 px-4 py-10 text-center text-sm text-white/70">
        O ranking aparece com os primeiros pedidos. Faça o seu!
      </p>
    );
  }

  const max = entries[0].count;

  return (
    <ol className="mt-8 space-y-2.5">
      {entries.map((entry) => (
        <li
          key={entry.destination}
          className={cn(
            "relative overflow-hidden rounded-xl border px-4 py-3",
            entry.position === 1 ? "border-amber-300/50" : "border-white/10",
          )}
        >
          <div
            aria-hidden
            className={cn(
              "absolute inset-y-0 left-0",
              entry.position === 1 ? "bg-amber-300/15" : "bg-brand-cyan/10",
            )}
            style={{ width: `${Math.max(8, (entry.count / max) * 100)}%` }}
          />
          <div className="relative flex items-center justify-between gap-3">
            <p className="flex min-w-0 items-center gap-3">
              <span
                className={cn(
                  "w-8 shrink-0 font-heading text-lg font-extrabold tabular-nums",
                  entry.position === 1 ? "text-amber-300" : "text-brand-cyan",
                )}
              >
                {entry.position}º
              </span>
              <span className="truncate font-semibold">{entry.destination}</span>
            </p>
            <span className="shrink-0 text-sm tabular-nums text-white/75">
              {entry.count} {entry.count === 1 ? "pedido" : "pedidos"}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}
