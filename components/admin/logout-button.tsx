"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function AdminLogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleLogout() {
    startTransition(async () => {
      setError(null);

      try {
        const response = await fetch("/api/admin/auth/logout", {
          method: "POST",
        });

        if (!response.ok) {
          setError("Falha ao encerrar a sessao.");
          return;
        }

        router.replace("/admin/login");
        router.refresh();
      } catch {
        setError("Erro de conexao ao sair.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 rounded-xl px-3"
        disabled={isPending}
        onClick={handleLogout}
      >
        {isPending ? "Saindo..." : "Sair"}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
