import { cn } from "@/lib/utils";

/** Botão sólido WhatsApp — hover escurece levemente via `--brand-whatsapp-hover`. */
export const whatsappSolidButtonClassName = cn(
  "bg-brand-whatsapp text-white transition-colors duration-200",
  "hover:bg-brand-whatsapp-hover [a]:hover:bg-brand-whatsapp-hover"
);
