import Image from "next/image";
import { ArrowUpRight, BadgeCheck, Play } from "lucide-react";

import { InstagramIcon } from "@/components/layout/footer";
import { Section } from "@/components/layout/section";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { content } from "@/config/content";
import { siteConfig } from "@/config/site";
import {
  formatFollowers,
  getInstagramFeed,
  type InstagramFeed,
  type InstagramPost,
} from "@/lib/instagram/behold";
import { scrollRevealDefaults } from "@/lib/motion";

const copy = content.instagram;

/** Cabeçalho estilo perfil do Instagram: avatar, handle, números e botão seguir. */
function InstagramProfileHeader({ feed }: { feed: InstagramFeed | null }) {
  const stats = copy.profile.stats.map((stat) =>
    stat.label === "seguidores" && feed?.followersCount
      ? { ...stat, value: formatFollowers(feed.followersCount) }
      : stat,
  );

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <a
        href={copy.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Abrir ${copy.handle} no Instagram`}
        className="relative shrink-0 rounded-full bg-linear-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[3px] outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <span className="flex size-24 items-center justify-center overflow-hidden rounded-full border-[3px] border-white bg-white sm:size-28">
          {feed?.profilePictureUrl ? (
            <Image
              src={feed.profilePictureUrl}
              alt=""
              width={112}
              height={112}
              sizes="112px"
              className="size-full object-cover"
            />
          ) : (
            <Image
              src={siteConfig.logoNav}
              alt=""
              width={817}
              height={388}
              sizes="112px"
              className="h-auto w-full p-2.5"
            />
          )}
        </span>
      </a>

      <div className="flex min-w-0 flex-col items-center">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          <h2 className="inline-flex items-center gap-1.5 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]">
            {copy.handle}
            <BadgeCheck
              className="size-5 fill-brand text-white"
              strokeWidth={2}
              aria-label="Perfil verificado"
            />
          </h2>
          <a
            href={copy.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-linear-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] px-4 text-sm font-semibold text-white shadow-[0_8px_20px_-10px_rgba(238,42,123,0.7)] transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transition-none"
          >
            <InstagramIcon className="size-4" />
            {copy.cta.label}
            <ArrowUpRight className="size-4" strokeWidth={2} aria-hidden />
          </a>
        </div>

        <dl className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 sm:gap-x-8">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-baseline gap-1.5">
              <dd className="font-heading text-lg font-bold whitespace-nowrap text-foreground sm:text-xl">
                {stat.value}
              </dd>
              <dt className="text-sm text-muted-foreground">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>

        <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          <strong className="font-semibold text-foreground">{copy.profile.name}</strong>
          {" · "}
          {copy.profile.bio}
        </p>
      </div>
    </div>
  );
}

/** Sem feed, os placeholders locais abrem o perfil. */
function placeholderPosts(): InstagramPost[] {
  return copy.posts.map((image, index) => ({
    id: image,
    permalink: copy.href,
    image,
    alt: `Post ${index + 1}`,
    isVideo: false,
  }));
}

function InstagramPostsGrid({ posts }: { posts: InstagramPost[] }) {
  return (
    <ul className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6" aria-label="Posts recentes">
      {posts.map((post, index) => (
        <li key={post.id}>
          <ScrollReveal delay={index * (scrollRevealDefaults.stagger / 2)} y={20}>
            <a
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={post.alt ? `Ver no Instagram: ${post.alt}` : "Ver post no Instagram"}
              className="group relative block aspect-square overflow-hidden rounded-xl bg-muted outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <Image
                src={post.image}
                alt=""
                fill
                sizes="(max-width: 1024px) 33vw, 180px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
              />
              {post.isVideo ? (
                <Play
                  aria-hidden
                  className="absolute top-2 right-2 size-4 fill-white text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                />
              ) : null}
              <span
                aria-hidden
                className="absolute inset-0 flex items-center justify-center bg-brand-navy/55 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none"
              >
                <InstagramIcon className="size-7" />
              </span>
            </a>
          </ScrollReveal>
        </li>
      ))}
    </ul>
  );
}

export async function InstagramSection({ sectionId = "instagram" }: { sectionId?: string }) {
  const feed = await getInstagramFeed();

  return (
    <Section id={sectionId} background="default" spacing="compact" aria-label={copy.title}>
      <ScrollReveal>
        <div className="mx-auto max-w-5xl">
          <InstagramProfileHeader feed={feed} />
          <div className="mt-8 sm:mt-10">
            <InstagramPostsGrid posts={feed?.posts ?? placeholderPosts()} />
          </div>
        </div>
      </ScrollReveal>
    </Section>
  );
}
