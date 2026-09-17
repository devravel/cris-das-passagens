import { Container } from "@/components/layout/container";
import { StorageImage } from "@/components/ui/storage-image";
import { cn } from "@/lib/utils";

type ItineraryBannerProps = {
  title: string;
  image: string;
  /** Linha abaixo do título (duração, preço). */
  children?: React.ReactNode;
  priority?: boolean;
  className?: string;
};

/**
 * Faixa de topo da referência (assessoriavipviagens): foto de fundo, véu navy
 * e o título em caixa alta. Full-bleed; o texto alinha com o Container.
 */
export function ItineraryBanner({ title, image, children, priority, className }: ItineraryBannerProps) {
  return (
    <div className={cn("relative isolate flex min-h-56 items-end overflow-hidden bg-brand-navy text-white sm:min-h-72 lg:min-h-80", className)}>
      {image ? (
        <StorageImage
          src={image}
          alt=""
          fill
          priority={priority}
          sizes="100vw"
          containerClassName="absolute inset-0 bg-brand-navy"
          className="object-cover object-center"
        />
      ) : null}
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-brand-navy via-brand-navy/55 to-brand-navy/15"
      />
      <Container className="relative pb-7 pt-20 sm:pb-9 sm:pt-24">
        <h1 className="max-w-4xl text-balance font-heading text-3xl font-bold uppercase leading-[1.05] tracking-tight drop-shadow sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {children ? <div className="mt-3 text-base text-white/85 sm:text-lg">{children}</div> : null}
      </Container>
    </div>
  );
}
