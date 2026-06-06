import { cache } from "react";

import { prisma } from "@/lib/prisma";
import { reiDaCopaSettingsService } from "@/lib/rei-da-copa/settings.service";
import type {
  AdminReiDaCopaKeywordRow,
  AdminReiDaCopaOfficialKeywordRow,
  AdminReiDaCopaParticipantRow,
  AdminReiDaCopaRankingRow,
  AdminReiDaCopaUnrankedParticipant,
  ReiDaCopaSettingsEntity,
} from "@/lib/rei-da-copa/types";
import {
  formatParticipantInstagramForDisplay,
  formatParticipantPhoneForDisplay,
} from "@/lib/rei-da-copa/utils";

export const getAdminReiDaCopaParticipants = cache(
  async (): Promise<AdminReiDaCopaParticipantRow[]> => {
    try {
      const participants = await prisma.reiDaCopaParticipant.findMany({
        orderBy: { registrationNumber: "desc" },
        select: {
          id: true,
          registrationNumber: true,
          name: true,
          phone: true,
          instagram: true,
          createdAt: true,
        },
      });

      return participants.map((participant) => ({
        id: participant.id,
        registrationNumber: participant.registrationNumber,
        name: participant.name,
        phone: formatParticipantPhoneForDisplay(participant.phone),
        instagram: formatParticipantInstagramForDisplay(participant.instagram),
        createdAt: participant.createdAt.toISOString(),
      }));
    } catch {
      return [];
    }
  },
);

export const getAdminReiDaCopaRanking = cache(
  async (): Promise<AdminReiDaCopaRankingRow[]> => {
    try {
      const entries = await prisma.reiDaCopaRanking.findMany({
        orderBy: [{ position: "asc" }, { points: "desc" }],
        select: {
          participantId: true,
          position: true,
          points: true,
          updatedAt: true,
          participant: {
            select: {
              name: true,
              instagram: true,
            },
          },
        },
      });

      return entries.map((entry) => ({
        participantId: entry.participantId,
        position: entry.position,
        name: entry.participant.name,
        instagram: formatParticipantInstagramForDisplay(entry.participant.instagram),
        points: entry.points,
        updatedAt: entry.updatedAt.toISOString(),
      }));
    } catch {
      return [];
    }
  },
);

export const getAdminReiDaCopaUnrankedParticipants = cache(
  async (): Promise<AdminReiDaCopaUnrankedParticipant[]> => {
    try {
      const participants = await prisma.reiDaCopaParticipant.findMany({
        where: {
          ranking: {
            is: null,
          },
        },
        orderBy: { registrationNumber: "asc" },
        select: {
          id: true,
          registrationNumber: true,
          name: true,
          instagram: true,
        },
      });

      return participants.map((participant) => ({
        id: participant.id,
        registrationNumber: participant.registrationNumber,
        name: participant.name,
        instagram: formatParticipantInstagramForDisplay(participant.instagram),
      }));
    } catch {
      return [];
    }
  },
);

export const getAdminReiDaCopaOfficialKeywords = cache(
  async (): Promise<AdminReiDaCopaOfficialKeywordRow[]> => {
    try {
      const keywords = await prisma.reiDaCopaKeyword.findMany({
        orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          value: true,
          isActive: true,
          createdAt: true,
        },
      });

      return keywords.map((keyword) => ({
        id: keyword.id,
        value: keyword.value,
        isActive: keyword.isActive,
        createdAt: keyword.createdAt.toISOString(),
      }));
    } catch {
      return [];
    }
  },
);

export const getAdminReiDaCopaKeywordSubmissions = cache(
  async (): Promise<AdminReiDaCopaKeywordRow[]> => {
    try {
      const submissions = await prisma.reiDaCopaKeywordSubmission.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          keyword: true,
          status: true,
          createdAt: true,
          participant: {
            select: {
              name: true,
              phone: true,
              instagram: true,
            },
          },
        },
      });

      return submissions.map((submission) => ({
        id: submission.id,
        participantName: submission.participant.name,
        phone: formatParticipantPhoneForDisplay(submission.participant.phone),
        instagram: formatParticipantInstagramForDisplay(submission.participant.instagram),
        keyword: submission.keyword,
        createdAt: submission.createdAt.toISOString(),
        status: submission.status,
      }));
    } catch {
      return [];
    }
  },
);

export const getAdminReiDaCopaSettings = cache(
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
