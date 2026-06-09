export function enhanceBlogContentHtml(html: string): string {
  if (!html.trim()) {
    return html;
  }

  let imageIndex = 0;

  return html
    .replace(
      /<img\b([^>]*?)>/gi,
      (_match, attributes: string) => {
        imageIndex += 1;
        const isFirstImage = imageIndex === 1;

        let nextAttributes = attributes;

        if (!/loading\s*=/.test(nextAttributes)) {
          nextAttributes = `${nextAttributes} loading="${isFirstImage ? "eager" : "lazy"}"`;
        }

        if (!/decoding\s*=/.test(nextAttributes)) {
          nextAttributes = `${nextAttributes} decoding="async"`;
        }

        if (isFirstImage && !/fetchpriority\s*=/.test(nextAttributes)) {
          nextAttributes = `${nextAttributes} fetchpriority="high"`;
        }

        const withClass = /class\s*=/.test(nextAttributes)
          ? nextAttributes.replace(/class\s*=\s*"([^"]*)"/i, (_classMatch, classes: string) => {
              return `class="${classes} blog-content-image"`;
            })
          : `${nextAttributes} class="blog-content-image"`;

        return `<img${withClass}>`;
      },
    )
    .replace(
      /<figure\b([^>]*)>/gi,
      (_match, attributes: string) => {
        if (/class\s*=/.test(attributes)) {
          return `<figure${attributes.replace(/class\s*=\s*"([^"]*)"/i, (_classMatch, classes: string) => {
            return `class="${classes} blog-figure"`;
          })}>`;
        }

        return `<figure${attributes} class="blog-figure">`;
      },
    )
    .replace(
      /<a\b([^>]*?)>/gi,
      (_match, attributes: string) => {
        const hrefMatch = attributes.match(/href\s*=\s*"([^"]*)"/i);
        const href = hrefMatch?.[1] ?? "";
        const isExternal =
          href.startsWith("http://") ||
          href.startsWith("https://") ||
          href.startsWith("mailto:") ||
          href.startsWith("tel:");

        let nextAttributes = attributes;

        if (isExternal && !/target\s*=/.test(nextAttributes)) {
          nextAttributes = `${nextAttributes} target="_blank"`;
        }

        if (isExternal && !/rel\s*=/.test(nextAttributes)) {
          nextAttributes = `${nextAttributes} rel="noopener noreferrer"`;
        }

        if (/class\s*=/.test(nextAttributes)) {
          return `<a${nextAttributes.replace(/class\s*=\s*"([^"]*)"/i, (_classMatch, classes: string) => {
            return `class="${classes} blog-content-link"`;
          })}>`;
        }

        return `<a${nextAttributes} class="blog-content-link">`;
      },
    );
}

export const blogArticleContentClassName = [
  "text-[1.02rem] leading-8 text-foreground/95",
  "[&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight",
  "[&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:tracking-tight",
  "[&_p]:mt-5 [&_p]:text-pretty",
  "[&_ul]:mt-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5",
  "[&_ol]:mt-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5",
  "[&_a]:font-medium [&_a]:text-brand [&_a]:underline-offset-4 hover:[&_a]:underline",
  "[&_blockquote]:my-6 [&_blockquote]:rounded-xl [&_blockquote]:border-l-4 [&_blockquote]:border-brand/40 [&_blockquote]:bg-muted/35 [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:italic",
  "[&_strong]:font-semibold",
  "[&_.blog-content-image]:my-8 [&_.blog-content-image]:h-auto [&_.blog-content-image]:w-full [&_.blog-content-image]:max-w-full [&_.blog-content-image]:rounded-2xl [&_.blog-content-image]:border [&_.blog-content-image]:border-border/50 [&_.blog-content-image]:bg-muted/20 [&_.blog-content-image]:object-cover",
  "[&_.blog-figure]:my-8 [&_.blog-figure]:overflow-hidden [&_.blog-figure]:rounded-2xl [&_.blog-figure]:border [&_.blog-figure]:border-border/50 [&_.blog-figure]:bg-muted/15",
  "[&_.blog-figure_.blog-content-image]:my-0 [&_.blog-figure_.blog-content-image]:rounded-none [&_.blog-figure_.blog-content-image]:border-0",
  "[&_figcaption]:px-4 [&_figcaption]:py-3 [&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:text-muted-foreground",
].join(" ");
