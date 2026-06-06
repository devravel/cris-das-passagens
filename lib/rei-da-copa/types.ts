import type { ReiDaCopaKeywordStatus } from "@/lib/generated/prisma/client";

export type ReiDaCopaParticipantEntity = {
  id: string;
  registrationNumber: number;
  name: string;
  phone: string;
  instagram: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ReiDaCopaKeywordEntity = {
  id: string;
  value: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ReiDaCopaKeywordSubmissionEntity = {
  id: string;
  participantId: string;
  keyword: string;
  status: ReiDaCopaKeywordStatus;
  createdAt: Date;
};

export type ReiDaCopaRankingEntity = {
  id: string;
  participantId: string;
  points: number;
  position: number;
  updatedAt: Date;
};

export type ReiDaCopaParticipantWithCounts = ReiDaCopaParticipantEntity & {
  keywordSubmissionCount: number;
  hasRanking: boolean;
};

export type ReiDaCopaKeywordSubmissionWithParticipant = ReiDaCopaKeywordSubmissionEntity & {
  participant: Pick<ReiDaCopaParticipantEntity, "id" | "registrationNumber" | "name" | "phone" | "instagram">;
};

export type ReiDaCopaRankingWithParticipant = ReiDaCopaRankingEntity & {
  participant: Pick<ReiDaCopaParticipantEntity, "id" | "name" | "instagram">;
};

export type ReiDaCopaPublicRankingEntry = {
  position: number;
  name: string;
  instagram: string;
  points: number;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ReiDaCopaSettingsEntity = {
  id: string;
  startDate: string | null;
  endDate: string | null;
  firstPlacePrize: string | null;
  secondPlacePrize: string | null;
  thirdPlacePrize: string | null;
  regulation: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminReiDaCopaParticipantRow = {
  id: string;
  registrationNumber: number;
  name: string;
  phone: string;
  instagram: string;
  createdAt: string;
};

export type AdminReiDaCopaRankingRow = {
  participantId: string;
  position: number;
  name: string;
  instagram: string;
  points: number;
  updatedAt: string;
};

export type AdminReiDaCopaOfficialKeywordRow = {
  id: string;
  value: string;
  isActive: boolean;
  createdAt: string;
};

export type AdminReiDaCopaKeywordRow = {
  id: string;
  participantName: string;
  phone: string;
  instagram: string;
  keyword: string;
  createdAt: string;
  status: ReiDaCopaKeywordStatus;
};

export type AdminReiDaCopaUnrankedParticipant = {
  id: string;
  registrationNumber: number;
  name: string;
  instagram: string;
};
