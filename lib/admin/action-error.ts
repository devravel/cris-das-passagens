export function getActionErrorMessage(error: unknown, fallback: string): string {
  if (process.env.NODE_ENV === "development") {
    console.error(error);
  }

  if (!(error instanceof Error)) {
    return fallback;
  }

  const message = error.message;

  if (
    message.includes("Unknown argument `departureCity`") ||
    message.includes("Unknown field `departureCity`") ||
    message.includes("Unknown argument `departureDate`") ||
    message.includes("Unknown field `departureDate`") ||
    message.includes("Unknown argument `returnDate`") ||
    message.includes("Unknown field `returnDate`")
  ) {
    return "O Prisma Client está desatualizado. Pare o servidor (Ctrl+C), rode npm run db:generate e npm run dev de novo.";
  }

  if (
    message.includes('null value in column "includesTickets"') ||
    message.includes('null value in column "includesHotel"') ||
    message.includes('column "includesTickets"') ||
    message.includes('column "includesHotel"')
  ) {
    return "O banco de dados está desatualizado. Execute npm run db:migrate e tente novamente.";
  }

  if (process.env.NODE_ENV === "development") {
    return message;
  }

  return fallback;
}
