import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export type FaqItem = {
  question: string;
  /** Texto simples (também usado no JSON-LD). */
  answer: string;
};

export type FaqModernProps = {
  sectionId?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  items: FaqItem[];
  className?: string;
};

export const defaultFaqItems: FaqItem[] = [
  {
    question: "Quanto tempo demora um projeto típico?",
    answer:
      "Depende do âmbito e integrações. Para um MVP bem definido, conte frequentemente com 6–12 semanas, com marcos semanais e demonstrações contínuas.",
  },
  {
    question: "Trabalham com equipas internas existentes?",
    answer:
      "Sim. Integramo-nos com produto, design e engenharia para acelerar entrega, partilhar contexto e documentar decisões — sem duplicar pipelines.",
  },
  {
    question: "Como tratam de performance e acessibilidade?",
    answer:
      "Definimos budgets de performance cedo, validamos com medições reais e aplicamos padrões de acessibilidade AA como requisito, não como extra.",
  },
  {
    question: "Qual é o modelo de comunicação durante o projeto?",
    answer:
      "Ritos leves e assíncronos primeiro: registo de decisões, canais claros e reviews quinzenais ou semanais, consoante a fase e o risco.",
  },
  {
    question: "Podem ajudar após o lançamento?",
    answer:
      "Oferecemos retainer opcional para evolução, observabilidade, hardening e melhorias incrementais — sempre com roadmap transparente.",
  },
];

export function FaqModern({
  sectionId = "faq",
  eyebrow,
  title,
  description,
  items,
  className,
}: FaqModernProps) {
  const headingId = `${sectionId}-heading`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section
      className={cn(
        "border-b border-border/50 bg-muted/10 py-16 sm:py-20 lg:py-24",
        className
      )}
      aria-labelledby={headingId}
    >
      <script
        type="application/ld+json"
        // JSON-LD: conteúdo gerado a partir de strings controladas pelo projeto
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12 lg:mb-14">
          {eyebrow ? (
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <h2
            id={headingId}
            className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-[2rem] lg:leading-tight"
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {description}
            </p>
          ) : null}
        </div>

        <div className="mx-auto max-w-3xl">
          <div
            className={cn(
              "rounded-2xl border border-border/60 bg-card/45 px-1 shadow-sm ring-1 ring-foreground/6",
              "supports-backdrop-filter:bg-card/35 supports-backdrop-filter:backdrop-blur-sm sm:px-2"
            )}
          >
            <Accordion
              type="single"
              collapsible
              className="px-4 sm:px-5"
              defaultValue={items[0] ? `${sectionId}-0` : undefined}
            >
              {items.map((item, index) => {
                const value = `${sectionId}-${index}`;

                return (
                  <AccordionItem key={value} value={value}>
                    <AccordionHeader>
                      <AccordionTrigger className="gap-4 [&>svg:last-child]:mt-1">
                        {item.question}
                      </AccordionTrigger>
                    </AccordionHeader>
                    <AccordionContent>
                      <p>{item.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
