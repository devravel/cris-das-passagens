"use client";

import { useRouter } from "next/navigation";
import { Loader2, PencilLine, Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  addReiDaCopaRankingPointsAction,
  removeReiDaCopaRankingEntryAction,
  updateReiDaCopaRankingEntryAction,
  upsertReiDaCopaRankingEntryAction,
} from "@/app/admin/(protected)/rei-da-copa/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RANKING_POINT_INCREMENTS } from "@/lib/rei-da-copa/schemas";
import type {
  AdminReiDaCopaRankingRow,
  AdminReiDaCopaUnrankedParticipant,
} from "@/lib/rei-da-copa/types";

type RankingTableProps = {
  entries: AdminReiDaCopaRankingRow[];
  unrankedParticipants: AdminReiDaCopaUnrankedParticipant[];
};

type EditState = {
  participantId: string;
  name: string;
  position: string;
  points: string;
};

export function RankingTable({ entries, unrankedParticipants }: RankingTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editState, setEditState] = useState<EditState | null>(null);
  const [removeParticipantId, setRemoveParticipantId] = useState<string | null>(null);
  const [selectedParticipantId, setSelectedParticipantId] = useState("");
  const [newPosition, setNewPosition] = useState("1");
  const [newPoints, setNewPoints] = useState("0");

  function handleAddPoints(participantId: string, amount: number) {
    startTransition(async () => {
      const result = await addReiDaCopaRankingPointsAction(participantId, { amount });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  }

  function handleOpenEdit(entry: AdminReiDaCopaRankingRow) {
    setEditState({
      participantId: entry.participantId,
      name: entry.name,
      position: String(entry.position),
      points: String(entry.points),
    });
  }

  function handleSaveEdit() {
    if (!editState) {
      return;
    }

    startTransition(async () => {
      const result = await updateReiDaCopaRankingEntryAction(editState.participantId, {
        position: Number(editState.position),
        points: Number(editState.points),
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setEditState(null);
      router.refresh();
    });
  }

  function handleAddParticipant() {
    if (!selectedParticipantId) {
      toast.error("Selecione um participante.");
      return;
    }

    startTransition(async () => {
      const result = await upsertReiDaCopaRankingEntryAction({
        participantId: selectedParticipantId,
        position: Number(newPosition),
        points: Number(newPoints),
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setSelectedParticipantId("");
      setNewPosition("1");
      setNewPoints("0");
      router.refresh();
    });
  }

  function handleRemove() {
    if (!removeParticipantId) {
      return;
    }

    startTransition(async () => {
      const result = await removeReiDaCopaRankingEntryAction(removeParticipantId);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setRemoveParticipantId(null);
      router.refresh();
    });
  }

  return (
    <>
      {unrankedParticipants.length > 0 ? (
        <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
          <p className="mb-3 text-sm font-medium text-foreground">Adicionar ao ranking</p>
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[220px] flex-1">
              <label className="mb-1.5 block text-xs text-muted-foreground">Participante</label>
              <select
                value={selectedParticipantId}
                onChange={(event) => setSelectedParticipantId(event.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Selecione...</option>
                {unrankedParticipants.map((participant) => (
                  <option key={participant.id} value={participant.id}>
                    #{participant.registrationNumber} — {participant.name} ({participant.instagram})
                  </option>
                ))}
              </select>
            </div>
            <div className="w-28">
              <label className="mb-1.5 block text-xs text-muted-foreground">Posição</label>
              <Input
                type="number"
                min={1}
                value={newPosition}
                onChange={(event) => setNewPosition(event.target.value)}
                className="h-10 rounded-xl"
              />
            </div>
            <div className="w-28">
              <label className="mb-1.5 block text-xs text-muted-foreground">Pontos</label>
              <Input
                type="number"
                min={0}
                value={newPoints}
                onChange={(event) => setNewPoints(event.target.value)}
                className="h-10 rounded-xl"
              />
            </div>
            <Button
              type="button"
              className="rounded-xl"
              onClick={handleAddParticipant}
              disabled={isPending}
            >
              <Plus className="size-4" aria-hidden />
              Adicionar
            </Button>
          </div>
        </div>
      ) : null}

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-border/70 bg-card/80 p-6 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">Nenhum participante no ranking ainda.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card/90 shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Posição</th>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Instagram</th>
                <th className="px-4 py-3 font-medium">Pontos</th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.participantId} className="border-t border-border/70">
                  <td className="px-4 py-3 font-medium text-foreground">#{entry.position}</td>
                  <td className="px-4 py-3 text-foreground">{entry.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{entry.instagram}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">{entry.points}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {RANKING_POINT_INCREMENTS.map((amount) => (
                        <Button
                          key={amount}
                          type="button"
                          size="sm"
                          variant="outline"
                          className="rounded-lg"
                          onClick={() => handleAddPoints(entry.participantId, amount)}
                          disabled={isPending}
                        >
                          +{amount}
                        </Button>
                      ))}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-lg"
                        onClick={() => handleOpenEdit(entry)}
                        disabled={isPending}
                      >
                        <PencilLine className="size-4" aria-hidden />
                        Editar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="rounded-lg"
                        onClick={() => setRemoveParticipantId(entry.participantId)}
                        disabled={isPending}
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={Boolean(editState)} onOpenChange={(open) => !open && setEditState(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Editar ranking</DialogTitle>
            <DialogDescription>
              Ajuste manualmente a posição e a pontuação de {editState?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <label className="mb-1.5 block text-xs text-muted-foreground">Posição</label>
              <Input
                type="number"
                min={1}
                value={editState?.position ?? ""}
                onChange={(event) =>
                  setEditState((current) =>
                    current ? { ...current, position: event.target.value } : current,
                  )
                }
                className="h-10 rounded-xl"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-muted-foreground">Pontos</label>
              <Input
                type="number"
                min={0}
                value={editState?.points ?? ""}
                onChange={(event) =>
                  setEditState((current) =>
                    current ? { ...current, points: event.target.value } : current,
                  )
                }
                className="h-10 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditState(null)} className="rounded-lg">
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} className="rounded-lg" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Salvando...
                </>
              ) : (
                "Salvar alterações"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(removeParticipantId)}
        onOpenChange={(open) => !open && setRemoveParticipantId(null)}
      >
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Remover do ranking?</DialogTitle>
            <DialogDescription>
              O participante será removido do ranking público. A inscrição permanece cadastrada.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemoveParticipantId(null)}
              className="rounded-lg"
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleRemove} className="rounded-lg" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Removendo...
                </>
              ) : (
                "Remover"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
