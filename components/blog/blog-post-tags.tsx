import { cn } from "@/lib/utils";

type BlogPostTag = {
  id: string;
  name: string;
  slug: string;
};

type BlogPostTagsProps = {
  tags: BlogPostTag[];
  className?: string;
};

export function BlogPostTags({ tags, className }: BlogPostTagsProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <section className={cn("space-y-3", className)} aria-label="Tags do artigo">
      <h2 className="text-sm font-semibold text-foreground">Tags</h2>
      <ul className="flex flex-wrap gap-2 p-0">
        {tags.map((tag) => (
          <li key={tag.id}>
            <span className="inline-flex rounded-full border border-border/70 bg-muted/35 px-3 py-1 text-xs font-medium text-foreground/90">
              {tag.name}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
