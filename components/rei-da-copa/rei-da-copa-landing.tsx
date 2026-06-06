import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Crown,
  Gift,
  KeyRound,
  Medal,
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
  reiDaCopaParticipationConfirmationMessage,
  reiDaCopaKeywordInfo,
  reiDaCopaMissions,
  reiDaCopaScoringReminder,
  reiDaCopaScoringRules,
  reiDaCopaSectionIntros,
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

const campaignLinkClassName =
  "font-semibold text-[#14532d] underline-offset-2 transition-colors hover:text-[#166534] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

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
}: {
  id: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  centerSubtitle?: boolean;
}) {
  return (
    <header className="mb-8 text-center sm:mb-10 lg:mb-12">
      <p className="rei-da-copa-section-eyebrow">{eyebrow}</p>
      <h2 id={id} className="rei-da-copa-section-heading mt-3">
        {title}
      </h2>
      {subtitle ? (
        <p
          className={cn(
            centerSubtitle
              ? "rei-da-copa-prose mx-auto mt-4 text-center sm:mt-5"
              : cn(campaignProseClassName, "mx-auto mt-4 sm:mt-5"),
          )}
        >
          {subtitle}
        </p>
      ) : null}
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
    <li className="rei-da-copa-interactive-card relative min-w-0 rounded-2xl p-5 sm:p-7">
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
          {note}
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

  if (step.step === 4) {
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

function MissionCard({
  action,
  reward,
  note,
}: {
  action: string;
  reward: string;
  note?: string;
}) {
  return (
    <li className="rei-da-copa-info-card min-w-0 rounded-2xl p-5 sm:p-6">
      <p className="rei-da-copa-value-display">{reward}</p>
      <p className="rei-da-copa-card-heading mt-3 text-base sm:text-lg">
        {action}
      </p>
      {note ? (
        <p className={cn(campaignProseClassName, "mt-2 text-sm sm:text-base")}>
          {note}
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
                  <ol className="grid gap-6 sm:grid-cols-2">
                    {reiDaCopaHowToSteps.map((step) => (
                      <li
                        key={step.step}
                        className="rei-da-copa-info-card min-w-0 rounded-2xl p-5 sm:p-7"
                      >
                        <div
                          className="rei-da-copa-step-badge flex size-14 items-center justify-center rounded-full sm:size-16"
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
              >
                <header className="mb-8 text-center sm:mb-10 lg:mb-12">
                  <p className="rei-da-copa-section-eyebrow">Palavra-chave</p>
                  <h2
                    id="palavra-chave-heading"
                    className="rei-da-copa-section-heading mt-3"
                  >
                    Ponto extra
                  </h2>
                  <p className="rei-da-copa-prose mx-auto mt-4 text-center sm:mt-5">
                    {reiDaCopaSectionIntros.palavraChave}
                  </p>
                  <p className="rei-da-copa-prose mx-auto mt-1.5 text-center sm:mt-2">
                    Recompensa de{" "}
                    <span className="font-semibold text-[#14532d]">
                      {reiDaCopaKeywordInfo.reward}
                    </span>
                    .
                  </p>
                </header>

                <ContentPanel>
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
                </ContentPanel>
              </CampaignSection>

              <CampaignSection
                id={REI_DA_COPA_SECTION_IDS.ranking}
                ariaLabelledBy="ranking-heading"
              >
                <CampaignSectionHeader
                  id="ranking-heading"
                  eyebrow="Ranking"
                  title="Classificação"
                  subtitle={reiDaCopaSectionIntros.ranking}
                  centerSubtitle
                />

                <ContentPanel>
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="rei-da-copa-card-heading flex min-w-0 flex-wrap items-center gap-2">
                      <Medal
                        className="size-5 shrink-0 sm:size-6"
                        aria-hidden
                      />
                      Ranking Rei da Copa
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 pb-0">
                    <PublicRanking entries={ranking} />
                  </CardContent>
                </ContentPanel>
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
                      <h3 className="rei-da-copa-card-heading">
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
                      <ul className="mt-6 grid grid-cols-1 gap-4 pb-1 lg:grid-cols-3 lg:gap-5">
                        {reiDaCopaScoringRules.map((rule) => (
                          <ScoringCard key={rule.action} {...rule} />
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="rei-da-copa-card-heading">Missões</h3>
                      <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                        {reiDaCopaMissions.map((mission) => (
                          <MissionCard key={mission.action} {...mission} />
                        ))}
                      </ul>
                    </div>

                    {!hasCustomRegulation ? (
                      <div className="space-y-8">
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
                      e o ranking por aqui.
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
