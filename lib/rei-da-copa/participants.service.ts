import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  ParticipantListFilterDto,
  ParticipantRegistrationDto,
} from "@/lib/rei-da-copa/schemas";
import type {
  PaginatedResult,
  ReiDaCopaParticipantEntity,
  ReiDaCopaParticipantWithCounts,
} from "@/lib/rei-da-copa/types";
import { notifyNewReiDaCopaParticipant } from "@/lib/rei-da-copa/participant-notification";
import {
  formatParticipantInstagramForDisplay,
  formatParticipantPhoneForDisplay,
  normalizeParticipantInstagram,
  normalizeParticipantPhone,
} from "@/lib/rei-da-copa/utils";

const participantSelect = {
  id: true,
  registrationNumber: true,
  name: true,
  phone: true,
  instagram: true,
  createdAt: true,
  updatedAt: true,
} as const;

function buildParticipantSearchWhere(search?: string): Prisma.ReiDaCopaParticipantWhereInput | undefined {
  if (!search?.trim()) {
    return undefined;
  }

  const term = search.trim();
  const digits = normalizeParticipantPhone(term);
  const instagram = normalizeParticipantInstagram(term);

  const orFilters: Prisma.ReiDaCopaParticipantWhereInput[] = [
    { name: { contains: term, mode: "insensitive" } },
  ];

  if (digits) {
    orFilters.push({ phone: { contains: digits } });
  }

  if (instagram) {
    orFilters.push({ instagram: { contains: instagram, mode: "insensitive" } });
  }

  if (Number.isInteger(Number(term))) {
    orFilters.push({ registrationNumber: Number(term) });
  }

  return { OR: orFilters };
}

function getDuplicateParticipantError(error: unknown): string | null {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    const targets = Array.isArray(error.meta?.target)
      ? error.meta.target.map(String)
      : typeof error.meta?.target === "string"
        ? [error.meta.target]
        : [];

    if (targets.some((target) => target.includes("phone"))) {
      return "Este telefone já está cadastrado na campanha.";
    }

    if (targets.some((target) => target.includes("instagram"))) {
      return "Este Instagram já está cadastrado na campanha.";
    }

    return "Este participante já está cadastrado na campanha.";
  }

  return null;
}

export class ReiDaCopaParticipantsService {
  async registerParticipant(
    input: ParticipantRegistrationDto,
  ): Promise<ReiDaCopaParticipantEntity> {
    const phone = normalizeParticipantPhone(input.phone);
    const instagram = normalizeParticipantInstagram(input.instagram);

    const existing = await prisma.reiDaCopaParticipant.findFirst({
      where: {
        OR: [{ phone }, { instagram }],
      },
      select: {
        phone: true,
        instagram: true,
      },
    });

    if (existing) {
      if (existing.phone === phone) {
        throw new Error("Este telefone já está cadastrado na campanha.");
      }

      throw new Error("Este Instagram já está cadastrado na campanha.");
    }

    let participant: ReiDaCopaParticipantEntity;

    try {
      participant = await prisma.reiDaCopaParticipant.create({
        data: {
          name: input.name,
          phone,
          instagram,
        },
        select: participantSelect,
      });
    } catch (error) {
      const duplicateMessage = getDuplicateParticipantError(error);

      if (duplicateMessage) {
        throw new Error(duplicateMessage);
      }

      throw error;
    }

    await notifyNewReiDaCopaParticipant(participant);

    return participant;
  }

  async findParticipantByPhoneOrInstagram(params: {
    phone?: string;
    instagram?: string;
  }): Promise<ReiDaCopaParticipantEntity | null> {
    const phone = params.phone ? normalizeParticipantPhone(params.phone) : undefined;
    const instagram = params.instagram
      ? normalizeParticipantInstagram(params.instagram)
      : undefined;

    if (!phone && !instagram) {
      return null;
    }

    return prisma.reiDaCopaParticipant.findFirst({
      where: {
        OR: [
          ...(phone ? [{ phone }] : []),
          ...(instagram ? [{ instagram }] : []),
        ],
      },
      select: participantSelect,
    });
  }

  async getParticipantById(id: string): Promise<ReiDaCopaParticipantWithCounts | null> {
    const participant = await prisma.reiDaCopaParticipant.findUnique({
      where: { id },
      select: {
        ...participantSelect,
        _count: {
          select: {
            keywordSubmissions: true,
          },
        },
        ranking: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!participant) {
      return null;
    }

    return {
      id: participant.id,
      registrationNumber: participant.registrationNumber,
      name: participant.name,
      phone: participant.phone,
      instagram: participant.instagram,
      createdAt: participant.createdAt,
      updatedAt: participant.updatedAt,
      keywordSubmissionCount: participant._count.keywordSubmissions,
      hasRanking: Boolean(participant.ranking),
    };
  }

  async listParticipants(
    filters: ParticipantListFilterDto,
  ): Promise<PaginatedResult<ReiDaCopaParticipantWithCounts>> {
    const where = buildParticipantSearchWhere(filters.search);
    const skip = (filters.page - 1) * filters.pageSize;

    const [total, participants] = await Promise.all([
      prisma.reiDaCopaParticipant.count({ where }),
      prisma.reiDaCopaParticipant.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: filters.pageSize,
        select: {
          ...participantSelect,
          _count: {
            select: {
              keywordSubmissions: true,
            },
          },
          ranking: {
            select: {
              id: true,
            },
          },
        },
      }),
    ]);

    return {
      items: participants.map((participant) => ({
        id: participant.id,
        registrationNumber: participant.registrationNumber,
        name: participant.name,
        phone: participant.phone,
        instagram: participant.instagram,
        createdAt: participant.createdAt,
        updatedAt: participant.updatedAt,
        keywordSubmissionCount: participant._count.keywordSubmissions,
        hasRanking: Boolean(participant.ranking),
      })),
      total,
      page: filters.page,
      pageSize: filters.pageSize,
      totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
    };
  }

  async exportParticipants(): Promise<
    Array<{
      registrationNumber: number;
      name: string;
      phone: string;
      instagram: string;
      createdAt: string;
    }>
  > {
    const participants = await prisma.reiDaCopaParticipant.findMany({
      orderBy: { registrationNumber: "asc" },
      select: participantSelect,
    });

    return participants.map((participant) => ({
      registrationNumber: participant.registrationNumber,
      name: participant.name,
      phone: formatParticipantPhoneForDisplay(participant.phone),
      instagram: formatParticipantInstagramForDisplay(participant.instagram),
      createdAt: participant.createdAt.toISOString(),
    }));
  }
}

export const reiDaCopaParticipantsService = new ReiDaCopaParticipantsService();
