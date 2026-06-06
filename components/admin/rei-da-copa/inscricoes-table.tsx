"use client";

import { useRouter } from "next/navigation";
import { Download, Loader2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { exportReiDaCopaParticipantsAction } from "@/app/admin/(protected)/rei-da-copa/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminReiDaCopaParticipantRow } from "@/lib/rei-da-copa/types";

type InscricoesTableProps = {
  participants: AdminReiDaCopaParticipantRow[];
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

export function InscricoesTable({ participants }: InscricoesTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");

  const filteredParticipants = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return participants;
    }

    return participants.filter((participant) => {
      return (
        participant.name.toLowerCase().includes(term) ||
        participant.phone.includes(term) ||
        participant.instagram.toLowerCase().includes(term) ||
        String(participant.registrationNumber).includes(term)
      );
    });
  }, [participants, search]);

  function handleExport() {
    startTransition(async () => {
      const result = await exportReiDaCopaParticipantsAction();

      if (!result.ok || !result.data) {
        toast.error(result.message);
        return;
      }

      const headers = ["Número", "Nome", "Telefone", "Instagram", "Data"];
      const rows = result.data.map((participant) => [
        participant.registrationNumber,
        participant.name,
        participant.phone,
        participant.instagram,
        participant.createdAt,
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
      link.download = "rei-da-copa-inscricoes.csv";
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
          placeholder="Buscar por nome, telefone, Instagram ou número..."
          className="h-10 max-w-md rounded-xl"
          aria-label="Buscar inscrições"
        />
        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          onClick={handleExport}
          disabled={isPending || participants.length === 0}
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Download className="size-4" aria-hidden />
          )}
          Exportar CSV
        </Button>
      </div>

      {filteredParticipants.length === 0 ? (
        <div className="rounded-2xl border border-border/70 bg-card/80 p-6 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">
            {participants.length === 0
              ? "Nenhuma inscrição cadastrada ainda."
              : "Nenhuma inscrição encontrada para a busca atual."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card/90 shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Número</th>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Telefone</th>
                <th className="px-4 py-3 font-medium">Instagram</th>
                <th className="px-4 py-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.map((participant) => (
                <tr key={participant.id} className="border-t border-border/70">
                  <td className="px-4 py-3 font-medium text-foreground">
                    #{participant.registrationNumber}
                  </td>
                  <td className="px-4 py-3 text-foreground">{participant.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{participant.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground">{participant.instagram}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(participant.createdAt)}
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
