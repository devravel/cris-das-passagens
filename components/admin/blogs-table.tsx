"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, PencilLine, Plus, Star, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  deleteBlogPostAction,
  setBlogPostFeaturedAction,
  setBlogPostPublishedAction,
} from "@/app/admin/(protected)/blogs/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type BlogListItem = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  featuredOnHomepage: boolean;
  createdAt: string;
  updatedAt: string;
};

type BlogsTableProps = {
  posts: BlogListItem[];
};

export function BlogsTable({ posts }: BlogsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function formatDate(value: string) {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  }

  function handleTogglePublish(id: string, published: boolean) {
    startTransition(async () => {
      const result = await setBlogPostPublishedAction(id, !published);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  }

  function handleToggleFeatured(id: string, featuredOnHomepage: boolean, published: boolean) {
    if (!published && !featuredOnHomepage) {
      toast.error("Publique o post antes de destacá-lo na homepage.");
      return;
    }

    startTransition(async () => {
      const result = await setBlogPostFeaturedAction(id, !featuredOnHomepage);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  }

  function handleConfirmDelete(id: string) {
    setDeleteId(id);
  }

  function handleDelete() {
    if (!deleteId) return;

    startTransition(async () => {
      const result = await deleteBlogPostAction(deleteId);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setDeleteId(null);
      router.refresh();
    });
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-border/70 bg-card/80 p-6 text-center shadow-sm">
        <p className="text-sm text-muted-foreground">Nenhum post cadastrado ainda.</p>
        <Button asChild className="mt-4 rounded-xl">
          <Link href="/admin/blogs/new">
            <Plus className="size-4" aria-hidden />
            Criar primeiro post
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card/90 shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Título</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Homepage</th>
              <th className="px-4 py-3 font-medium">Criado</th>
              <th className="px-4 py-3 font-medium">Atualizado</th>
              <th className="px-4 py-3 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-t border-border/70">
                <td className="px-4 py-3">
                  <div className="space-y-0.5">
                    <p className="font-medium text-foreground">{post.title}</p>
                    <p className="text-xs text-muted-foreground">/{post.slug}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                      post.published
                        ? "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                    onClick={() => handleTogglePublish(post.id, post.published)}
                    disabled={isPending}
                  >
                    {post.published ? "Publicado" : "Rascunho"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                      post.featuredOnHomepage
                        ? "bg-brand/15 text-brand hover:bg-brand/20"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    } ${!post.published ? "cursor-not-allowed opacity-60" : ""}`}
                    onClick={() =>
                      handleToggleFeatured(post.id, post.featuredOnHomepage, post.published)
                    }
                    disabled={isPending || !post.published}
                    aria-label={
                      post.featuredOnHomepage
                        ? "Remover destaque da homepage"
                        : "Destacar na homepage"
                    }
                  >
                    <Star
                      className={`size-3.5 ${post.featuredOnHomepage ? "fill-current" : ""}`}
                      aria-hidden
                    />
                    {post.featuredOnHomepage ? "Destaque" : "Normal"}
                  </button>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(post.createdAt)}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(post.updatedAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button asChild size="sm" variant="outline" className="rounded-lg">
                      <Link href={`/admin/blogs/${post.id}/edit`}>
                        <PencilLine className="size-4" aria-hidden />
                        Editar
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="rounded-lg"
                      onClick={() => handleConfirmDelete(post.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="size-4" aria-hidden />
                      Excluir
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Excluir post?</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. O conteúdo será removido permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} className="rounded-lg">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="rounded-lg">
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Excluindo...
                </>
              ) : (
                "Excluir post"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
