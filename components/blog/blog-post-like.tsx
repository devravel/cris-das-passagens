"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { togglePostLikeAction } from "@/app/admin/(protected)/blogs/actions";
import { cn } from "@/lib/utils";

const CLIENT_ID_STORAGE_KEY = "cris-blog-like-client-id";

type BlogPostLikeContextValue = {
  liked: boolean;
  likeCount: number;
  isPending: boolean;
  toggleLike: () => void;
};

const BlogPostLikeContext = createContext<BlogPostLikeContextValue | null>(null);

type BlogPostLikeProviderProps = {
  postId: string;
  initialLikeCount: number;
  children: ReactNode;
};

function getOrCreateClientId() {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = window.localStorage.getItem(CLIENT_ID_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const nextId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `client-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  window.localStorage.setItem(CLIENT_ID_STORAGE_KEY, nextId);
  return nextId;
}

function getLikedStorageKey(postId: string) {
  return `cris-blog-liked:${postId}`;
}

function readInitialLiked(postId: string) {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(getLikedStorageKey(postId)) === "1";
}

export function BlogPostLikeProvider({
  postId,
  initialLikeCount,
  children,
}: BlogPostLikeProviderProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [liked, setLiked] = useState(() => readInitialLiked(postId));
  const [isPending, startTransition] = useTransition();

  const toggleLike = useCallback(() => {
    const clientId = getOrCreateClientId();
    if (!clientId) return;

    startTransition(async () => {
      const result = await togglePostLikeAction(postId, clientId);

      if (!result.ok || !result.data) {
        toast.error(result.message);
        return;
      }

      setLiked(result.data.liked);
      setLikeCount(result.data.likeCount);
      window.localStorage.setItem(getLikedStorageKey(postId), result.data.liked ? "1" : "0");
    });
  }, [postId]);

  const value = useMemo(
    () => ({
      liked,
      likeCount,
      isPending,
      toggleLike,
    }),
    [liked, likeCount, isPending, toggleLike],
  );

  return <BlogPostLikeContext.Provider value={value}>{children}</BlogPostLikeContext.Provider>;
}

function useBlogPostLike() {
  const context = useContext(BlogPostLikeContext);

  if (!context) {
    throw new Error("BlogPostLikeButton must be used within BlogPostLikeProvider.");
  }

  return context;
}

type BlogPostLikeButtonProps = {
  className?: string;
  variant?: "default" | "sidebar";
};

export function BlogPostLikeButton({
  className,
  variant = "default",
}: BlogPostLikeButtonProps) {
  const { liked, likeCount, isPending, toggleLike } = useBlogPostLike();

  const likeCountLabel =
    likeCount === 1 ? "1 Curtida" : `${likeCount} Curtidas`;

  return (
    <button
      type="button"
      onClick={toggleLike}
      disabled={isPending}
      className={cn(
        "inline-flex items-center gap-2 text-sm font-medium text-foreground transition-all duration-200 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
        variant === "default" &&
          "rounded-full border border-border/70 bg-background px-3 py-2 hover:border-brand/30 hover:bg-brand/5",
        variant === "sidebar" &&
          "w-full rounded-lg border border-border/70 bg-background px-3 py-2 hover:border-brand/30 hover:bg-brand/5",
        liked && "border-brand/40 bg-brand/10 text-brand",
        className,
      )}
      aria-pressed={liked}
      aria-label={liked ? "Remover curtida" : "Curtir artigo"}
    >
      <Heart
        className={cn(
          "size-4 transition-transform duration-200",
          liked && "scale-110 fill-brand text-brand",
          isPending && "animate-pulse",
        )}
        aria-hidden
      />
      {variant === "sidebar" ? (
        <span>{likeCountLabel}</span>
      ) : (
        <>
          <span>{likeCount}</span>
          <span>{liked ? "Curtido" : "Curtir"}</span>
        </>
      )}
    </button>
  );
}
