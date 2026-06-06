import { NextRequest, NextResponse } from "next/server";

import { reiDaCopaParticipantsService } from "@/lib/rei-da-copa/participants.service";
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
      error instanceof Error
        ? error.message
        : "Não foi possível concluir o cadastro agora. Tente novamente.";

    const status = message.includes("já está cadastrado") ? 409 : 500;

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status },
    );
  }
}
