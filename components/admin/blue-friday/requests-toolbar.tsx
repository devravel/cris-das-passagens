"use client";

import { usePathname, useRouter } from "next/navigation";
import { Download, Loader2, Search } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { exportBlueFridayRequestsAction } from "@/app/admin/(protected)/blue-friday/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const CSV_COLUMNS = [
  ["passport", "Passaporte"],
  ["name", "Nome"],
  ["phone", "WhatsApp"],
  ["destination", "Destino"],
  ["departureCity", "Saída"],
  ["when", "Quando"],
  ["passengers", "Passageiros"],
  ["budget", "Orçamento"],
  ["payment", "Pagamento"],
  ["targetPrice", "Valor que compraria"],
  ["createdAt", "Data do pedido"],
] as const;

type RequestsToolbarProps = {
  search: string;
  destinationKey: string;
  destinationOptions: { value: string; label: string }[];
  canExport: boolean;
};

/** Busca + filtro por destino (na URL, a tabela é renderizada no servidor) e exportação CSV. */
export function RequestsToolbar({ search, destinationKey, destinationOptions, canExport }: RequestsToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [term, setTerm] = useState(search);
  const [isExporting, startExport] = useTransition();

  function applyFilters(next: { q?: string; destino?: string }) {
    const params = new URLSearchParams();
    const q = next.q ?? term;
    const destino = next.destino ?? destinationKey;
    if (q.trim()) params.set("q", q.trim());
    if (destino) params.set("destino", destino);
    router.push(params.size ? `${pathname}?${params}` : pathname);
  }

  function handleExport() {
    startExport(async () => {
      const result = await exportBlueFridayRequestsAction();

      if (!result.ok || !result.data) {
        toast.error(result.message);
        return;
      }

      const rows = result.data.map((row) => CSV_COLUMNS.map(([key]) => row[key]));
      const csv = [CSV_COLUMNS.map(([, label]) => label), ...rows]
        .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
        .join("\n");

      // BOM: Excel abre com acentos certos.
      const url = URL.createObjectURL(new Blob(["﻿", csv], { type: "text/csv;charset=utf-8;" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "blue-friday-pedidos.csv";
      link.click();
      URL.revokeObjectURL(url);

      toast.success(result.message);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <form
        className="flex min-w-0 flex-1 gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          applyFilters({});
        }}
      >
        <Input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Buscar por nome, WhatsApp ou nº do passaporte..."
          className="h-10 min-w-0 max-w-md rounded-xl"
          aria-label="Buscar pedidos"
        />
        <Button type="submit" variant="outline" className="h-10 rounded-xl" aria-label="Buscar">
          <Search className="size-4" aria-hidden />
        </Button>
      </form>
      <Select
        aria-label="Filtrar por destino"
        value={destinationKey}
        onChange={(value) => applyFilters({ destino: value })}
        options={[{ value: "", label: "Todos os destinos" }, ...destinationOptions]}
        className="w-56"
      />
      <Button
        type="button"
        variant="outline"
        className="h-10 rounded-xl"
        disabled={isExporting || !canExport}
        onClick={handleExport}
      >
        {isExporting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Download className="size-4" aria-hidden />}
        Exportar CSV
      </Button>
    </div>
  );
}
