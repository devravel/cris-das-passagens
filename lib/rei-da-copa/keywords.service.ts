import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { CampaignKeywordCreateDto } from "@/lib/rei-da-copa/schemas";
import type { ReiDaCopaKeywordEntity } from "@/lib/rei-da-copa/types";
import { normalizeKeywordForLookup } from "@/lib/rei-da-copa/utils";

export const KEYWORD_ALREADY_ACTIVE_MESSAGE = "Esta palavra-chave já está ativa.";
export const KEYWORD_EXISTS_INACTIVE_MESSAGE =
  "Já existe uma palavra-chave com esse nome. Reative a palavra existente.";
export const KEYWORD_NOT_FOUND_MESSAGE = "Palavra-chave não encontrada.";

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

  async findKeywordByValue(value: string): Promise<ReiDaCopaKeywordEntity | null> {
    const normalizedValue = normalizeKeywordForLookup(value);

    if (!normalizedValue) {
      return null;
    }

    return prisma.reiDaCopaKeyword.findUnique({
      where: { value: normalizedValue },
      select: keywordSelect,
    });
  }

  async createKeyword(input: CampaignKeywordCreateDto): Promise<ReiDaCopaKeywordEntity> {
    const value = normalizeKeywordForLookup(input.value);
    const existing = await this.findKeywordByValue(value);

    if (existing?.isActive) {
      throw new Error(KEYWORD_ALREADY_ACTIVE_MESSAGE);
    }

    if (existing) {
      throw new Error(KEYWORD_EXISTS_INACTIVE_MESSAGE);
    }

    try {
      return await prisma.$transaction(async (tx) => {
        await tx.reiDaCopaKeyword.updateMany({
          where: { isActive: true },
          data: { isActive: false },
        });

        return tx.reiDaCopaKeyword.create({
          data: { value, isActive: true },
          select: keywordSelect,
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new Error(KEYWORD_ALREADY_ACTIVE_MESSAGE);
      }

      throw error;
    }
  }

  async activateKeyword(id: string): Promise<ReiDaCopaKeywordEntity> {
    const existing = await prisma.reiDaCopaKeyword.findUnique({
      where: { id },
      select: keywordSelect,
    });

    if (!existing) {
      throw new Error(KEYWORD_NOT_FOUND_MESSAGE);
    }

    if (existing.isActive) {
      return existing;
    }

    return prisma.$transaction(async (tx) => {
      await tx.reiDaCopaKeyword.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });

      return tx.reiDaCopaKeyword.update({
        where: { id },
        data: { isActive: true },
        select: keywordSelect,
      });
    });
  }

  async deactivateKeyword(id: string): Promise<ReiDaCopaKeywordEntity> {
    const existing = await prisma.reiDaCopaKeyword.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new Error(KEYWORD_NOT_FOUND_MESSAGE);
    }

    return prisma.reiDaCopaKeyword.update({
      where: { id },
      data: { isActive: false },
      select: keywordSelect,
    });
  }

  async deleteKeyword(id: string): Promise<void> {
    const existing = await prisma.reiDaCopaKeyword.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new Error(KEYWORD_NOT_FOUND_MESSAGE);
    }

    await prisma.reiDaCopaKeyword.delete({
      where: { id },
    });
  }
}

export const reiDaCopaKeywordsService = new ReiDaCopaKeywordsService();
