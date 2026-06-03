"use client";

import { cn } from "@/lib/utils";
import { buildShareLinks } from "@/lib/blog/share-links";

const brandIconClassName: Record<string, string> = {
  whatsapp: "bg-[#25D366] hover:bg-[#1ebe57]",
  facebook: "bg-[#1877F2] hover:bg-[#166fe0]",
  twitter: "bg-[#1DA1F2] hover:bg-[#1991db]",
  linkedin: "bg-[#0A66C2] hover:bg-[#095bab]",
};

type BlogShareSocialIconsProps = {
  url: string;
  title: string;
  className?: string;
  tone?: "brand" | "subtle";
  iconSize?: "sm" | "md";
};

export function BlogShareSocialIcons({
  url,
  title,
  className,
  tone = "brand",
  iconSize = "md",
}: BlogShareSocialIconsProps) {
  const shareLinks = buildShareLinks(url, title);
  const sizeClass = iconSize === "sm" ? "size-9" : "size-10";

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)} role="list">
      {shareLinks.map((item) => (
        <a
          key={item.id}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          role="listitem"
          aria-label={item.label}
          title={item.label}
          className={cn(
            "inline-flex items-center justify-center rounded-full shadow-sm transition-[transform,background-color,border-color] duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
            sizeClass,
            tone === "brand"
              ? cn("text-white", brandIconClassName[item.id])
              : "border border-border/70 bg-background text-muted-foreground hover:border-brand/30 hover:bg-brand/5 hover:text-brand",
          )}
        >
          {item.icon}
        </a>
      ))}
    </div>
  );
}
