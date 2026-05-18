export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number = 400,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function toClientError(error: unknown): { error: string; status: number } {
  if (error instanceof AppError) {
    return { error: error.message, status: error.status };
  }
  console.error("[pay-app]", error);
  return { error: "An unexpected error occurred", status: 500 };
}
