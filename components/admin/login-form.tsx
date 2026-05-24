"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type LoginFormProps = {
  redirectTo: string;
};

type LoginResponse = {
  ok: boolean;
  error?: string;
  redirectTo?: string;
};

export function AdminLoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const defaultEmail = useMemo(() => "", []);

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      setError(null);

      const email = String(formData.get("email") ?? "").trim();
      const password = String(formData.get("password") ?? "");

      try {
        const response = await fetch("/api/admin/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            redirectTo,
          }),
        });

        const data = (await response.json()) as LoginResponse;

        if (!response.ok || !data.ok) {
          setError(data.error ?? "Nao foi possivel entrar com essas credenciais.");
          return;
        }

        const nextPath = data.redirectTo ?? "/admin";
        router.replace(nextPath);
        router.refresh();
      } catch {
        setError("Erro de conexao. Verifique sua internet e tente novamente.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground" htmlFor="email">
          E-mail
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="admin@crisdaspassagens.com.br"
          defaultValue={defaultEmail}
          required
          className="h-10 rounded-xl px-3"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground" htmlFor="password">
          Senha
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Digite sua senha"
          required
          className="h-10 rounded-xl px-3"
        />
      </div>

      <div
        aria-live="polite"
        className={cn(
          "min-h-5 text-sm text-destructive transition-opacity",
          error ? "opacity-100" : "opacity-0",
        )}
      >
        {error ?? " "}
      </div>

      <Button type="submit" className="h-10 w-full rounded-xl text-sm" disabled={isPending}>
        {isPending ? "Entrando..." : "Entrar no painel"}
      </Button>
    </form>
  );
}
