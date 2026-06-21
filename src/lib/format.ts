/**
 * Formatting helpers for dates returned by the backend.
 *
 * IMPORTANT: every timestamp stored in the database is UTC. The backend
 * (Spring Boot / Postgres) sends them in a format like:
 *
 *   "2026-07-20 23:59:01.826119+00"
 *
 * This is NOT valid ISO-8601 — it has a space instead of "T", microsecond
 * precision (6 digits) instead of millisecond (3), and a 2-digit UTC
 * offset ("+00") instead of "+00:00" or "Z". `new Date(...)` happens to
 * parse this correctly in some engines (V8/Chrome) but is NOT guaranteed
 * to across browsers (Safari in particular is strict about this and can
 * return Invalid Date, or worse, silently misinterpret it).
 *
 * `parseBackendTimestamp` normalizes the raw string into a real ISO-8601
 * string before handing it to `Date`, and explicitly assumes UTC if no
 * offset is present at all — so we never accidentally treat a UTC
 * timestamp as local time.
 *
 * Every formatting function below goes through this parser. Do not call
 * `new Date(iso)` directly on a raw backend timestamp anywhere else in
 * the app — always go through here.
 */

/**
 * Parses a raw timestamp string from the backend into a valid Date,
 * always treating it as UTC unless the string itself specifies an
 * offset.
 */
export function parseBackendTimestamp(raw?: string | null): Date | null {
  if (!raw) return null;

  let value = raw.trim();
  if (!value) return null;

  // "2026-07-20 23:59:01.826119+00" -> "2026-07-20T23:59:01.826119+00"
  // (only replace the first space, between date and time)
  value = value.replace(" ", "T");

  // Truncate fractional seconds to millisecond precision (3 digits).
  // ".826119" -> ".826". JS Date ignores anything beyond ms anyway, but
  // some engines mis-parse 6-digit fractional seconds entirely.
  value = value.replace(/(\.\d{3})\d+/, "$1");

  // Normalize the UTC offset:
  //   "+00"      -> "+00:00"
  //   "+0000"    -> "+00:00"
  //   "+02"      -> "+02:00"
  //   already "Z" or "+02:00" -> left alone
  const offsetMatch = value.match(/([+-]\d{2})(:?(\d{2}))?$/);
  if (offsetMatch) {
    const sign = offsetMatch[1];
    const minutes = offsetMatch[3] ?? "00";
    value = value.slice(0, offsetMatch.index) + `${sign}:${minutes}`;
  } else if (!/Z$/.test(value)) {
    // No offset and no "Z" at all — the value has no timezone info.
    // Since every timestamp in the database is UTC, we explicitly treat
    // it as UTC rather than letting the JS engine assume local time.
    value = `${value}Z`;
  }

  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

/** "Jan 5, 2026, 4:30 PM" (rendered in the viewer's local timezone) or a fallback if missing/invalid */
export function formatDateTime(raw?: string | null): string {
  const d = parseBackendTimestamp(raw);
  if (!d) return "—";
  return dateTimeFormatter.format(d);
}

/** "Jan 5, 2026" (rendered in the viewer's local timezone) */
export function formatDate(raw?: string | null): string {
  const d = parseBackendTimestamp(raw);
  if (!d) return "—";
  return dateFormatter.format(d);
}

/** Relative phrasing for "last accessed" — "2 hours ago", "Never", etc. */
export function formatRelative(raw?: string | null): string {
  const d = parseBackendTimestamp(raw);
  if (!d) return "Never";

  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHr / 24);

  if (diffSec < 0) return formatDateTime(raw); // future timestamps: just show the date
  if (diffSec < 45) return "Just now";
  if (diffMin < 60) return `${diffMin} min${diffMin === 1 ? "" : "s"} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
  return formatDate(raw);
}

/** Returns true if the expiry timestamp is in the past */
export function isExpired(raw?: string | null): boolean {
  const d = parseBackendTimestamp(raw);
  if (!d) return false;
  return d.getTime() < Date.now();
}

/** Days remaining until expiry, floored. Null if no expiry or unparseable. */
export function daysUntil(raw?: string | null): number | null {
  const d = parseBackendTimestamp(raw);
  if (!d) return null;
  const diff = d.getTime() - Date.now();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
