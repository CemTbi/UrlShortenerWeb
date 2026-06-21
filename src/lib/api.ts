import type {
  ApiErrorBody,
  CreateUrlRequest,
  ShortUrlResponse,
} from "@/types/url";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:10000";

export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string>;

  constructor(
    message: string,
    status: number,
    fieldErrors: Record<string, string> = {}
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function parseError(res: Response): Promise<ApiError> {
  let body: ApiErrorBody | null = null;
  try {
    body = (await res.json()) as ApiErrorBody;
  } catch {
    // not JSON (or empty body) — fall through to the generic message below
  }

  const fieldErrors = body?.errors ?? {};
  const fieldErrorCount = Object.keys(fieldErrors).length;

  let message =
    body?.detail ?? body?.title ?? body?.message ?? body?.error ?? null;

  if ((!message || message === "Validation failed for one or more fields") && fieldErrorCount > 0) {
    message = Object.values(fieldErrors).join(" ");
  }

  if (!message) {
    message = `Request failed (${res.status})`;
  }

  return new ApiError(message, res.status, fieldErrors);
}

export async function createShortUrl(
  payload: CreateUrlRequest
): Promise<ShortUrlResponse> {
  const res = await fetch(`${API_BASE_URL}/api/urls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return (await res.json()) as ShortUrlResponse;
}

export async function getShortUrl(code: string): Promise<ShortUrlResponse> {
  const res = await fetch(`${API_BASE_URL}/api/urls/${encodeURIComponent(code)}`, {
    method: "GET",
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return (await res.json()) as ShortUrlResponse;
}

export function buildShortLink(code: string): string {
  return `${API_BASE_URL}/${code}`;
}

export { API_BASE_URL };

