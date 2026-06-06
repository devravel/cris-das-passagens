import { prisma } from "@/lib/prisma";
import { packageDateToIsoString, parseOptionalPackageDateInput } from "@/lib/package/dates";
import type { CampaignSettingsDto } from "@/lib/rei-da-copa/schemas";
import type { ReiDaCopaSettingsEntity } from "@/lib/rei-da-copa/types";

const SETTINGS_ID = "default";

const settingsSelect = {
  id: true,
  startDate: true,
  endDate: true,
  firstPlacePrize: true,
  secondPlacePrize: true,
  thirdPlacePrize: true,
  regulation: true,
  createdAt: true,
  updatedAt: true,
} as const;

function mapSettingsEntity(
  settings: {
    id: string;
    startDate: Date | null;
    endDate: Date | null;
    firstPlacePrize: string | null;
    secondPlacePrize: string | null;
    thirdPlacePrize: string | null;
    regulation: string | null;
    createdAt: Date;
    updatedAt: Date;
  },
): ReiDaCopaSettingsEntity {
  return {
    id: settings.id,
    startDate: packageDateToIsoString(settings.startDate),
    endDate: packageDateToIsoString(settings.endDate),
    firstPlacePrize: settings.firstPlacePrize,
    secondPlacePrize: settings.secondPlacePrize,
    thirdPlacePrize: settings.thirdPlacePrize,
    regulation: settings.regulation,
    createdAt: settings.createdAt,
    updatedAt: settings.updatedAt,
  };
}

export class ReiDaCopaSettingsService {
  async getSettings(): Promise<ReiDaCopaSettingsEntity> {
    const settings = await prisma.reiDaCopaSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID },
      update: {},
      select: settingsSelect,
    });

    return mapSettingsEntity(settings);
  }

  async updateSettings(input: CampaignSettingsDto): Promise<ReiDaCopaSettingsEntity> {
    const settings = await prisma.reiDaCopaSettings.upsert({
      where: { id: SETTINGS_ID },
      create: {
        id: SETTINGS_ID,
        startDate: parseOptionalPackageDateInput(input.startDate),
        endDate: parseOptionalPackageDateInput(input.endDate),
        firstPlacePrize: input.firstPlacePrize || null,
        secondPlacePrize: input.secondPlacePrize || null,
        thirdPlacePrize: input.thirdPlacePrize || null,
        regulation: input.regulation || null,
      },
      update: {
        startDate: parseOptionalPackageDateInput(input.startDate),
        endDate: parseOptionalPackageDateInput(input.endDate),
        firstPlacePrize: input.firstPlacePrize || null,
        secondPlacePrize: input.secondPlacePrize || null,
        thirdPlacePrize: input.thirdPlacePrize || null,
        regulation: input.regulation || null,
      },
      select: settingsSelect,
    });

    return mapSettingsEntity(settings);
  }
}

export const reiDaCopaSettingsService = new ReiDaCopaSettingsService();
