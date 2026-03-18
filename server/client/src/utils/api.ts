export interface ApiEnvelope<TData = unknown> {
  success?: boolean | string;
  message?: string;
  error?: string;
  data?: TData;
}

const isJsonResponse = (response: Response): boolean =>
  response.headers.get("content-type")?.includes("application/json") ?? false;

export const getApiMessage = (
  payload: Pick<ApiEnvelope, "message" | "success"> | null | undefined,
  fallback?: string
): string | undefined => {
  if (typeof payload?.message === "string" && payload.message.trim()) {
    return payload.message;
  }

  if (typeof payload?.success === "string" && payload.success.trim()) {
    return payload.success;
  }

  return fallback;
};

export const getApiErrorMessage = (
  payload: Pick<ApiEnvelope, "error" | "message"> | null | undefined,
  fallback: string
): string => {
  if (typeof payload?.error === "string" && payload.error.trim()) {
    return payload.error;
  }

  if (typeof payload?.message === "string" && payload.message.trim()) {
    return payload.message;
  }

  return fallback;
};

export const parseOptionalApiResponse = async <T>(response: Response): Promise<T | null> => {
  if (!isJsonResponse(response)) {
    return null;
  }

  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

export const readApiResponse = async <T extends ApiEnvelope>(response: Response, fallbackMessage: string): Promise<T> => {
  if (!isJsonResponse(response)) {
    const text = await response.text();
    throw new Error(text || fallbackMessage);
  }

  let payload: T;

  try {
    payload = (await response.json()) as T;
  } catch {
    throw new Error(fallbackMessage);
  }

  if (!response.ok) {
    throw new Error(getApiErrorMessage(payload, fallbackMessage));
  }

  return payload;
};
