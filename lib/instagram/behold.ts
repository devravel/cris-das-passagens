import "server-only";

/**
 * Feed do Instagram via Behold (behold.so): JSON público, sem script de
 * terceiro na página. Buscado no servidor com ISR de 1h; sem a env ou com
 * falha, devolve null e a seção usa os placeholders locais.
 */
export type InstagramPost = {
  id: string;
  permalink: string;
  /** Quadrado 700px do CDN do Behold (passa pelo otimizador do Next). */
  image: string;
  alt: string;
  isVideo: boolean;
};

export type InstagramFeed = {
  posts: InstagramPost[];
  followersCount: number | null;
  profilePictureUrl: string | null;
};

type BeholdPost = {
  id: string;
  permalink: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  prunedCaption?: string;
  caption?: string;
  visibility?: string;
  sizes?: { medium?: { mediaUrl?: string } };
  thumbnailUrl?: string;
  mediaUrl?: string;
};

type BeholdFeed = {
  followersCount?: number;
  profilePictureUrl?: string;
  posts?: BeholdPost[];
};

const MAX_POSTS = 6;

function firstLine(text: string | undefined): string {
  return (text ?? "").split("\n")[0]?.trim().slice(0, 120) ?? "";
}

export async function getInstagramFeed(): Promise<InstagramFeed | null> {
  const url = process.env.BEHOLD_FEED_URL;
  if (!url) return null;

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) return null;

    const data = (await response.json()) as BeholdFeed;
    const posts = (data.posts ?? [])
      .filter((post) => post.visibility !== "hidden")
      .map((post): InstagramPost | null => {
        const image = post.sizes?.medium?.mediaUrl ?? post.thumbnailUrl ?? post.mediaUrl;
        if (!image) return null;

        return {
          id: post.id,
          permalink: post.permalink,
          image,
          alt: firstLine(post.prunedCaption ?? post.caption),
          isVideo: post.mediaType === "VIDEO",
        };
      })
      .filter((post): post is InstagramPost => post !== null)
      .slice(0, MAX_POSTS);

    if (posts.length === 0) return null;

    return {
      posts,
      followersCount: data.followersCount ?? null,
      profilePictureUrl: data.profilePictureUrl ?? null,
    };
  } catch {
    return null;
  }
}

/** 20154 → "20,1 mil"; 980 → "980". */
export function formatFollowers(count: number): string {
  if (count < 1000) return String(count);
  const thousands = count / 1000;
  const rounded = thousands >= 100 ? Math.round(thousands) : Math.round(thousands * 10) / 10;
  return `${rounded.toLocaleString("pt-BR")} mil`;
}
