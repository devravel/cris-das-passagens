import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { CampaignKeywordCreateDto } from "@/lib/rei-da-copa/schemas";
import type { ReiDaCopaKeywordEntity } from "@/lib/rei-da-copa/types";
import { normalizeKeywordForLookup } from "@/lib/rei-da-copa/utils";

const keywordSelect = {
  id: true,
  value: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class ReiDaCopaKeywordsService {
  async listKeywords(): Promise<ReiDaCopaKeywordEntity[]> {
    return prisma.reiDaCopaKeyword.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      select: keywordSelect,
    });
  }

  async listAllKeywords(): Promise<ReiDaCopaKeywordEntity[]> {
    return prisma.reiDaCopaKeyword.findMany({
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
      select: keywordSelect,
    });
  }

  async findActiveKeyword(value: string): Promise<ReiDaCopaKeywordEntity | null> {
    const normalizedValue = normalizeKeywordForLookup(value);

    if (!normalizedValue) {
      return null;
    }

    return prisma.reiDaCopaKeyword.findFirst({
      where: {
        value: normalizedValue,
        isActive: true,
      },
      select: keywordSelect,
    });
  }

  async createKeyword(input: CampaignKeywordCreateDto): Promise<ReiDaCopaKeywordEntity> {
    const value = normalizeKeywordForLookup(input.value);

    try {
      return await prisma.reiDaCopaKeyword.create({
        data: { value },
        select: keywordSelect,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new Error("Esta palavra-chave já está cadastrada.");
      }

      throw error;
    }
  }

  async deactivateKeyword(id: string): Promise<ReiDaCopaKeywordEntity> {
    const existing = await prisma.reiDaCopaKeyword.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new Error("Palavra-chave não encontrada.");
    }

    return prisma.reiDaCopaKeyword.update({
      where: { id },
      data: { isActive: false },
      select: keywordSelect,
    });
  }
}

export const reiDaCopaKeywordsService = new ReiDaCopaKeywordsService();
