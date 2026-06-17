"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getActionErrorMessage } from "@/lib/admin/action-error";
import type { ActionResult } from "@/lib/admin/action-result";
import { requireReiDaCopaAdmin } from "@/lib/rei-da-copa/guards";
import { reiDaCopaKeywordSubmissionsService } from "@/lib/rei-da-copa/keyword-submissions.service";
import {
  KEYWORD_EXISTS_INACTIVE_MESSAGE,
  KEYWORD_NOT_FOUND_MESSAGE,
  KEYWORD_ALREADY_ACTIVE_MESSAGE,
  reiDaCopaKeywordsService,
} from "@/lib/rei-da-copa/keywords.service";
import { reiDaCopaParticipantsService } from "@/lib/rei-da-copa/participants.service";
import { REI_DA_COPA_PERMISSIONS } from "@/lib/rei-da-copa/permissions";
import { reiDaCopaRankingService } from "@/lib/rei-da-copa/ranking.service";
import { reiDaCopaSettingsService } from "@/lib/rei-da-copa/settings.service";
import {
  campaignKeywordCreateSchema,
  campaignSettingsSchema,
  keywordStatusUpdateSchema,
  keywordSubmissionListFilterSchema,
  participantListFilterSchema,
  rankingAddPointsSchema,
  rankingUpdateSchema,
  rankingUpsertSchema,
} from "@/lib/rei-da-copa/schemas";

const participantIdSchema = z.string().trim().min(1);
const submissionIdSchema = z.string().trim().min(1);
const keywordIdSchema = z.string().trim().min(1);

function revalidateReiDaCopaPaths() {
  revalidatePath("/admin/rei-da-copa/inscricoes");
  revalidatePath("/admin/rei-da-copa/ranking");
  revalidatePath("/admin/rei-da-copa/palavra-chave");
  revalidatePath("/admin/rei-da-copa/configuracoes");
  revalidatePath("/rei-da-copa");
}

function toFieldErrors(error: z.ZodError) {
  return error.flatten().fieldErrors;
}

function getKeywordActionErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    const message = error.message;

    if (
      message === KEYWORD_ALREADY_ACTIVE_MESSAGE ||
      message === KEYWORD_EXISTS_INACTIVE_MESSAGE ||
      message === KEYWORD_NOT_FOUND_MESSAGE
    ) {
      return message;
    }
  }

  return getActionErrorMessage(error, fallback);
}

export async function listReiDaCopaParticipantsAction(
  input: z.input<typeof participantListFilterSchema>,
): Promise<ActionResult<Awaited<ReturnType<typeof reiDaCopaParticipantsService.listParticipants>>>> {
  try {
    await requireReiDaCopaAdmin(REI_DA_COPA_PERMISSIONS.participants.read);

    const parsed = participantListFilterSchema.safeParse(input);

    if (!parsed.success) {
      return {
        ok: false,
        message: "Filtros inválidos.",
        fieldErrors: toFieldErrors(parsed.error),
      };
    }

    const data = await reiDaCopaParticipantsService.listParticipants(parsed.data);

    return {
      ok: true,
      message: "Participantes carregados com sucesso.",
      data,
    };
  } catch (error) {
    return {
      ok: false,
      message: getActionErrorMessage(error, "Não foi possível listar os participantes agora."),
    };
  }
}

export async function getReiDaCopaParticipantAction(
  id: string,
): Promise<ActionResult<Awaited<ReturnType<typeof reiDaCopaParticipantsService.getParticipantById>>>> {
  try {
    await requireReiDaCopaAdmin(REI_DA_COPA_PERMISSIONS.participants.read);

    const parsedId = participantIdSchema.safeParse(id);

    if (!parsedId.success) {
      return {
        ok: false,
        message: "Participante inválido.",
      };
    }

    const participant = await reiDaCopaParticipantsService.getParticipantById(parsedId.data);

    if (!participant) {
      return {
        ok: false,
        message: "Participante não encontrado.",
      };
    }

    return {
      ok: true,
      message: "Participante carregado com sucesso.",
      data: participant,
    };
  } catch (error) {
    return {
      ok: false,
      message: getActionErrorMessage(error, "Não foi possível carregar o participante agora."),
    };
  }
}

export async function exportReiDaCopaParticipantsAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof reiDaCopaParticipantsService.exportParticipants>>>
> {
  try {
    await requireReiDaCopaAdmin(REI_DA_COPA_PERMISSIONS.participants.export);

    const data = await reiDaCopaParticipantsService.exportParticipants();

    return {
      ok: true,
      message: "Participantes exportados com sucesso.",
      data,
    };
  } catch (error) {
    return {
      ok: false,
      message: getActionErrorMessage(error, "Não foi possível exportar os participantes agora."),
    };
  }
}

export async function listReiDaCopaKeywordSubmissionsAction(
  input: z.input<typeof keywordSubmissionListFilterSchema>,
): Promise<
  ActionResult<Awaited<ReturnType<typeof reiDaCopaKeywordSubmissionsService.listSubmissions>>>
> {
  try {
    await requireReiDaCopaAdmin(REI_DA_COPA_PERMISSIONS.keywords.read);

    const parsed = keywordSubmissionListFilterSchema.safeParse(input);

    if (!parsed.success) {
      return {
        ok: false,
        message: "Filtros inválidos.",
        fieldErrors: toFieldErrors(parsed.error),
      };
    }

    const data = await reiDaCopaKeywordSubmissionsService.listSubmissions(parsed.data);

    return {
      ok: true,
      message: "Envios carregados com sucesso.",
      data,
    };
  } catch (error) {
    return {
      ok: false,
      message: getActionErrorMessage(error, "Não foi possível listar os envios agora."),
    };
  }
}

export async function createReiDaCopaOfficialKeywordAction(
  input: z.input<typeof campaignKeywordCreateSchema>,
): Promise<ActionResult<Awaited<ReturnType<typeof reiDaCopaKeywordsService.createKeyword>>>> {
  try {
    await requireReiDaCopaAdmin(REI_DA_COPA_PERMISSIONS.keywords.validate);

    const parsed = campaignKeywordCreateSchema.safeParse(input);

    if (!parsed.success) {
      return {
        ok: false,
        message: "Revise os campos obrigatórios.",
        fieldErrors: toFieldErrors(parsed.error),
      };
    }

    const data = await reiDaCopaKeywordsService.createKeyword(parsed.data);
    revalidateReiDaCopaPaths();

    return {
      ok: true,
      message: "Palavra-chave cadastrada com sucesso.",
      data,
    };
  } catch (error) {
    return {
      ok: false,
      message: getKeywordActionErrorMessage(error, "Não foi possível cadastrar a palavra-chave agora."),
    };
  }
}

export async function activateReiDaCopaOfficialKeywordAction(
  id: string,
): Promise<ActionResult<Awaited<ReturnType<typeof reiDaCopaKeywordsService.activateKeyword>>>> {
  try {
    await requireReiDaCopaAdmin(REI_DA_COPA_PERMISSIONS.keywords.validate);

    const parsedId = keywordIdSchema.safeParse(id);

    if (!parsedId.success) {
      return {
        ok: false,
        message: "Palavra-chave inválida.",
      };
    }

    const data = await reiDaCopaKeywordsService.activateKeyword(parsedId.data);
    revalidateReiDaCopaPaths();

    return {
      ok: true,
      message: "Palavra-chave ativada com sucesso.",
      data,
    };
  } catch (error) {
    return {
      ok: false,
      message: getKeywordActionErrorMessage(error, "Não foi possível ativar a palavra-chave agora."),
    };
  }
}

export async function deactivateReiDaCopaOfficialKeywordAction(
  id: string,
): Promise<ActionResult<Awaited<ReturnType<typeof reiDaCopaKeywordsService.deactivateKeyword>>>> {
  try {
    await requireReiDaCopaAdmin(REI_DA_COPA_PERMISSIONS.keywords.validate);

    const parsedId = keywordIdSchema.safeParse(id);

    if (!parsedId.success) {
      return {
        ok: false,
        message: "Palavra-chave inválida.",
      };
    }

    const data = await reiDaCopaKeywordsService.deactivateKeyword(parsedId.data);
    revalidateReiDaCopaPaths();

    return {
      ok: true,
      message: "Palavra-chave desativada com sucesso.",
      data,
    };
  } catch (error) {
    return {
      ok: false,
      message: getKeywordActionErrorMessage(error, "Não foi possível desativar a palavra-chave agora."),
    };
  }
}

