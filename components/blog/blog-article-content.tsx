import { blogArticleContentClassName, enhanceBlogContentHtml } from "@/lib/blog/content";
import { cn } from "@/lib/utils";

type BlogArticleContentProps = {
  html: string;
  className?: string;
};

export function BlogArticleContent({ html, className }: BlogArticleContentProps) {
  const enhancedHtml = enhanceBlogContentHtml(html);

  return (
    <div
      data-article-content
      className={cn(blogArticleContentClassName, className)}
      dangerouslySetInnerHTML={{ __html: enhancedHtml }}
    />
  );
}
