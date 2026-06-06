import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  REI_DA_COPA_KEYWORD_NOT_FOUND_MESSAGE,
  REI_DA_COPA_PARTICIPANT_NOT_FOUND_MESSAGE,
} from "@/lib/rei-da-copa/constants";
import { reiDaCopaKeywordsService } from "@/lib/rei-da-copa/keywords.service";
import { reiDaCopaParticipantsService } from "@/lib/rei-da-copa/participants.service";
import { ReiDaCopaSubmissionError } from "@/lib/rei-da-copa/submission-errors";
import type {
  DailyKeywordSubmissionDto,
  KeywordSubmissionDto,
  KeywordSubmissionListFilterDto,
  KeywordStatusUpdateDto,
} from "@/lib/rei-da-copa/schemas";
import type {
  PaginatedResult,
  ReiDaCopaKeywordSubmissionEntity,
  ReiDaCopaKeywordSubmissionWithParticipant,
} from "@/lib/rei-da-copa/types";

const keywordSubmissionSelect = {
  id: true,
  participantId: true,
  keyword: true,
  status: true,
  createdAt: true,
} as const;

const keywordSubmissionWithParticipantSelect = {
  ...keywordSubmissionSelect,
  participant: {
    select: {
      id: true,
      registrationNumber: true,
      name: true,
      phone: true,
      instagram: true,
    },
  },
} as const;

function buildKeywordSubmissionWhere(
  filters: KeywordSubmissionListFilterDto,
): Prisma.ReiDaCopaKeywordSubmissionWhereInput {
  const where: Prisma.ReiDaCopaKeywordSubmissionWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.search?.trim()) {
    const term = filters.search.trim();

    where.OR = [
      { keyword: { contains: term, mode: "insensitive" } },
      {
        participant: {
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { instagram: { contains: term, mode: "insensitive" } },
            { phone: { contains: term } },
          ],
        },
      },
    ];
  }

  return where;
}

async function resolveKeywordSubmission(
  input: Pick<KeywordSubmissionDto, "phone" | "instagram" | "keyword">,
): Promise<{
  participant: NonNullable<
    Awaited<ReturnType<typeof reiDaCopaParticipantsService.findParticipantByPhoneOrInstagram>>
  >;
  keyword: string;
}> {
  const participant = await reiDaCopaParticipantsService.findParticipantByPhoneOrInstagram({
    phone: input.phone,
    instagram: input.instagram,
  });

  if (!participant) {
    throw new ReiDaCopaSubmissionError(REI_DA_COPA_PARTICIPANT_NOT_FOUND_MESSAGE, {
      status: 404,
      field: input.phone ? "phone" : "instagram",
    });
  }

  const officialKeyword = await reiDaCopaKeywordsService.findActiveKeyword(input.keyword);

  if (!officialKeyword) {
    throw new ReiDaCopaSubmissionError(REI_DA_COPA_KEYWORD_NOT_FOUND_MESSAGE, {
      status: 422,
      field: "keyword",
    });
  }

  return {
    participant,
    keyword: officialKeyword.value,
  };
}

export class ReiDaCopaKeywordSubmissionsService {
  async submitKeyword(
    input: KeywordSubmissionDto,
  ): Promise<ReiDaCopaKeywordSubmissionEntity> {
    const { participant, keyword } = await resolveKeywordSubmission(input);

    return prisma.reiDaCopaKeywordSubmission.create({
      data: {
        participantId: participant.id,
        keyword,
      },
      select: keywordSubmissionSelect,
    });
  }

  async submitDailyKeyword(
    input: DailyKeywordSubmissionDto,
  ): Promise<ReiDaCopaKeywordSubmissionEntity> {
    const { participant, keyword } = await resolveKeywordSubmission(input);

    return prisma.reiDaCopaKeywordSubmission.create({
      data: {
        participantId: participant.id,
        keyword,
      },
      select: keywordSubmissionSelect,
    });
  }

  async listSubmissions(
    filters: KeywordSubmissionListFilterDto,
  ): Promise<PaginatedResult<ReiDaCopaKeywordSubmissionWithParticipant>> {
    const where = buildKeywordSubmissionWhere(filters);
    const skip = (filters.page - 1) * filters.pageSize;

    const [total, submissions] = await Promise.all([
      prisma.reiDaCopaKeywordSubmission.count({ where }),
      prisma.reiDaCopaKeywordSubmission.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: filters.pageSize,
        select: keywordSubmissionWithParticipantSelect,
      }),
    ]);

    return {
      items: submissions,
      total,
      page: filters.page,
      pageSize: filters.pageSize,
      totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
    };
  }

  async getSubmissionById(id: string): Promise<ReiDaCopaKeywordSubmissionWithParticipant | null> {
    return prisma.reiDaCopaKeywordSubmission.findUnique({
      where: { id },
      select: keywordSubmissionWithParticipantSelect,
    });
  }

  async updateSubmissionStatus(
    id: string,
    input: KeywordStatusUpdateDto,
  ): Promise<ReiDaCopaKeywordSubmissionWithParticipant> {
    const existing = await prisma.reiDaCopaKeywordSubmission.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new Error("Envio de palavra-chave não encontrado.");
    }

    return prisma.reiDaCopaKeywordSubmission.update({
      where: { id },
      data: {
        status: input.status,
      },
      select: keywordSubmissionWithParticipantSelect,
    });
  }
}

export const reiDaCopaKeywordSubmissionsService = new ReiDaCopaKeywordSubmissionsService();