export async function deleteReiDaCopaOfficialKeywordAction(
  id: string,
): Promise<ActionResult> {
  try {
    await requireReiDaCopaAdmin(REI_DA_COPA_PERMISSIONS.keywords.validate);

    const parsedId = keywordIdSchema.safeParse(id);

    if (!parsedId.success) {
      return {
        ok: false,
        message: "Palavra-chave inválida.",
      };
    }

    await reiDaCopaKeywordsService.deleteKeyword(parsedId.data);
    revalidateReiDaCopaPaths();

    return {
      ok: true,
      message: "Palavra-chave excluída com sucesso.",
    };
  } catch (error) {
    return {
      ok: false,
      message: getKeywordActionErrorMessage(error, "Não foi possível excluir a palavra-chave agora."),
    };
  }
}

export async function updateReiDaCopaKeywordStatusAction(
  id: string,
  input: z.input<typeof keywordStatusUpdateSchema>,
): Promise<
  ActionResult<Awaited<ReturnType<typeof reiDaCopaKeywordSubmissionsService.updateSubmissionStatus>>>
> {
  try {
    await requireReiDaCopaAdmin(REI_DA_COPA_PERMISSIONS.keywords.validate);

    const parsedId = submissionIdSchema.safeParse(id);
    const parsed = keywordStatusUpdateSchema.safeParse(input);

    if (!parsedId.success || !parsed.success) {
      return {
        ok: false,
        message: "Dados inválidos.",
        fieldErrors: parsed.success ? undefined : toFieldErrors(parsed.error),
      };
    }

    const data = await reiDaCopaKeywordSubmissionsService.updateSubmissionStatus(
      parsedId.data,
      parsed.data,
    );

    revalidateReiDaCopaPaths();

    return {
      ok: true,
      message: "Status da palavra-chave atualizado com sucesso.",
      data,
    };
  } catch (error) {
    return {
      ok: false,
      message: getActionErrorMessage(error, "Não foi possível atualizar o status agora."),
    };
  }
}

export async function listReiDaCopaRankingAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof reiDaCopaRankingService.listRankingEntries>>>
> {
  try {
    await requireReiDaCopaAdmin(REI_DA_COPA_PERMISSIONS.ranking.read);

    const data = await reiDaCopaRankingService.listRankingEntries();

    return {
      ok: true,
      message: "Ranking carregado com sucesso.",
      data,
    };
  } catch (error) {
    return {
      ok: false,
      message: getActionErrorMessage(error, "Não foi possível carregar o ranking agora."),
    };
  }
}

export async function upsertReiDaCopaRankingEntryAction(
  input: z.input<typeof rankingUpsertSchema>,
): Promise<ActionResult<Awaited<ReturnType<typeof reiDaCopaRankingService.upsertRankingEntry>>>> {
  try {
    await requireReiDaCopaAdmin(REI_DA_COPA_PERMISSIONS.ranking.manage);

    const parsed = rankingUpsertSchema.safeParse(input);

    if (!parsed.success) {
      return {
        ok: false,
        message: "Revise os campos obrigatórios.",
        fieldErrors: toFieldErrors(parsed.error),
      };
    }

    const data = await reiDaCopaRankingService.upsertRankingEntry(parsed.data);
    revalidateReiDaCopaPaths();

    return {
      ok: true,
      message: "Participante adicionado ao ranking com sucesso.",
      data,
    };
  } catch (error) {
    return {
      ok: false,
      message: getActionErrorMessage(error, "Não foi possível salvar o ranking agora."),
    };
  }
}

