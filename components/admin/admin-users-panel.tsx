"use client";

import { useRouter } from "next/navigation";
import { Check, KeyRound, Loader2, PencilLine, Plus, Trash2, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  createAdminUserAction,
  deleteAdminUserAction,
  renameAdminUserAction,
  updateAdminUserPasswordAction,
} from "@/app/admin/(protected)/usuarios/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
};

type AdminUsersPanelProps = {
  users: AdminUserRow[];
  currentUserId: string;
};

const emptyForm = { name: "", email: "", password: "" };

/** Criar acesso de vendedor, trocar senha e remover. Sem níveis de permissão. */
export function AdminUsersPanel({ users, currentUserId }: AdminUsersPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(emptyForm);
  const [passwordFor, setPasswordFor] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  function run(action: () => Promise<{ ok: boolean; message: string }>, after?: () => void) {
    startTransition(async () => {
      const result = await action();

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      after?.();
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <ul className="divide-y divide-border/60 rounded-2xl border border-border/70 bg-card/90 shadow-sm">
        {users.map((user) => (
          <li key={user.id} className="space-y-3 px-4 py-3">
            <div className="flex flex-wrap items-center gap-3">
              {editingId === user.id ? (
                <>
                  <Input
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        run(() => renameAdminUserAction(user.id, editingName), () => setEditingId(null));
                      }
                      if (event.key === "Escape") setEditingId(null);
                    }}
                    className="h-9 max-w-xs rounded-lg"
                    aria-label="Nome do vendedor"
                    autoFocus
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-lg"
                    onClick={() => run(() => renameAdminUserAction(user.id, editingName), () => setEditingId(null))}
                    disabled={isPending}
                  >
                    <Check className="size-4" aria-hidden />
                    Salvar
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    className="rounded-lg"
                    aria-label="Cancelar"
                    onClick={() => setEditingId(null)}
                  >
                    <X className="size-4" aria-hidden />
                  </Button>
                </>
              ) : (
              <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {user.name || "Sem nome"}
                  {user.id === currentUserId ? (
                    <span className="ml-2 rounded-md bg-brand/10 px-1.5 py-0.5 text-xs font-normal text-brand">
                      você
                    </span>
                  ) : null}
                </p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="rounded-lg"
                  aria-label={`Editar nome de ${user.name || user.email}`}
                  onClick={() => {
                    setEditingId(user.id);
                    setEditingName(user.name);
                  }}
                  disabled={isPending}
                >
                  <PencilLine className="size-4" aria-hidden />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="rounded-lg"
                  onClick={() => {
                    setPasswordFor(passwordFor === user.id ? null : user.id);
                    setNewPassword("");
                  }}
                  disabled={isPending}
                >
                  <KeyRound className="size-4" aria-hidden />
                  Trocar senha
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="rounded-lg text-destructive hover:text-destructive"
                  aria-label={`Remover acesso de ${user.name || user.email}`}
                  onClick={() => {
                    if (
                      window.confirm(
                        `Remover o acesso de ${user.name || user.email}? Os roteiros e pacotes criados continuam no site.`,
                      )
                    ) {
                      run(() => deleteAdminUserAction(user.id));
                    }
                  }}
                  disabled={isPending || user.id === currentUserId}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </div>
              </>
              )}
            </div>

            {passwordFor === user.id ? (
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      run(() => updateAdminUserPasswordAction(user.id, newPassword), () =>
                        setPasswordFor(null),
                      );
                    }
                    if (event.key === "Escape") setPasswordFor(null);
                  }}
                  placeholder="Nova senha (mínimo 8 caracteres)"
                  autoComplete="new-password"
                  className="h-10 max-w-xs rounded-xl"
                  autoFocus
                />
                <Button
                  type="button"
                  size="sm"
                  className="h-10 rounded-xl"
                  onClick={() =>
                    run(() => updateAdminUserPasswordAction(user.id, newPassword), () =>
                      setPasswordFor(null),
                    )
                  }
                  disabled={isPending || newPassword.length < 8}
                >
                  Salvar senha
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="rounded-lg"
                  aria-label="Cancelar troca de senha"
                  onClick={() => setPasswordFor(null)}
                >
                  <X className="size-4" aria-hidden />
                </Button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      <form
        className="space-y-3 rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm sm:p-5"
        onSubmit={(event) => {
          event.preventDefault();
          run(() => createAdminUserAction(form), () => setForm(emptyForm));
        }}
      >
        <div className="space-y-1">
          <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">
            Novo usuário
          </h2>
          <p className="text-xs text-muted-foreground">
            O nome vai junto no e-mail de cotação dos roteiros desse vendedor.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label htmlFor="user-name" className="text-xs text-muted-foreground">
              Nome
            </label>
            <Input
              id="user-name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Ex.: Maria Silva"
              className="h-10 rounded-xl"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="user-email" className="text-xs text-muted-foreground">
              E-mail
            </label>
            <Input
              id="user-email"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="maria@crisdaspassagens.com.br"
              autoComplete="off"
              className="h-10 rounded-xl"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="user-password" className="text-xs text-muted-foreground">
              Senha
            </label>
            <Input
              id="user-password"
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              minLength={8}
              className="h-10 rounded-xl"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="outline"
          className="h-10 rounded-xl border-border/70"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Plus className="size-4" aria-hidden />
          )}
          Criar usuário
        </Button>
      </form>
    </div>
  );
}
