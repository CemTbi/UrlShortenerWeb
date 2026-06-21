"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { ShortenForm, type ShortenFormValues } from "@/components/ShortenForm";
import { ResultStub } from "@/components/ResultStub";
import { RecentLinksList } from "@/components/RecentLinksList";
import { useRecentLinks } from "@/hooks/useRecentLinks";
import {
  createShortUrl,
  getShortUrl,
  ApiError,
  buildShortLink,
} from "@/lib/api";
import type { RecentLink } from "@/types/url";

export default function Home() {
  const { links, hydrated, addLink, updateLink, removeLink, clearAll } =
    useRecentLinks();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<RecentLink | null>(null);
  const [resultKey, setResultKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function refreshLinks(linksToRefresh: RecentLink[]) {
    if (linksToRefresh.length === 0) return;
    setIsRefreshing(true);
    try {
      const results = await Promise.allSettled(
        linksToRefresh.map((link) => getShortUrl(link.code))
      );

      results.forEach((res, i) => {
        if (res.status !== "fulfilled") return; // link may have been deleted/expired server-side — leave the cached copy as-is
        const fresh = res.value;
        const link = linksToRefresh[i];
        const patch: Partial<RecentLink> = {};
        if (
          fresh.lastAccessedAt !== undefined &&
          fresh.lastAccessedAt !== link.lastAccessedAt
        ) {
          patch.lastAccessedAt = fresh.lastAccessedAt;
        }
        if (
          fresh.expiryDate !== undefined &&
          fresh.expiryDate !== link.expiryDate
        ) {
          patch.expiryDate = fresh.expiryDate;
        }
        if (Object.keys(patch).length > 0) {
          updateLink(link.code, patch);
        }
      });
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    if (!hydrated) return;
    refreshLinks(links);
  }, [hydrated]);

  async function handleSubmit(values: ShortenFormValues) {
    setIsSubmitting(true);
    setErrorMessage(null);
    setFieldErrors({});
    try {
      const response = await createShortUrl({
        url: values.url,
        alias: values.alias || undefined,
        expiryDays: values.expiryDays ?? undefined,
      });

      const shortUrl = buildShortLink(response.code);

      const link: RecentLink = {
        id: `${response.code}-${Date.now()}`,
        code: response.code,
        alias: response.alias ?? null,
        longUrl: response.url,
        shortUrl,
        expiryDate: response.expiryDate ?? null,
        lastAccessedAt: response.lastAccessedAt ?? null,
        createdAt: response.createdAt ?? new Date().toISOString(),
      };

      addLink(link);
      setResult(link);
      setResultKey((k) => k + 1);
    } catch (err) {
      if (err instanceof ApiError) {
        const hasFieldErrors = Object.keys(err.fieldErrors).length > 0;
        setFieldErrors(err.fieldErrors);
        setErrorMessage(hasFieldErrors ? null : err.message);
      } else if (err instanceof TypeError) {
        setErrorMessage(
          "Couldn't reach the shortener service. Is the API running?"
        );
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex-1">
      {/* Hero */}
      <div className="bg-grid">
        <SiteHeader />

        <div className="mx-auto max-w-3xl px-6 sm:px-10 pt-10 pb-20 sm:pt-14 sm:pb-28 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-sky-aqua mb-4">
            URL shortener
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-white leading-[1.08]">
            Paste a long link.
            <br />
            Get a short stub.
          </h1>
          <p className="mt-4 text-base text-white/70 max-w-md mx-auto">
            Custom aliases, expiry dates, and a scannable QR code —
            every time.
          </p>
        </div>
      </div>

      {/* Form + result, pulled up over the hero */}
      <div className="mx-auto max-w-3xl px-6 sm:px-10 -mt-12 sm:-mt-16 pb-10">
        <ShortenForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
          fieldErrors={fieldErrors}
        />

        {result && (
          <div className="mt-8">
            <ResultStub link={result} animationKey={String(resultKey)} />
          </div>
        )}
      </div>

      {/* Recent links */}
      <div className="mx-auto max-w-3xl px-6 sm:px-10 pb-20">
        <RecentLinksList
          links={links}
          hydrated={hydrated}
          isRefreshing={isRefreshing}
          onRemove={removeLink}
          onClearAll={clearAll}
          onRefresh={() => refreshLinks(links)}
        />
      </div>
    </main>
  );
}

