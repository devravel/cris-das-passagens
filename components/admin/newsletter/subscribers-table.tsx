"use client";

import { useRouter } from "next/navigation";
import { Download, Loader2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { exportNewsletterSubscribersAction } from "@/app/admin/(protected)/newsletter/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminNewsletterSubscriberRow } from "@/lib/newsletter/types";

type SubscribersTableProps = {
  subscribers: AdminNewsletterSubscriberRow[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

export function SubscribersTable({ subscribers }: SubscribersTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");

  const filteredSubscribers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return subscribers;
    }

    return subscribers.filter((subscriber) => {
      return (
        subscriber.name.toLowerCase().includes(term) ||
        subscriber.email.toLowerCase().includes(term) ||
        subscriber.phone.includes(term) ||
        String(subscriber.registrationNumber).includes(term)
      );
    });
  }, [subscribers, search]);

  function handleExport() {
    startTransition(async () => {
      const result = await exportNewsletterSubscribersAction();

      if (!result.ok || !result.data) {
        toast.error(result.message);
        return;
      }

      const headers = ["Número", "Nome", "E-mail", "Telefone", "Data"];
      const rows = result.data.map((subscriber) => [
        subscriber.registrationNumber,
        subscriber.name,
        subscriber.email,
        subscriber.phone,
        subscriber.createdAt,
      ]);

      const csv = [headers, ...rows]
        .map((row) =>
          row
            .map((value) => `"${String(value).replaceAll('"', '""')}"`)
            .join(","),
        )
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "newsletter-inscritos.csv";
      link.click();
      URL.revokeObjectURL(url);

      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nome, e-mail, telefone ou número..."
          className="h-10 max-w-md rounded-xl"
          aria-label="Buscar inscritos da newsletter"
        />
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-xl"
          disabled={isPending || subscribers.length === 0}
          onClick={handleExport}
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Download className="size-4" aria-hidden />
          )}
          Exportar CSV
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/70">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">E-mail</th>
              <th className="px-4 py-3 font-medium">Telefone</th>
              <th className="px-4 py-3 font-medium">Data</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubscribers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Nenhum inscrito encontrado.
                </td>
              </tr>
            ) : (
              filteredSubscribers.map((subscriber) => (
                <tr
                  key={subscriber.id}
                  className="border-t border-border/60 text-foreground"
                >
                  <td className="px-4 py-3 font-medium">
                    #{subscriber.registrationNumber}
                  </td>
                  <td className="px-4 py-3">{subscriber.name}</td>
                  <td className="px-4 py-3">{subscriber.email}</td>
                  <td className="px-4 py-3">{subscriber.phone}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDate(subscriber.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
