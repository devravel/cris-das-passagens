"use client";

import { useEffect, useRef } from "react";

import { registerPostViewAction } from "@/app/admin/(protected)/blogs/actions";

function alreadyCountedInSession(postId: string) {
  const key = `cris-blog-viewed:${postId}`;

  try {
    if (window.sessionStorage.getItem(key) === "1") {
      return true;
    }

    window.sessionStorage.setItem(key, "1");
    return false;
  } catch {
    // navegador sem sessionStorage: conta uma vez por montagem
    return false;
  }
}

export function BlogPostViewTracker({ postId }: { postId: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;

    if (alreadyCountedInSession(postId)) return;

    void registerPostViewAction(postId);
  }, [postId]);

  return null;
}
