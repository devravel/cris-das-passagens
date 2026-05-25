import type { LucideIcon } from "lucide-react";
import {
  Cpu,
  LineChart,
  ShieldCheck,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader, bodyTextClassName } from "@/components/layout/section-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type FeatureItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type FeaturesGridProps = {
  /** Identificador estável para `id` / `aria-labelledby` (único na página). */
  sectionId?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  features: FeatureItem[];
  className?: string;
};

export const defaultFeatures: FeatureItem[] = [
  {
    title: "Velocidade de execução",
    description:
      "Pipelines otimizados e automações para reduzir fricção e libertar a equipa para trabalho de alto impacto.",
    icon: Zap,
  },
  {
    title: "Workflows claros",
    description:
      "Padrões consistentes, estados bem definidos e visibilidade ponta a ponta do que importa.",
    icon: Workflow,
  },
  {
    title: "Segurança em primeiro lugar",
    description:
      "Controlo de acessos, boas práticas por defeito e prontidão para ambientes regulados.",
    icon: ShieldCheck,
  },
  {
    title: "Observabilidade real",
    description:
      "Métricas e sinais que respondem a uma pergunta simples: está tudo saudável e em tendência certa?",
    icon: LineChart,
  },
  {
    title: "Infra preparada para escala",
    description:
      "Arquitetura modular que cresce com o produto, sem refactors de emergência a cada marco.",
    icon: Cpu,
  },
  {
    title: "Experiência memorável",
    description:
      "UI polida, estados vazios úteis e detalhes que tornam o produto credível desde o primeiro login.",
    icon: Sparkles,
  },
];

function FeatureCard({
  feature,
  itemId,
}: {
  feature: FeatureItem;
  itemId: string;
}) {
  const Icon = feature.icon;

  return (
    <Card
      className={cn(
        "h-full rounded-2xl border-border/60 bg-card/45 py-0 shadow-sm ring-1 ring-foreground/6 transition-[box-shadow,border-color,transform] duration-300",
        "supports-backdrop-filter:bg-card/35 supports-backdrop-filter:backdrop-blur-sm",
        "hover:-translate-y-px hover:border-border hover:shadow-md"
      )}
    >
      <CardHeader className="flex flex-row items-start gap-4 px-5 pb-2 pt-5 sm:px-6 sm:pt-6">
        <div
          className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted/55 text-foreground ring-1 ring-border/50 transition-colors duration-300 group-hover/card:text-primary"
          aria-hidden
        >
          <Icon className="size-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <h3
            id={itemId}
            className="font-heading text-base font-semibold leading-snug tracking-tight text-foreground sm:text-[1.05rem]"
          >
            {feature.title}
          </h3>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0 sm:px-6 sm:pb-6">
        <p className={bodyTextClassName}>{feature.description}</p>
      </CardContent>
    </Card>
  );
}

export function FeaturesGrid({
  sectionId = "features",
  eyebrow,
  title,
  description,
  features,
  className,
}: FeaturesGridProps) {
  const headingId = `${sectionId}-heading`;

  return (
    <Section
      background="default"
      spacing="default"
      bordered
      className={className}
      aria-labelledby={headingId}
    >
      {eyebrow ? (
        <Container size="prose" padding="none" className="mb-3 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {eyebrow}
          </p>
        </Container>
      ) : null}

      <SectionHeader
        id={headingId}
        title={title}
        subtitle={description}
        className={cn("mb-12 sm:mb-14 lg:mb-16", eyebrow && "mt-0")}
      />

      <ul
        className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6"
        role="list"
      >
        {features.map((feature, index) => {
          const itemId = `${sectionId}-item-${index}`;

          return (
            <li key={itemId}>
              <article aria-labelledby={itemId}>
                <FeatureCard feature={feature} itemId={itemId} />
              </article>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
