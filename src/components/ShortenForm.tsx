"use client";

import { FormEvent, useState } from "react";
import { cn } from "@/lib/cn";

export interface ShortenFormValues {
  url: string;
  alias: string;
  expiryDays: number | null;
}

interface ShortenFormProps {
  onSubmit: (values: ShortenFormValues) => void | Promise<void>;
  isSubmitting: boolean;
  /** Generic, non-field-specific error message (e.g. network failure, or a backend error with no field mapping) */
  errorMessage: string | null;
  /**
   * Field-level validation errors from the backend, keyed by field name
   * (e.g. { alias: "Alias must be between 3 and 32 characters" }).
   * URL normalization and alias validation happen entirely server-side —
   * this form does no client-side validation of its own and just
   * displays whatever the backend reports.
   */
  fieldErrors?: Record<string, string>;
}

const EXPIRY_PRESETS = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
  { label: "Never", value: null },
] as const;

export function ShortenForm({
  onSubmit,
  isSubmitting,
  errorMessage,
  fieldErrors = {},
}: ShortenFormProps) {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [expiryDays, setExpiryDays] = useState<number | null>(30);
  
  const [dismissedFields, setDismissedFields] = useState<Set<string>>(
    new Set()
  );

  const urlError = dismissedFields.has("url") ? undefined : fieldErrors.url;
  const aliasError = dismissedFields.has("alias")
    ? undefined
    : fieldErrors.alias;
  const expiryError = dismissedFields.has("expiryDays")
    ? undefined
    : fieldErrors.expiryDays;

  function handleUrlChange(value: string) {
    setUrl(value);
    if (fieldErrors.url) {
      setDismissedFields((prev) => new Set(prev).add("url"));
    }
  }

  function handleAliasChange(value: string) {
    setAlias(value);
    if (fieldErrors.alias) {
      setDismissedFields((prev) => new Set(prev).add("alias"));
    }
  }

  function handleExpiryChange(value: number | null) {
    setExpiryDays(value);
    if (fieldErrors.expiryDays) {
      setDismissedFields((prev) => new Set(prev).add("expiryDays"));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!url.trim()) return; // just guards against submitting a fully empty form

    setDismissedFields(new Set());
    await onSubmit({
      url: url.trim(),
      alias: alias.trim(),
      expiryDays,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white shadow-[0_24px_70px_-20px_rgba(15,21,48,0.35)] ring-1 ring-black/5 p-6 sm:p-8"
      noValidate
    >
      <div className="space-y-5">
        {/* Long URL */}
        <div>
          <label
            htmlFor="url"
            className="block text-xs font-semibold uppercase tracking-wide text-slate mb-1.5"
          >
            Long URL
          </label>
          <input
            id="url"
            name="url"
            type="text"
            inputMode="url"
            autoComplete="off"
            placeholder="https://example.com/a/very/long/path?with=params"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            className={cn(
              "w-full rounded-xl border bg-white px-4 py-3 font-body text-base text-ink placeholder:text-slate/50 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-sky-aqua focus:border-sky-aqua",
              urlError ? "border-red-400" : "border-black/10"
            )}
            aria-invalid={Boolean(urlError)}
            aria-describedby={urlError ? "url-error" : undefined}
            disabled={isSubmitting}
          />
          {urlError && (
            <p id="url-error" className="mt-1.5 text-sm text-red-600">
              {urlError}
            </p>
          )}
        </div>

        {/* Alias + Expiry row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label
              htmlFor="alias"
              className="block text-xs font-semibold uppercase tracking-wide text-slate mb-1.5"
            >
              Alias{" "}
              <span className="font-normal normal-case text-slate/60">
                (optional)
              </span>
            </label>
            <div
              className={cn(
                "flex items-center rounded-xl border bg-white pl-4 pr-1 transition-colors focus-within:ring-2 focus-within:ring-sky-aqua focus-within:border-sky-aqua",
                aliasError ? "border-red-400" : "border-black/10"
              )}
            >
              <span className="font-mono text-sm text-slate/50 select-none">
                /
              </span>
              <input
                id="alias"
                name="alias"
                type="text"
                autoComplete="off"
                placeholder="my-link"
                value={alias}
                onChange={(e) => handleAliasChange(e.target.value)}
                className="w-full bg-transparent py-3 pl-1 font-mono text-sm text-ink placeholder:text-slate/40 focus:outline-none"
                style={{ 
                  outline: 'none', 
                  boxShadow: 'none', 
                  border: 'none' 
                }}
                aria-invalid={Boolean(aliasError)}
                aria-describedby={aliasError ? "alias-error" : undefined}
                disabled={isSubmitting}
              />
            </div>
            {aliasError && (
              <p id="alias-error" className="mt-1.5 text-sm text-red-600">
                {aliasError}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="expiry"
              className="block text-xs font-semibold uppercase tracking-wide text-slate mb-1.5"
            >
              Expires
            </label>
            <div
              role="group"
              aria-label="Expiry"
              className={cn(
                "grid grid-cols-4 gap-1.5 rounded-xl p-1.5",
                expiryError ? "bg-red-50 ring-1 ring-red-300" : "bg-aqua-tint"
              )}
            >
              {EXPIRY_PRESETS.map((preset) => {
                const active = expiryDays === preset.value;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleExpiryChange(preset.value)}
                    disabled={isSubmitting}
                    className={cn(
                      "rounded-lg py-2.5 text-xs font-semibold transition-all",
                      active
                        ? "bg-french-blue text-white shadow-sm"
                        : "text-french-blue/70 hover:bg-white/70"
                    )}
                    aria-pressed={active}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
            {expiryError && (
              <p className="mt-1.5 text-sm text-red-600">{expiryError}</p>
            )}
          </div>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
          >
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !url.trim()}
          className={cn(
            "w-full rounded-xl py-3.5 font-display font-semibold text-base tracking-tight transition-all",
            "bg-space-indigo text-white hover:bg-indigo-deep active:scale-[0.99]",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
            "shadow-[0_10px_30px_-10px_rgba(27,38,79,0.6)]"
          )}
        >
          {isSubmitting ? "Stamping your link…" : "Shorten URL"}
        </button>
      </div>
    </form>
  );
}
