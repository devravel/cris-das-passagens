import { NextRequest, NextResponse } from "next/server";

import { checkNewsletterRateLimit } from "@/lib/newsletter/rate-limit";
import { newsletterSubscriptionSchema } from "@/lib/newsletter/schemas";
import { newsletterSubscribersService } from "@/lib/newsletter/subscribers.service";

export async function POST(request: NextRequest) {
  const rateLimit = checkNewsletterRateLimit(request);

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
    const parsed = newsletterSubscriptionSchema.safeParse(body);

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

    const subscriber = await newsletterSubscribersService.registerSubscriber(
      parsed.data,
    );

    return NextResponse.json(
      {
        ok: true,
        message: "Inscrição realizada com sucesso.",
        data: {
          id: subscriber.id,
          registrationNumber: subscriber.registrationNumber,
          name: subscriber.name,
          email: subscriber.email,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("já está cadastrado")
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
