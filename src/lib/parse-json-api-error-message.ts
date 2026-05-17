export async function parseJsonApiErrorMessage(
  response: Response,
  defaultErrorMessage: string,
): Promise<string> {
  try {
    const errorResponseBody: unknown = await response.json();
    if (
      typeof errorResponseBody === "object" &&
      errorResponseBody !== null &&
      "error" in errorResponseBody &&
      typeof errorResponseBody.error === "string"
    ) {
      return errorResponseBody.error;
    }
  } catch {
    // use default error message
  }
  return defaultErrorMessage;
}
