"use client";

import { BlogReadingProgress } from "@/components/blog/blog-reading-progress";
import { BlogReadingSidebar } from "@/components/blog/blog-reading-sidebar";
import { useArticleReadingProgress } from "@/hooks/use-article-reading-progress";

type BlogPostReadingUiProps = {
  publishedAtLabel: string;
  publishedAtIso: string;
  title: string;
  url: string;
};

export function BlogPostReadingUi({
  publishedAtLabel,
  publishedAtIso,
  title,
  url,
}: BlogPostReadingUiProps) {
  const { progress, percent } = useArticleReadingProgress();

  return (
    <>
      <BlogReadingProgress progress={progress} percent={percent} />
      <BlogReadingSidebar
        progress={progress}
        publishedAtLabel={publishedAtLabel}
        publishedAtIso={publishedAtIso}
        title={title}
        url={url}
      />
    </>
  );
}
