function isErrorResponse(value: unknown): value is { error: string } {
  return typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string";
}

export async function readJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const text = await response.text();
  let data: unknown;

  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = undefined;
    }
  }

  if (!response.ok) {
    if (isErrorResponse(data)) throw new Error(data.error);
    throw new Error(`${fallbackMessage} (HTTP ${response.status}). تحقق من سجل Vercel وإعدادات البيئة.`);
  }

  if (data === undefined) throw new Error("استجابة الخادم فارغة أو غير صالحة.");
  return data as T;
}
