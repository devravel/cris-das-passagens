import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Crown,
  Gift,
  KeyRound,
  ScrollText,
  Trophy,
} from "lucide-react";

import { Container } from "@/components/layout/container";
import { CampaignNav } from "@/components/rei-da-copa/campaign-nav";
import { DailyKeywordForm } from "@/components/rei-da-copa/daily-keyword-form";
import { ParticipantRegistrationForm } from "@/components/rei-da-copa/participant-registration-form";
import { PublicRanking } from "@/components/rei-da-copa/public-ranking";
import { SoccerBallIcon } from "@/components/rei-da-copa/soccer-ball-icon";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  REI_DA_COPA_SECTION_IDS,
  reiDaCopaCampaignDefaults,
  reiDaCopaCampaignFooterMessages,
  reiDaCopaDailyParticipationReminder,
  reiDaCopaDefaultPrizes,
  reiDaCopaShowWeeklyPrizeBanner,
  getReiDaCopaInstagramUrl,
  reiDaCopaSupplementaryInfo,
  reiDaCopaEngagementActions,
  reiDaCopaShowEngagementActions,
  reiDaCopaHeroTagline,
  reiDaCopaHowToSteps,
  reiDaCopaInstagramHashtag,
  reiDaCopaParticipationConfirmationMessage,
  reiDaCopaKeywordInfo,
  reiDaCopaMissions,
  reiDaCopaScoringCommentExample,
  reiDaCopaScoringFootnotes,
  reiDaCopaScoringReminder,
  reiDaCopaScoringRules,
  reiDaCopaScoringValidationNote,
  reiDaCopaSectionIntros,
} from "@/config/rei-da-copa-landing";
import type {
  ReiDaCopaMissionNote,
  ReiDaCopaSectionIntro,
} from "@/config/rei-da-copa-landing";
import type {
  ReiDaCopaPublicRankingEntry,
  ReiDaCopaSettingsEntity,
} from "@/lib/rei-da-copa/types";
import { cn } from "@/lib/utils";

type ReiDaCopaLandingProps = {
  ranking: ReiDaCopaPublicRankingEntry[];
  settings: ReiDaCopaSettingsEntity;
};

const campaignProseClassName =
  "rei-da-copa-prose text-justify-smart w-full max-w-none";

const tiebreakerTextClassName =
  "rei-da-copa-prose mx-auto max-w-3xl text-pretty text-center break-normal hyphens-none";

const campaignAccentClassName = "font-semibold text-[#14532d]";

const campaignLinkClassName = `${campaignAccentClassName} underline-offset-2 transition-colors hover:text-[#166534] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`;

function CampaignSection({
  id,
  children,
  className,
  ariaLabelledBy,
}: {
  id: string;
  children: ReactNode;
  className?: string;
  ariaLabelledBy?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={cn(
        "rei-da-copa-section scroll-mt-28 sm:scroll-mt-32",
        className,
      )}
    >
      {children}
    </section>
  );
}

function CampaignSectionHeader({
  id,
  eyebrow,
  title,
  subtitle,
  centerSubtitle = false,
  variant = "default",
  footer,
}: {
  id: string;
  eyebrow: string;
  title: string;
  subtitle?: ReiDaCopaSectionIntro;
  centerSubtitle?: boolean;
  variant?: "default" | "inverted" | "warm";
  footer?: ReactNode;
}) {
  const isInverted = variant === "inverted";
  const isWarm = variant === "warm";

  return (
    <header className="mb-8 text-center sm:mb-10 lg:mb-12">
      <p
        className={cn(
          "rei-da-copa-section-eyebrow",
          isInverted && "rei-da-copa-section-eyebrow--inverted",
        )}
      >
        {eyebrow}
      </p>
      <h2
        id={id}
        className={cn(
          "rei-da-copa-section-heading mt-3",
          isInverted && "rei-da-copa-section-heading--inverted",
        )}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={cn(
            centerSubtitle
              ? "rei-da-copa-prose mx-auto mt-4 text-center sm:mt-5"
              : cn(campaignProseClassName, "mx-auto mt-4 sm:mt-5"),
            isInverted && "rei-da-copa-prose--inverted",
            isWarm && "rei-da-copa-prose--warm",
          )}
        >
          <CampaignLinkedText content={subtitle} />
        </p>
      ) : null}
      {footer}
    </header>
  );
}

function ContentPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rei-da-copa-panel @container min-w-0 rounded-2xl p-4 backdrop-blur-sm sm:rounded-3xl sm:p-7 lg:p-10",
        className,
      )}
    >
      {children}
    </div>
  );
}

function ScoringRuleNote({ note }: { note: string }) {
  const parts = note.split(reiDaCopaInstagramHashtag);

  if (parts.length === 1) {
    return <>{note}</>;
  }

  return (
    <>
      {parts.map((part, index) => (
        <span key={`${index}-${part.slice(0, 12)}`}>
          {part}
          {index < parts.length - 1 ? (
            <span className="rei-da-copa-hashtag font-semibold">
              {reiDaCopaInstagramHashtag}
            </span>
          ) : null}
        </span>
      ))}
    </>
  );
}

function ScoringCommentExample() {
  return (
    <div className="rei-da-copa-info-card rei-da-copa-info-card--muted mt-6 rounded-2xl p-5 sm:p-6 lg:mx-auto lg:max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground sm:text-sm">
        {reiDaCopaScoringCommentExample.heading}
      </p>
      <div className="mt-4 rounded-xl border border-[#14532d]/12 bg-white/80 px-4 py-3 sm:px-5 sm:py-4">
        <p className="rei-da-copa-prose mt-1.5 text-sm sm:text-base">
          <ScoringRuleNote note={reiDaCopaScoringCommentExample.comment} />
        </p>
      </div>
    </div>
  );
}

function ScoringCard({
  action,
  points,
  note,
}: {
  action: string;
  points: string;
  note?: string;
}) {
  return (
    <li className="rei-da-copa-interactive-card rei-da-copa-scoring-card relative min-w-0 rounded-2xl p-5 sm:p-7">
      <p className="rei-da-copa-point-display rei-da-copa-interactive-card__value">
        {points}
      </p>
      <p className="rei-da-copa-card-heading rei-da-copa-interactive-card__title mt-3">
        {action}
      </p>
      {note ? (
        <p
          className={cn(
            campaignProseClassName,
            "rei-da-copa-interactive-card__body mt-3 text-sm sm:text-base",
          )}
        >
          <ScoringRuleNote note={note} />
        </p>
      ) : null}
    </li>
  );
}

function HowToStepDescription({
  step,
}: {
  step: (typeof reiDaCopaHowToSteps)[number];
}) {
  if (step.step === 1) {
    return (
      <>
        Se inscreva{" "}
        <a href="#inscricao" className={campaignLinkClassName}>
          aqui
        </a>{" "}
        e confira o{" "}
        <a
          href={`#${REI_DA_COPA_SECTION_IDS.regulamento}`}
          className={campaignLinkClassName}
        >
          regulamento
        </a>
        .
      </>
    );
  }

  if (step.step === 2) {
    return (
      <>
        Siga o{" "}
        <a
          href={getReiDaCopaInstagramUrl(reiDaCopaCampaignDefaults.instagram)}
          className={campaignLinkClassName}
          target="_blank"
          rel="noopener noreferrer"
        >
          {reiDaCopaCampaignDefaults.instagram}
        </a>{" "}
        no Instagram e compartilhe a publicação oficial nos stories, marcando o
        perfil.
      </>
    );
  }

  if (step.step === 3) {
    return (
      <>
        Suba no{" "}
        <a
          href={`#${REI_DA_COPA_SECTION_IDS.ranking}`}
          className={campaignLinkClassName}
        >
          ranking
        </a>
        , complete missões e dispute prêmios incríveis!
      </>
    );
  }

  return step.description;
}

function CampaignBulletItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span
        className="mt-2.5 size-2 shrink-0 rounded-full bg-[#c9a227]"
        aria-hidden
      />
      <span className="rei-da-copa-prose break-normal hyphens-none">
        {children}
      </span>
    </li>
  );
}

function CampaignLinkedText({ content }: { content: ReiDaCopaMissionNote }) {
  if (typeof content === "string") {
    return <>{content}</>;
  }

  if ("highlight" in content) {
    return (
      <>
        {content.textBeforeHighlight}
        <span className="font-bold text-[#c9a227]">{content.highlight}</span>
        {content.textAfterHighlight}
      </>
    );
  }

  const isExternalLink = content.linkHref.startsWith("http");

  return (
    <>
      {content.textBeforeLink}
      {content.textBeforeLink ? " " : null}
      <a
        href={content.linkHref}
        className={campaignLinkClassName}
        {...(isExternalLink
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {content.linkLabel}
      </a>
      {content.textAfterLink}
    </>
  );
}

function MissionNote({ note }: { note: ReiDaCopaMissionNote }) {
  return <CampaignLinkedText content={note} />;
}

function MissionCard({
  action,
  reward,
  note,
}: {
  action: string;
  reward: string;
  note?: ReiDaCopaMissionNote;
}) {
  return (
    <li className="rei-da-copa-info-card min-w-0 rounded-2xl p-5 sm:p-6">
      <p className="rei-da-copa-value-display">{reward}</p>
      <p className="rei-da-copa-card-heading mt-3 text-base sm:text-lg">
        {action}
      </p>
      {note ? (
        <p className={cn(campaignProseClassName, "mt-2 text-sm sm:text-base")}>
          <MissionNote note={note} />
        </p>
      ) : null}
    </li>
  );
}

function PrizeCard({
  position,
  label,
  prize,
}: {
  position: string;
  label: string;
  prize: string;
}) {
  return (
    <article className="rei-da-copa-interactive-card min-w-0 rounded-2xl p-5 sm:p-6 lg:p-7">
      <div className="flex min-w-0 items-center gap-2.5">
        <Gift
          className="size-5 shrink-0 sm:size-6"
          data-rei-copa-icon
          aria-hidden
        />
        <p className="rei-da-copa-interactive-card__title font-heading text-lg font-bold sm:text-xl lg:text-2xl">
          {position}
        </p>
      </div>
      <p
        className={cn(
          campaignProseClassName,
          "rei-da-copa-interactive-card__label mt-2 text-sm font-medium sm:text-base",
        )}
      >
        {label}
      </p>
      <p className="rei-da-copa-interactive-card__value mt-4 font-heading text-xl font-bold leading-tight sm:text-2xl lg:text-3xl">
        {prize}
      </p>
    </article>
  );
}

export function ReiDaCopaLanding({ ranking, settings }: ReiDaCopaLandingProps) {
  const customRegulation = settings.regulation?.trim();
  const hasCustomRegulation = Boolean(customRegulation);
  const instagramUrl = getReiDaCopaInstagramUrl(
    reiDaCopaCampaignDefaults.instagram,
  );

  const prizes = [
    {
      position: "1º lugar",
      label: "Grande Rei da Copa",
      prize: settings.firstPlacePrize?.trim() || reiDaCopaDefaultPrizes.first,
    },
    {
      position: "2º lugar",
      label: "Vice-campeão da campanha",
      prize: settings.secondPlacePrize?.trim() || reiDaCopaDefaultPrizes.second,
    },
    {
      position: "3º lugar",
      label: "Terceiro colocado",
      prize: settings.thirdPlacePrize?.trim() || reiDaCopaDefaultPrizes.third,
    },
  ];

  return (
    <div className="rei-da-copa-landing min-w-0">
      <CampaignNav />

      <main id="rei-da-copa-main">
        <CampaignSection
          id={REI_DA_COPA_SECTION_IDS.inicio}
          ariaLabelledBy="rei-da-copa-hero-heading"
          className="rei-da-copa-hero relative overflow-hidden border-b border-[#c9a227]/20"
        >
          <div
            className="rei-da-copa-hero-pattern absolute inset-0"
            aria-hidden
          />
          <Container
            size="campaign"
            padding="none"
            className="relative py-16 sm:py-24 lg:py-28"
          >
            <div className="mx-auto flex w-full flex-col items-center text-center">
              <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-[#c9a227]/35 bg-[#14532d]/20 px-3 py-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[#f5d565] sm:px-5 sm:py-2 sm:text-sm sm:tracking-[0.22em]">
                <Crown className="size-3.5 shrink-0 sm:size-4" aria-hidden />
                Copa do Mundo 2026
              </div>

              <h1
                id="rei-da-copa-hero-heading"
                className="font-heading text-balance text-3xl font-bold uppercase tracking-tight text-[#f5d565] sm:text-5xl md:text-6xl lg:text-7xl"
              >
                Rei da Copa
              </h1>

              <p className="mt-6 w-full text-balance text-base font-medium leading-relaxed text-white/90 sm:text-xl md:text-2xl lg:text-[1.75rem]">
                {reiDaCopaHeroTagline.lead}{" "}
                <span className="text-[#f5d565]">
                  {reiDaCopaHeroTagline.highlight}
                </span>
              </p>

              <div className="mt-8 flex items-center justify-center gap-4 sm:mt-10 sm:gap-5">
                <Trophy
                  className="size-10 text-[#f5d565]/90 sm:size-16"
                  aria-hidden
                />
                <SoccerBallIcon className="size-10 sm:size-16" />
              </div>

              <div className="mt-6 flex w-full max-w-md flex-col items-center justify-center gap-3 sm:mt-8 sm:flex-row sm:gap-4">
                <a
                  href="#inscricao"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#f5d565] px-6 text-sm font-bold uppercase tracking-wide text-[#14532d] shadow-sm transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-px hover:bg-[#f8e07a] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5d565] focus-visible:ring-offset-2 focus-visible:ring-offset-[#14532d] active:translate-y-0 active:scale-[0.98] sm:w-auto"
                >
                  Entrar em campo
                  <ArrowRight className="size-4" aria-hidden />
                </a>
                <a
                  href={`#${REI_DA_COPA_SECTION_IDS.regulamento}`}
                  className="inline-flex h-11 w-full items-center justify-center rounded-full border border-white/25 bg-white/10 px-6 text-sm font-bold uppercase tracking-wide text-white backdrop-blur-sm transition-[transform,background-color,border-color] duration-200 hover:-translate-y-px hover:border-white/40 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#14532d] active:translate-y-0 active:scale-[0.98] sm:w-auto"
                >
                  Regulamento
                </a>
              </div>

              <p className="mt-4 text-balance text-xs font-bold uppercase tracking-[0.12em] text-white/75 sm:text-sm sm:tracking-[0.18em]">
                {reiDaCopaDailyParticipationReminder}
              </p>
            </div>
          </Container>
        </CampaignSection>

        <div className="rei-da-copa-content-shell border-b border-border/40 bg-linear-to-b from-[#14532d]/4 via-background to-muted/20">
          <Container
            size="campaign"
            padding="none"
            className="py-14 sm:py-16 lg:py-20"
          >
            <div className="rei-da-copa-content-panel mx-auto min-w-0 space-y-16 sm:space-y-20 lg:space-y-24">
              <CampaignSection
                id={REI_DA_COPA_SECTION_IDS.premiacao}
                ariaLabelledBy="premiacao-heading"
              >
                <CampaignSectionHeader
                  id="premiacao-heading"
                  eyebrow="Premiação"
                  title="Conquiste prêmios"
                />

                <ContentPanel className="space-y-8">
                  {reiDaCopaShowWeeklyPrizeBanner ? (
                    <div className="rei-da-copa-info-card rei-da-copa-info-card--featured rounded-2xl p-6 text-center sm:p-8">
                      <p className="font-heading text-balance text-xl font-bold uppercase text-[#14532d] sm:text-2xl lg:text-3xl">
                        {reiDaCopaDefaultPrizes.weekly}
                      </p>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 gap-5 pb-1 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6">
                    {prizes.map((item) => (
                      <PrizeCard key={item.position} {...item} />
                    ))}
                  </div>

                  <p
                    className={cn(
                      tiebreakerTextClassName,
                      "rei-da-copa-info-card rei-da-copa-info-card--muted rounded-2xl px-5 py-4",
                    )}
                  >
                    {reiDaCopaDefaultPrizes.tiebreaker}
                  </p>
                </ContentPanel>
              </CampaignSection>

              <CampaignSection
                id={REI_DA_COPA_SECTION_IDS.comoParticipar}
                ariaLabelledBy="como-participar-heading"
              >
                <CampaignSectionHeader
                  id="como-participar-heading"
                  eyebrow="Como participar"
                  title="Entre em campo"
                />

                <ContentPanel>
                  <ol className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
                    {reiDaCopaHowToSteps.map((step) => (
                      <li
                        key={step.step}
                        className="rei-da-copa-info-card min-w-0 rounded-2xl p-4 sm:p-5"
                      >
                        <div
                          className="rei-da-copa-step-badge flex size-12 items-center justify-center rounded-full sm:size-14"
                          aria-hidden
                        >
                          <span className="rei-da-copa-step-number">
                            {String(step.step).padStart(2, "0")}
                          </span>
                        </div>
                        <h3 className="rei-da-copa-card-heading mt-5">
                          {step.title}
                        </h3>
                        <p className={cn(campaignProseClassName, "mt-3")}>
                          <HowToStepDescription step={step} />
                        </p>
                      </li>
                    ))}
                  </ol>

                  <p className="rei-da-copa-prose mx-auto mt-8 max-w-3xl text-center text-pretty">
                    {reiDaCopaParticipationConfirmationMessage}
                  </p>

                  {reiDaCopaShowEngagementActions ? (
                    <div className="rei-da-copa-info-card mt-8 min-w-0 rounded-2xl p-5 sm:p-7">
                      <h3 className="rei-da-copa-card-heading">
                        Formas de acumular coroas
                      </h3>
                      <ul className="mt-4 space-y-3">
                        {reiDaCopaEngagementActions.map((action) => (
                          <li
                            key={action}
                            className={cn(campaignProseClassName, "flex gap-3")}
                          >
                            <span
                              className="mt-2.5 size-2 shrink-0 rounded-full bg-[#c9a227]"
                              aria-hidden
                            />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </ContentPanel>

                <div
                  id="inscricao"
                  className="mt-8 scroll-mt-28 sm:scroll-mt-32"
                >
                  <ContentPanel>
                    <CardHeader className="px-0 pt-0">
                      <CardTitle className="rei-da-copa-card-heading flex min-w-0 flex-wrap items-center gap-2">
                        <Trophy
                          className="size-5 shrink-0 sm:size-6"
                          aria-hidden
                        />
                        Inscrição na campanha
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 pt-3 pb-0">
                      <ParticipantRegistrationForm />
                    </CardContent>
                  </ContentPanel>
                </div>
              </CampaignSection>

              <CampaignSection
                id={REI_DA_COPA_SECTION_IDS.palavraChave}
                ariaLabelledBy="palavra-chave-heading"
                className="rei-da-copa-section-band rei-da-copa-keyword-band"
              >
                <div className="rei-da-copa-section-band__content rei-da-copa-container">
                  <CampaignSectionHeader
                    id="palavra-chave-heading"
                    eyebrow="Palavra-chave"
                    title="Ponto extra"
                    subtitle={reiDaCopaSectionIntros.palavraChave}
                    centerSubtitle
                    variant="warm"
                    footer={
                      <p className="rei-da-copa-prose rei-da-copa-prose--warm mx-auto mt-1.5 text-center sm:mt-2">
                        Recompensa de{" "}
                        <span className={campaignAccentClassName}>
                          {reiDaCopaKeywordInfo.reward}
                        </span>
                        .
                      </p>
                    }
                  />

                  <div className="rei-da-copa-keyword-panel">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle className="rei-da-copa-card-heading flex min-w-0 flex-wrap items-center gap-2">
                        <KeyRound
                          className="size-5 shrink-0 sm:size-6"
                          aria-hidden
                        />
                        Palavra-chave do dia
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 pt-3 pb-0">
                      <DailyKeywordForm />
                    </CardContent>
                  </div>
                </div>
              </CampaignSection>

              <CampaignSection
                id={REI_DA_COPA_SECTION_IDS.ranking}
                ariaLabelledBy="ranking-heading"
                className="rei-da-copa-section-band rei-da-copa-ranking-band"
              >
                <div className="rei-da-copa-section-band__content rei-da-copa-container">
                  <CampaignSectionHeader
                    id="ranking-heading"
                    eyebrow="Ranking"
                    title="Classificação"
                    subtitle={reiDaCopaSectionIntros.ranking}
                    centerSubtitle
                    variant="inverted"
                  />

                  <div className="rei-da-copa-ranking-panel">
                    <PublicRanking entries={ranking} />
                  </div>
                </div>
              </CampaignSection>

              <CampaignSection
                id={REI_DA_COPA_SECTION_IDS.regulamento}
                ariaLabelledBy="regulamento-heading"
              >
                <CampaignSectionHeader
                  id="regulamento-heading"
                  eyebrow="Regulamento"
                  title="Regras oficiais"
                />

                <div className="space-y-8">
                  <ContentPanel className="space-y-8">
                    <div>
                      <h3 className="rei-da-copa-card-heading text-xl sm:text-2xl lg:text-3xl">
                        Sistema de coroas
                      </h3>
                      <p
                        className={cn(
                          campaignProseClassName,
                          "mt-3 font-medium text-foreground",
                        )}
                      >
                        {reiDaCopaScoringReminder}
                      </p>
                      <div className="mt-2 space-y-1">
                        {reiDaCopaScoringFootnotes.map((footnote) => (
                          <p
                            key={
                              typeof footnote === "string"
                                ? footnote
                                : "linkHref" in footnote
                                  ? footnote.linkLabel
                                  : footnote.highlight
                            }
                            className="text-sm text-muted-foreground"
                          >
                            <CampaignLinkedText content={footnote} />
                          </p>
                        ))}
                      </div>
                      <ul className="mt-6 grid grid-cols-1 gap-4 pb-1 lg:grid-cols-3 lg:gap-5">
                        {reiDaCopaScoringRules.map((rule) => (
                          <ScoringCard key={rule.action} {...rule} />
                        ))}
                      </ul>
                      <p
                        className={cn(
                          campaignProseClassName,
                          "rei-da-copa-info-card rei-da-copa-info-card--muted mx-auto mt-5 max-w-3xl rounded-2xl px-5 py-4 text-center text-pretty sm:px-6",
                        )}
                      >
                        <ScoringRuleNote
                          note={reiDaCopaScoringValidationNote}
                        />
                      </p>
                      <ScoringCommentExample />
                    </div>

                    <div>
                      <h3 className="rei-da-copa-card-heading text-xl sm:text-2xl lg:text-3xl">
                        Missões
                      </h3>
                      <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                        {reiDaCopaMissions.map((mission) => (
                          <MissionCard key={mission.action} {...mission} />
                        ))}
                      </ul>
                    </div>

                    {!hasCustomRegulation ? (
                      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-x-10">
                        <div>
                          <h3 className="rei-da-copa-card-heading">
                            {reiDaCopaSupplementaryInfo.registration.heading}
                          </h3>
                          <ul className="mt-4 space-y-3">
                            <CampaignBulletItem>
                              {reiDaCopaSupplementaryInfo.registration.text}
                            </CampaignBulletItem>
                          </ul>
                        </div>
                        <div>
                          <h3 className="rei-da-copa-card-heading">
                            {reiDaCopaSupplementaryInfo.dailyKeyword.heading}
                          </h3>
                          <ul className="mt-4 space-y-3">
                            {reiDaCopaSupplementaryInfo.dailyKeyword.items.map(
                              (item) => (
                                <CampaignBulletItem key={item}>
                                  {item}
                                </CampaignBulletItem>
                              ),
                            )}
                          </ul>
                        </div>
                        <div>
                          <h3 className="rei-da-copa-card-heading">
                            {reiDaCopaSupplementaryInfo.period.heading}
                          </h3>
                          <ul className="mt-4 space-y-3">
                            <CampaignBulletItem>
                              {reiDaCopaSupplementaryInfo.period.text}
                            </CampaignBulletItem>
                          </ul>
                        </div>
                        <div>
                          <h3 className="rei-da-copa-card-heading">
                            {reiDaCopaSupplementaryInfo.tiebreaker.heading}
                          </h3>
                          <ul className="mt-4 space-y-3">
                            <CampaignBulletItem>
                              {reiDaCopaSupplementaryInfo.tiebreaker.text}
                            </CampaignBulletItem>
                          </ul>
                        </div>
                        <div>
                          <h3 className="rei-da-copa-card-heading">
                            {reiDaCopaSupplementaryInfo.questions.heading}
                          </h3>
                          <ul className="mt-4 space-y-3">
                            <CampaignBulletItem>
                              {
                                reiDaCopaSupplementaryInfo.questions
                                  .textBeforeLink
                              }{" "}
                              <Link
                                href="/contato"
                                className={campaignLinkClassName}
                              >
                                {reiDaCopaSupplementaryInfo.questions.linkLabel}
                              </Link>
                              {
                                reiDaCopaSupplementaryInfo.questions
                                  .textAfterLink
                              }
                            </CampaignBulletItem>
                          </ul>
                        </div>
                      </div>
                    ) : null}
                  </ContentPanel>

                  {hasCustomRegulation ? (
                    <ContentPanel>
                      <CardHeader className="px-0 pt-0">
                        <CardTitle className="rei-da-copa-card-heading flex min-w-0 flex-wrap items-center gap-2">
                          <ScrollText
                            className="size-5 shrink-0 sm:size-6"
                            aria-hidden
                          />
                          Regulamento completo
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-0 pb-0">
                        <div
                          className={cn(
                            campaignProseClassName,
                            "whitespace-pre-wrap",
                          )}
                        >
                          {customRegulation}
                        </div>
                      </CardContent>
                    </ContentPanel>
                  ) : null}

                  <div className="rei-da-copa-info-card rei-da-copa-info-card--featured space-y-4 rounded-2xl px-4 py-5 text-center sm:px-8 sm:py-7">
                    <p className="rei-da-copa-prose mx-auto text-center font-medium text-foreground">
                      {reiDaCopaCampaignFooterMessages.passion}
                    </p>
                    <p className="rei-da-copa-prose mx-auto text-center text-sm sm:text-base">
                      Acompanhe a campanha em nosso{" "}
                      <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={campaignLinkClassName}
                      >
                        Instagram
                      </a>{" "}
                      e a classificação por aqui.
                    </p>
                  </div>
                </div>
              </CampaignSection>
            </div>
          </Container>
        </div>
      </main>
    </div>
  );
}
