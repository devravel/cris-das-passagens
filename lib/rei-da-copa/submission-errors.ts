export class ReiDaCopaSubmissionError extends Error {
  readonly status: number;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(
    message: string,
    options: {
      status: number;
      field?: string;
    },
  ) {
    super(message);
    this.name = "ReiDaCopaSubmissionError";
    this.status = options.status;

    if (options.field) {
      this.fieldErrors = {
        [options.field]: [message],
      };
    }
  }
}
