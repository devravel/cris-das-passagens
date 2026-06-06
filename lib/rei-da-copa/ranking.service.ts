import { prisma } from "@/lib/prisma";
import type { RankingUpdateDto, RankingUpsertDto } from "@/lib/rei-da-copa/schemas";
import type {
  ReiDaCopaRankingEntity,
  ReiDaCopaRankingWithParticipant,
} from "@/lib/rei-da-copa/types";
import { formatParticipantInstagramForDisplay } from "@/lib/rei-da-copa/utils";

const rankingSelect = {
  id: true,
  participantId: true,
  points: true,
  position: true,
  updatedAt: true,
} as const;

const rankingWithParticipantSelect = {
  ...rankingSelect,
  participant: {
    select: {
      id: true,
      name: true,
      instagram: true,
    },
  },
} as const;

export class ReiDaCopaRankingService {
  async listRankingEntries(): Promise<ReiDaCopaRankingWithParticipant[]> {
    return prisma.reiDaCopaRanking.findMany({
      orderBy: [{ position: "asc" }, { points: "desc" }],
      select: rankingWithParticipantSelect,
    });
  }

  async getRankingEntryByParticipantId(
    participantId: string,
  ): Promise<ReiDaCopaRankingWithParticipant | null> {
    return prisma.reiDaCopaRanking.findUnique({
      where: { participantId },
      select: rankingWithParticipantSelect,
    });
  }

  async upsertRankingEntry(input: RankingUpsertDto): Promise<ReiDaCopaRankingWithParticipant> {
    const participant = await prisma.reiDaCopaParticipant.findUnique({
      where: { id: input.participantId },
      select: { id: true },
    });

    if (!participant) {
      throw new Error("Participante não encontrado.");
    }

    return prisma.reiDaCopaRanking.upsert({
      where: { participantId: input.participantId },
      create: {
        participantId: input.participantId,
        points: input.points,
        position: input.position,
      },
      update: {
        points: input.points,
        position: input.position,
      },
      select: rankingWithParticipantSelect,
    });
  }

  async updateRankingEntry(
    participantId: string,
    input: RankingUpdateDto,
  ): Promise<ReiDaCopaRankingWithParticipant> {
    const existing = await prisma.reiDaCopaRanking.findUnique({
      where: { participantId },
      select: { id: true },
    });

    if (!existing) {
      throw new Error("Participante ainda não está no ranking.");
    }

    return prisma.reiDaCopaRanking.update({
      where: { participantId },
      data: {
        points: input.points,
        position: input.position,
      },
      select: rankingWithParticipantSelect,
    });
  }

  async addPointsToRankingEntry(
    participantId: string,
    amount: number,
  ): Promise<ReiDaCopaRankingWithParticipant> {
    const existing = await prisma.reiDaCopaRanking.findUnique({
      where: { participantId },
      select: { id: true, points: true },
    });

    if (!existing) {
      throw new Error("Participante ainda não está no ranking.");
    }

    return prisma.reiDaCopaRanking.update({
      where: { participantId },
      data: {
        points: existing.points + amount,
      },
      select: rankingWithParticipantSelect,
    });
  }

  async removeRankingEntry(participantId: string): Promise<ReiDaCopaRankingEntity> {
    const existing = await prisma.reiDaCopaRanking.findUnique({
      where: { participantId },
      select: rankingSelect,
    });

    if (!existing) {
      throw new Error("Participante não está no ranking.");
    }

    return prisma.reiDaCopaRanking.delete({
      where: { participantId },
      select: rankingSelect,
    });
  }

  async getPublicRanking() {
    const entries = await this.listRankingEntries();

    return entries.map((entry) => ({
      position: entry.position,
      name: entry.participant.name,
      instagram: formatParticipantInstagramForDisplay(entry.participant.instagram),
      points: entry.points,
    }));
  }
}

export const reiDaCopaRankingService = new ReiDaCopaRankingService();