export async function updateReiDaCopaRankingEntryAction(
  participantId: string,
  input: z.input<typeof rankingUpdateSchema>,
): Promise<ActionResult<Awaited<ReturnType<typeof reiDaCopaRankingService.updateRankingEntry>>>> {
  try {
    await requireReiDaCopaAdmin(REI_DA_COPA_PERMISSIONS.ranking.manage);

    const parsedId = participantIdSchema.safeParse(participantId);
    const parsed = rankingUpdateSchema.safeParse(input);

    if (!parsedId.success || !parsed.success) {
      return {
        ok: false,
        message: "Dados inválidos.",
        fieldErrors: parsed.success ? undefined : toFieldErrors(parsed.error),
      };
    }

    const data = await reiDaCopaRankingService.updateRankingEntry(parsedId.data, parsed.data);
    revalidateReiDaCopaPaths();

    return {
      ok: true,
      message: "Ranking atualizado com sucesso.",
      data,
    };
  } catch (error) {
    return {
      ok: false,
      message: getActionErrorMessage(error, "Não foi possível atualizar o ranking agora."),
    };
  }
}

export async function addReiDaCopaRankingPointsAction(
  participantId: string,
  input: z.input<typeof rankingAddPointsSchema>,
): Promise<ActionResult<Awaited<ReturnType<typeof reiDaCopaRankingService.addPointsToRankingEntry>>>> {
  try {
    await requireReiDaCopaAdmin(REI_DA_COPA_PERMISSIONS.ranking.manage);

    const parsedId = participantIdSchema.safeParse(participantId);
    const parsed = rankingAddPointsSchema.safeParse(input);

    if (!parsedId.success || !parsed.success) {
      return {
        ok: false,
        message: "Dados inválidos.",
        fieldErrors: parsed.success ? undefined : toFieldErrors(parsed.error),
      };
    }

    const data = await reiDaCopaRankingService.addPointsToRankingEntry(
      parsedId.data,
      parsed.data.amount,
    );
    revalidateReiDaCopaPaths();

    return {
      ok: true,
      message: `+${parsed.data.amount} pontos adicionados com sucesso.`,
      data,
    };
  } catch (error) {
    return {
      ok: false,
      message: getActionErrorMessage(error, "Não foi possível adicionar pontos agora."),
    };
  }
}

export async function getReiDaCopaSettingsAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof reiDaCopaSettingsService.getSettings>>>
> {
  try {
    await requireReiDaCopaAdmin(REI_DA_COPA_PERMISSIONS.settings.read);

    const data = await reiDaCopaSettingsService.getSettings();

    return {
      ok: true,
      message: "Configurações carregadas com sucesso.",
      data,
    };
  } catch (error) {
    return {
      ok: false,
      message: getActionErrorMessage(error, "Não foi possível carregar as configurações agora."),
    };
  }
}

export async function updateReiDaCopaSettingsAction(
  input: z.input<typeof campaignSettingsSchema>,
): Promise<ActionResult<Awaited<ReturnType<typeof reiDaCopaSettingsService.updateSettings>>>> {
  try {
    await requireReiDaCopaAdmin(REI_DA_COPA_PERMISSIONS.settings.manage);

    const parsed = campaignSettingsSchema.safeParse(input);

    if (!parsed.success) {
      return {
        ok: false,
        message: "Revise os campos obrigatórios.",
        fieldErrors: toFieldErrors(parsed.error),
      };
    }

    const data = await reiDaCopaSettingsService.updateSettings(parsed.data);
    revalidateReiDaCopaPaths();

    return {
      ok: true,
      message: "Configurações salvas com sucesso.",
      data,
    };
  } catch (error) {
    return {
      ok: false,
      message: getActionErrorMessage(error, "Não foi possível salvar as configurações agora."),
    };
  }
}

export async function removeReiDaCopaRankingEntryAction(
  participantId: string,
): Promise<ActionResult> {
  try {
    await requireReiDaCopaAdmin(REI_DA_COPA_PERMISSIONS.ranking.manage);

    const parsedId = participantIdSchema.safeParse(participantId);

    if (!parsedId.success) {
      return {
        ok: false,
        message: "Participante inválido.",
      };
    }

    await reiDaCopaRankingService.removeRankingEntry(parsedId.data);
    revalidateReiDaCopaPaths();

    return {
      ok: true,
      message: "Participante removido do ranking com sucesso.",
    };
  } catch (error) {
    return {
      ok: false,
      message: getActionErrorMessage(error, "Não foi possível remover o participante do ranking agora."),
    };
  }
}
