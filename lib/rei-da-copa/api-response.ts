import { ReiDaCopaSubmissionError } from "@/lib/rei-da-copa/submission-errors";

export function getReiDaCopaSubmissionErrorResponse(error: unknown) {
  if (error instanceof ReiDaCopaSubmissionError) {
    return {
      status: error.status,
      body: {
        ok: false as const,
        error: error.message,
        fieldErrors: error.fieldErrors,
      },
    };
  }

  return {
    status: 500,
    body: {
      ok: false as const,
      error: "Não foi possível enviar a palavra-chave agora. Tente novamente.",
    },
  };
}
