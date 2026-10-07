"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  CheckCircle2, 
  Circle, 
  Loader2, 
  Package, 
  PencilLine, 
  Plus, 
  Search,
  Sparkles, 
  Trash2 
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  deletePackageAction,
  setPackageActiveAction,
} from "@/app/admin/(protected)/packages/actions";
import { PackageShareActions } from "@/components/packages/package-share-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { isOptimizableRemoteImage } from "@/lib/storage/image-src";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPackagePrice } from "@/lib/package/format";
import {
  PACKAGE_CATEGORY_LABELS,
  PACKAGE_TYPE_LABELS,
  PACKAGE_TYPES,
} from "@/lib/package/constants";
import type { AdminPackageListItem } from "@/lib/package/queries";
import { cn } from "@/lib/utils";

type PackagesGridProps = {
  packages: AdminPackageListItem[];
};

const STATUS_OPTIONS = [
  { value: "all", label: "Todos os status" },
  { value: "active", label: "Ativos" },
  { value: "inactive", label: "Inativos" },
  { value: "featured", label: "Em destaque" },
];

const TYPE_OPTIONS = [
  { value: "all", label: "Todos os tipos" },
  ...PACKAGE_TYPES.map((type) => ({ value: type, label: PACKAGE_TYPE_LABELS[type] })),
];

const SORT_OPTIONS = [
  { value: "newest", label: "Mais recentes" },
  { value: "oldest", label: "Mais antigos" },
  { value: "price-asc", label: "Menor preço" },
  { value: "price-desc", label: "Maior preço" },
  { value: "title", label: "Nome (A–Z)" },
];

