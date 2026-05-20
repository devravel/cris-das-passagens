import { Quote } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type TestimonialItem = {
  quote: string;
  author: string;
  role: string;
  company?: string;
  /** URL da fonte original (opcional); útil para `cite` em SEO). */
  sourceUrl?: string;
};

export type TestimonialsModernProps = {
  sectionId?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  testimonials: TestimonialItem[];
  className?: string;
};

export const defaultTestimonials: TestimonialItem[] = [
  {
    quote:
      "Reduzimos o tempo entre ideia e produção em semanas. A clareza do processo e a qualidade técnica notam-se em cada release.",
    author: "Mariana Costa",
    role: "VP de Produto",
    company: "Northline",
  },
  {
    quote:
      "Finalmente uma experiência que parece enterprise sem sacrificar velocidade. Onboarding fluido e documentação que as equipas realmente usam.",
    author: "João Ferreira",
    role: "CTO",
    company: "BridgeLabs",
  },
  {
    quote:
      "O detalhe no design e na execução elevou a confiança dos nossos clientes. Métricas de adoção subiram de forma consistente no primeiro trimestre.",
    author: "Inês Almeida",
    role: "Head de Crescimento",
    company: "Craft & Co.",
  },
];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function TestimonialCard({
  testimonial,
  authorId,
}: {
  testimonial: TestimonialItem;
  authorId: string;
}) {
  const initials = getInitials(testimonial.author);

  return (
    <Card
      className={cn(
        "h-full rounded-2xl border-border/60 bg-card/45 py-0 shadow-sm ring-1 ring-foreground/6 transition-[box-shadow,border-color,transform] duration-300",
        "supports-backdrop-filter:bg-card/35 supports-backdrop-filter:backdrop-blur-sm",
        "hover:-translate-y-px hover:border-border hover:shadow-md"
      )}
    >
      <CardContent className="flex flex-col gap-6 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <Quote
            className="size-7 shrink-0 text-foreground/20"
            strokeWidth={1.5}
            aria-hidden
          />
        </div>

        <blockquote
          cite={testimonial.sourceUrl}
          className="space-y-0 border-l-0 pl-0 text-[0.9375rem] leading-relaxed text-foreground sm:text-base"
        >
          <p>&ldquo;{testimonial.quote}&rdquo;</p>
        </blockquote>

        <footer className="mt-auto flex items-center gap-3 border-t border-border/50 pt-5">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted/70 font-heading text-xs font-semibold tracking-tight text-foreground ring-1 ring-border/50"
            aria-hidden
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p id={authorId} className="truncate font-heading text-sm font-semibold tracking-tight text-foreground">
              <cite className="not-italic">{testimonial.author}</cite>
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground/80">{testimonial.role}</span>
              {testimonial.company ? (
                <>
                  <span className="text-border">&nbsp;·&nbsp;</span>
                  <span>{testimonial.company}</span>
                </>
              ) : null}
            </p>
          </div>
        </footer>
      </CardContent>
    </Card>
  );
}

export function TestimonialsModern({
  sectionId = "testimonials",
  eyebrow,
  title,
  description,
  testimonials,
  className,
}: TestimonialsModernProps) {
  const headingId = `${sectionId}-heading`;

  return (
    <section
      className={cn(
        "border-b border-border/50 bg-background py-16 sm:py-20 lg:py-24",
        className
      )}
      aria-labelledby={headingId}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-14 lg:mb-16">
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

        <ul
          className="grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6"
          role="list"
        >
          {testimonials.map((item, index) => {
            const authorId = `${sectionId}-author-${index}`;

            return (
              <li key={authorId}>
                <article aria-labelledby={authorId}>
                  <TestimonialCard testimonial={item} authorId={authorId} />
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
