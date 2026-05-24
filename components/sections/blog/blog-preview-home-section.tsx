import { BlogPreviewSection } from "@/components/sections/blog/blog-preview-section";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { getFeaturedHomeBlogPosts } from "@/lib/blog/queries";
import { createBlogItemListJsonLd } from "@/lib/seo";

export async function BlogPreviewHomeSection() {
  const posts = await getFeaturedHomeBlogPosts();
  const hasFeaturedPosts = posts.length > 0;

  return (
    <>
      {hasFeaturedPosts ? (
        <JsonLdScript
          data={createBlogItemListJsonLd(
            posts.map((post) => ({
              title: post.title,
              slug: post.slug,
              excerpt: post.excerpt,
            })),
          )}
        />
      ) : null}
      <BlogPreviewSection
        posts={posts}
        isPlaceholder={!hasFeaturedPosts}
      />
    </>
  );
}