/** Busca sem diferenciar acento nem maiúscula: "sao paulo" acha "São Paulo". */
function normalizeSearch(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

function filterPackages(
  packages: AdminPackageListItem[],
  { query, type, status, sort }: { query: string; type: string; status: string; sort: string },
) {
  const needle = normalizeSearch(query);
  const filtered = packages.filter((pkg) => {
    if (type !== "all" && pkg.type !== type) return false;
    if (status === "active" && !pkg.active) return false;
    if (status === "inactive" && pkg.active) return false;
    if (status === "featured" && !pkg.featured) return false;
    if (!needle) return true;
    return normalizeSearch(`${pkg.title} ${pkg.destination} ${pkg.slug}`).includes(needle);
  });

  return filtered.sort((a, b) => {
    switch (sort) {
      case "oldest":
        return a.createdAt.localeCompare(b.createdAt);
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "title":
        return a.title.localeCompare(b.title, "pt-BR");
      default:
        return b.createdAt.localeCompare(a.createdAt);
    }
  });
}

export function PackagesGrid({ packages }: PackagesGridProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // Padrão: busca vazia, tudo visível, mais recentes primeiro.
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const visiblePackages = useMemo(
    () => filterPackages(packages, { query, type, status, sort }),
    [packages, query, type, status, sort],
  );
  const hasFilters = query.trim() !== "" || type !== "all" || status !== "all";

  function clearFilters() {
    setQuery("");
    setType("all");
    setStatus("all");
  }

  function formatDate(value: string) {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  }

  function handleToggleActive(id: string, isActive: boolean) {
    setPendingId(id);
    startTransition(async () => {
      const result = await setPackageActiveAction(id, !isActive);

      if (!result.ok) {
        toast.error(result.message);
        setPendingId(null);
        return;
      }

      toast.success(result.message);
      setPendingId(null);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!deleteId) return;

    setPendingId(deleteId);
    startTransition(async () => {
      const result = await deletePackageAction(deleteId);

      if (!result.ok) {
        toast.error(result.message);
        setPendingId(null);
        return;
      }

      toast.success(result.message);
      setPendingId(null);
      setDeleteId(null);
      router.refresh();
    });
  }

  if (packages.length === 0) {
    return (
      <div className="rounded-2xl border border-border/70 bg-card/80 p-8 text-center shadow-sm">
        <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-2xl bg-brand/10 text-brand">
          <Package className="size-5" aria-hidden />
        </div>
        <p className="text-sm text-muted-foreground">Nenhum pacote cadastrado ainda.</p>
        <Button asChild className="mt-4 rounded-xl">
          <Link href="/admin/packages/new">
            <Plus className="size-4" aria-hidden />
            Criar primeiro pacote
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 rounded-xl border border-border/70 bg-card p-3 shadow-sm">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nome, destino ou link"
            aria-label="Buscar pacotes"
            className="h-10 rounded-xl pl-9"
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <Select value={type} onChange={setType} options={TYPE_OPTIONS} aria-label="Filtrar por tipo" />
          <Select
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
            aria-label="Filtrar por status"
          />
          <Select value={sort} onChange={setSort} options={SORT_OPTIONS} aria-label="Ordenar" />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span aria-live="polite">
            {visiblePackages.length === packages.length
              ? `${packages.length} pacotes`
              : `${visiblePackages.length} de ${packages.length} pacotes`}
          </span>
          {hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="font-medium text-brand underline-offset-2 hover:underline"
            >
              Limpar busca e filtros
            </button>
          ) : null}
        </div>
      </div>

      {visiblePackages.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
          Nenhum pacote encontrado com essa busca e filtros.
        </p>
      ) : null}

      <div className="mt-3 space-y-3">
        {visiblePackages.map((pkg) => {
          const isRowPending = pendingId === pkg.id && isPending;

          return (
            <article
              key={pkg.id}
              className={cn(
                "group flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-sm transition-all duration-200 hover:shadow-md sm:flex-row sm:items-center sm:gap-4",
                !pkg.active && "opacity-60",
                isRowPending && "pointer-events-none opacity-40",
              )}
            >
              {/* Thumbnail */}
              <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-16">
                {pkg.image ? (
                  <Image
                    src={pkg.image}
                    alt={pkg.title}
                    fill
                    sizes="80px"
                    unoptimized={!isOptimizableRemoteImage(pkg.image)}
                    className="object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <Package className="size-6 text-muted-foreground" aria-hidden />
                  </div>
                )}
              </div>

              {/* Main Info */}
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-start gap-2">
                    <h3 className="min-w-0 flex-1 text-base font-semibold text-foreground">
                      {pkg.title}
                    </h3>
                    <div className="flex shrink-0 flex-wrap gap-1.5">
                      {pkg.active ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          <CheckCircle2 className="size-3" aria-hidden />
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          <Circle className="size-3" aria-hidden />
                          Inativo
                        </span>
                      )}
                      {pkg.featured && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-400/20 px-2 py-0.5 text-xs font-medium text-amber-900">
                          <Sparkles className="size-3" aria-hidden />
                          Destaque
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="font-medium">{pkg.destination}</span>
                    <span aria-hidden>•</span>
                    <span>{PACKAGE_TYPE_LABELS[pkg.type]}</span>
                    {pkg.category && (
                      <>
                        <span aria-hidden>•</span>
                        <span>{PACKAGE_CATEGORY_LABELS[pkg.category]}</span>
                      </>
                    )}
                    <span aria-hidden>•</span>
                    <span className="font-semibold text-foreground">{formatPackagePrice(pkg.price)}</span>
                    <span aria-hidden>•</span>
                    <span>
                      Adicionado em <time dateTime={pkg.createdAt}>{formatDate(pkg.createdAt)}</time>
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
                <PackageShareActions title={pkg.title} slug={pkg.slug} compact />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="flex-1 rounded-lg sm:flex-initial sm:w-28"
                  disabled={isRowPending}
                  onClick={() => handleToggleActive(pkg.id, pkg.active)}
                >
                  {isRowPending ? (
                    <Loader2 className="size-3.5 animate-spin" aria-hidden />
                  ) : pkg.active ? (
                    <Circle className="size-3.5 sm:mr-1.5" aria-hidden />
                  ) : (
                    <CheckCircle2 className="size-3.5 sm:mr-1.5" aria-hidden />
                  )}
                  <span className="hidden sm:inline">{pkg.active ? "Desativar" : "Ativar"}</span>
                </Button>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="flex-1 rounded-lg sm:flex-initial sm:w-24"
                >
                  <Link href={`/admin/packages/${pkg.id}/edit`}>
                    <PencilLine className="size-3.5 sm:mr-1.5" aria-hidden />
                    <span className="hidden sm:inline">Editar</span>
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive sm:flex-initial sm:w-24"
                  onClick={() => setDeleteId(pkg.id)}
                  disabled={isRowPending}
                >
                  <Trash2 className="size-3.5 sm:mr-1.5" aria-hidden />
                  <span className="hidden sm:inline">Excluir</span>
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      <Dialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Excluir pacote?</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. O pacote será removido permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} className="rounded-lg">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="rounded-lg">
              {isPending && pendingId === deleteId ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Excluindo...
                </>
              ) : (
                "Excluir pacote"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
