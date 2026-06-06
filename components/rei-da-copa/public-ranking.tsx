import { Medal } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ReiDaCopaPublicRankingEntry } from "@/lib/rei-da-copa/types";
import { cn } from "@/lib/utils";

type PublicRankingProps = {
  entries: ReiDaCopaPublicRankingEntry[];
};

function formatPointsLabel(points: number) {
  return `${points} ${points === 1 ? "ponto" : "pontos"}`;
}

function positionBadgeClassName(position: number) {
  if (position === 1) {
    return "bg-amber-500/15 text-amber-700";
  }

  if (position === 2) {
    return "bg-slate-500/15 text-slate-700";
  }

  if (position === 3) {
    return "bg-orange-600/15 text-orange-800";
  }

  return "bg-muted text-muted-foreground";
}

export function PublicRanking({ entries }: PublicRankingProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-border/70 bg-card/80 p-6 text-center shadow-sm">
        <p className="text-sm text-muted-foreground">
          O ranking será publicado em breve. Inscreva-se e acompanhe as atualizações.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden min-w-0 overflow-x-auto rounded-2xl border border-border/70 bg-card/90 shadow-sm lg:block">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">
                #
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Nome
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Instagram
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-right">
                Pontos
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={`${entry.position}-${entry.name}`} className="border-t border-border/70">
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex min-w-9 items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold",
                      positionBadgeClassName(entry.position),
                    )}
                  >
                    #{entry.position}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-foreground">{entry.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{entry.instagram}</td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums text-foreground">
                  {formatPointsLabel(entry.points)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 lg:hidden" role="list">
        {entries.map((entry) => (
          <li key={`${entry.position}-${entry.name}`}>
            <Card className="rounded-2xl border-border/70 bg-card/90 shadow-sm">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <p className="truncate text-base font-semibold text-foreground">
                      {entry.name}
                    </p>
                    <p className="break-all text-sm text-muted-foreground">{entry.instagram}</p>
                    <p className="text-sm font-semibold tabular-nums text-foreground">
                      {formatPointsLabel(entry.points)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold",
                      positionBadgeClassName(entry.position),
                    )}
                  >
                    #{entry.position}
                  </span>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}

export function PublicRankingSection({
  entries,
}: PublicRankingProps) {
  return (
    <Card className="rounded-2xl border-border/70 bg-card/90 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Medal className="size-5 text-brand" aria-hidden />
          Ranking Rei da Copa
        </CardTitle>
        <CardDescription>
          Classificação atual dos participantes, atualizada pela equipe da campanha.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PublicRanking entries={entries} />
      </CardContent>
    </Card>
  );
}
