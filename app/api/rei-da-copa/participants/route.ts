import { NextRequest, NextResponse } from "next/server";

import { reiDaCopaParticipantsService } from "@/lib/rei-da-copa/participants.service";
import { REI_DA_COPA_CAMPAIGN_CLOSED_MESSAGE, isCampaignOpen } from "@/lib/rei-da-copa/campaign-window";
import { reiDaCopaSettingsService } from "@/lib/rei-da-copa/settings.service";
import { checkReiDaCopaRateLimit } from "@/lib/rei-da-copa/rate-limit";
import { participantRegistrationSchema } from "@/lib/rei-da-copa/schemas";
import { formatParticipantInstagramForDisplay } from "@/lib/rei-da-copa/utils";

export async function POST(request: NextRequest) {
  const rateLimit = checkReiDaCopaRateLimit(request, "registration");

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: rateLimit.message,
      },
      { status: 429 },
    );
  }

  try {
    const settings = await reiDaCopaSettingsService.getSettings();

    if (!isCampaignOpen(settings)) {
      return NextResponse.json(
        {
          ok: false,
          error: REI_DA_COPA_CAMPAIGN_CLOSED_MESSAGE,
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = participantRegistrationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const participant = await reiDaCopaParticipantsService.registerParticipant(parsed.data);

    return NextResponse.json(
      {
        ok: true,
        message: "Cadastro realizado com sucesso.",
        data: {
          id: participant.id,
          registrationNumber: participant.registrationNumber,
          name: participant.name,
          instagram: formatParticipantInstagramForDisplay(participant.instagram),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error &&
      error.message.includes("já está cadastrado")
        ? "Já existe uma inscrição com os dados informados."
        : "Não foi possível concluir a inscrição agora. Tente novamente.";

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: message.startsWith("Já existe") ? 409 : 500 },
    );
  }
}
