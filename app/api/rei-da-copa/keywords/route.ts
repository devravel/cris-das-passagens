import { NextRequest, NextResponse } from "next/server";

import { getReiDaCopaSubmissionErrorResponse } from "@/lib/rei-da-copa/api-response";
import { reiDaCopaKeywordSubmissionsService } from "@/lib/rei-da-copa/keyword-submissions.service";
import { checkReiDaCopaRateLimit } from "@/lib/rei-da-copa/rate-limit";
import { keywordSubmissionSchema } from "@/lib/rei-da-copa/schemas";

export async function POST(request: NextRequest) {
  const rateLimit = checkReiDaCopaRateLimit(request, "keyword");

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
    const parsed = keywordSubmissionSchema.safeParse(body);

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

    const submission = await reiDaCopaKeywordSubmissionsService.submitKeyword(parsed.data);

    return NextResponse.json(
      {
        ok: true,
        message: "Palavra-chave enviada com sucesso.",
        data: {
          id: submission.id,
          status: submission.status,
          createdAt: submission.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const { status, body } = getReiDaCopaSubmissionErrorResponse(error);

    return NextResponse.json(body, { status });
  }
}
