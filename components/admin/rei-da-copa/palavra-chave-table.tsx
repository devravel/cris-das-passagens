"use client";

import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { updateReiDaCopaKeywordStatusAction } from "@/app/admin/(protected)/rei-da-copa/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { REI_DA_COPA_KEYWORD_STATUSES } from "@/lib/rei-da-copa/constants";
import type { AdminReiDaCopaKeywordRow } from "@/lib/rei-da-copa/types";

type PalavraChaveTableProps = {
  submissions: AdminReiDaCopaKeywordRow[];
};

const statusLabels = {
  PENDING: "Pendente",
  APPROVED: "Válida",
  REJECTED: "Inválida",
} as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusClassName(status: AdminReiDaCopaKeywordRow["status"]) {
  if (status === "APPROVED") {
    return "bg-emerald-500/15 text-emerald-700";
  }

  if (status === "REJECTED") {
    return "bg-destructive/10 text-destructive";
  }

  return "bg-amber-500/15 text-amber-700";
}

export function PalavraChaveTable({ submissions }: PalavraChaveTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredSubmissions = useMemo(() => {
    const term = search.trim().toLowerCase();

    return submissions.filter((submission) => {
      const matchesStatus =
        statusFilter === "ALL" || submission.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!term) {
        return true;
      }

      return (
        submission.participantName.toLowerCase().includes(term) ||
        submission.phone.includes(term) ||
        submission.instagram.toLowerCase().includes(term) ||
        submission.keyword.toLowerCase().includes(term)
      );
    });
  }, [search, statusFilter, submissions]);

  function handleUpdateStatus(id: string, status: "APPROVED" | "REJECTED") {
    startTransition(async () => {
      const result = await updateReiDaCopaKeywordStatusAction(id, { status });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por participante, telefone, Instagram ou palavra..."
          className="h-10 max-w-md rounded-xl"
          aria-label="Buscar envios de palavra-chave"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-label="Filtrar por status"
        >
          <option value="ALL">Todos os status</option>
          {REI_DA_COPA_KEYWORD_STATUSES.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </select>
      </div>

      {filteredSubmissions.length === 0 ? (
        <div className="rounded-2xl border border-border/70 bg-card/80 p-6 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">
            {submissions.length === 0
              ? "Nenhum envio de palavra-chave registrado ainda."
              : "Nenhum envio encontrado para os filtros atuais."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card/90 shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Participante</th>
                <th className="px-4 py-3 font-medium">Telefone</th>
                <th className="px-4 py-3 font-medium">Instagram</th>
                <th className="px-4 py-3 font-medium">Palavra enviada</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((submission) => (
                <tr key={submission.id} className="border-t border-border/70">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {submission.participantName}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{submission.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground">{submission.instagram}</td>
                  <td className="px-4 py-3 text-foreground">{submission.keyword}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(submission.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClassName(submission.status)}`}
                    >
                      {statusLabels[submission.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-lg"
                        onClick={() => handleUpdateStatus(submission.id, "APPROVED")}
                        disabled={isPending || submission.status === "APPROVED"}
                        aria-label="Marcar como válida"
                      >
                        {isPending ? (
                          <Loader2 className="size-4 animate-spin" aria-hidden />
                        ) : (
                          <Check className="size-4" aria-hidden />
                        )}
                        Válida
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="rounded-lg"
                        onClick={() => handleUpdateStatus(submission.id, "REJECTED")}
                        disabled={isPending || submission.status === "REJECTED"}
                        aria-label="Marcar como inválida"
                      >
                        {isPending ? (
                          <Loader2 className="size-4 animate-spin" aria-hidden />
                        ) : (
                          <X className="size-4" aria-hidden />
                        )}
                        Inválida
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
