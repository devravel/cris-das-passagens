import { cache } from "react";

import { reiDaCopaRankingService } from "@/lib/rei-da-copa/ranking.service";
import { reiDaCopaSettingsService } from "@/lib/rei-da-copa/settings.service";
import type {
  ReiDaCopaPublicRankingEntry,
  ReiDaCopaSettingsEntity,
} from "@/lib/rei-da-copa/types";

export const getReiDaCopaPublicRanking = cache(
  async (): Promise<ReiDaCopaPublicRankingEntry[]> => {
    return reiDaCopaRankingService.getPublicRanking();
  },
);

export const getReiDaCopaPublicSettings = cache(
  async (): Promise<ReiDaCopaSettingsEntity> => {
    try {
      return await reiDaCopaSettingsService.getSettings();
    } catch {
      return {
        id: "default",
        startDate: null,
        endDate: null,
        firstPlacePrize: null,
        secondPlacePrize: null,
        thirdPlacePrize: null,
        regulation: null,
        createdAt: new Date(0),
        updatedAt: new Date(0),
      };
    }
  },
);
