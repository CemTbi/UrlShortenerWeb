/**
 * Request body for POST /api/urls
 */
export interface CreateUrlRequest {
  url: string;
  alias?: string;
  expiryDays?: number;
}

export interface ShortUrlResponse {
  url: string;
  code: string;
  alias?: string | null;
  expiryDate?: string | null;
  lastAccessedAt?: string | null;
  createdAt?: string | null;
}

export interface RecentLink {
  id: string;
  code: string;
  alias?: string | null;
  longUrl: string;
  shortUrl: string;
  expiryDate?: string | null;
  lastAccessedAt?: string | null;
  createdAt: string;
}

export interface ApiErrorBody {
  message?: string;
  error?: string;
  status?: number;
  /**
   * RFC 7807 "Problem Details" - Returns Spring Boots default error response structrure
   *   {
   *     "detail": "Validation failed for one or more fields",
   *     "instance": "/api/urls",
   *     "status": 400,
   *     "title": "Invalid Request Content",
   *     "type": "https://...",
   *     "errors": { "alias": "Alias must be between 3 and 32 characters" }
   *   }
   */
  detail?: string;
  title?: string;
  instance?: string;
  type?: string;
  /** field name -> validation message, from Spring's @Valid errors */
  errors?: Record<string, string>;
}
