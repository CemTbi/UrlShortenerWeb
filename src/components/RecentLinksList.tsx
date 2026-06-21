"use client";

import { useState } from "react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { formatRelative, formatDate, isExpired } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { RecentLink } from "@/types/url";

interface RecentLinksListProps {
  links: RecentLink[];
  hydrated: boolean;
  isRefreshing?: boolean;
  onRemove: (code: string) => void;
  onClearAll: () => void;
  onRefresh: () => void;
}

function RecentLinkRow({
  link,
  onRemove,
}: {
  link: RecentLink;
  onRemove: (code: string) => void;
}) {
  const { copied, copy } = useCopyToClipboard();
  const expired = isExpired(link.expiryDate);

  return (
    <li className="group flex items-center gap-4 rounded-xl px-4 py-3.5 transition-colors hover:bg-aqua-tint/60">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <a
            href={link.shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm font-semibold text-space-indigo hover:text-french-blue truncate"
          >
            {link.shortUrl.replace(/^https?:\/\//, "")}
          </a>
          {expired && (
            <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-600">
              Expired
            </span>
          )}
        </div>
        <p className="truncate text-xs text-slate mt-0.5">{link.longUrl}</p>
      </div>

      <div className="hidden sm:block shrink-0 text-right">
        <p className="text-xs text-slate tabular">
          {formatRelative(link.lastAccessedAt)}
        </p>
        <p className="text-[11px] text-slate/60 tabular">
          {link.expiryDate ? `exp. ${formatDate(link.expiryDate)}` : "no expiry"}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={() => copy(link.shortUrl)}
          title="Copy link"
          className={cn(
            "rounded-lg p-2 text-xs font-semibold transition-colors",
            copied
              ? "bg-sky-aqua/20 text-french-blue"
              : "text-slate hover:bg-white hover:text-french-blue"
          )}
        >
          {copied ? "✓" : "Copy"}
        </button>
        <button
          type="button"
          onClick={() => onRemove(link.code)}
          title="Remove from recent links"
          className="rounded-lg p-2 text-slate/50 opacity-0 transition-opacity hover:bg-white hover:text-red-500 group-hover:opacity-100"
          aria-label={`Remove ${link.shortUrl} from recent links`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 6L18 18M6 18L18 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </li>
  );
}

export function RecentLinksList({
  links,
  hydrated,
  isRefreshing = false,
  onRemove,
  onClearAll,
  onRefresh,
}: RecentLinksListProps) {
  const [confirmingClear, setConfirmingClear] = useState(false);

  return (
    <section className="rounded-2xl bg-white ring-1 ring-black/5 shadow-sm">
      <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
        <div>
          <h2 className="font-display text-base font-semibold text-ink">
            Recent links
          </h2>
          <p className="text-xs text-slate mt-0.5">
            Stored on this device only
          </p>
        </div>
        <div className="flex items-center gap-4">
          {links.length > 0 && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh last-accessed times from the server"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate hover:text-french-blue disabled:opacity-50 transition-colors"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className={cn(isRefreshing && "animate-spin")}
              >
                <path
                  d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isRefreshing ? "Refreshing…" : "Refresh"}
            </button>
          )}
          {links.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirmingClear) {
                  onClearAll();
                  setConfirmingClear(false);
                } else {
                  setConfirmingClear(true);
                  setTimeout(() => setConfirmingClear(false), 3000);
                }
              }}
              className={cn(
                "text-xs font-semibold transition-colors",
                confirmingClear
                  ? "text-red-600"
                  : "text-slate hover:text-french-blue"
              )}
            >
              {confirmingClear ? "Click again to clear" : "Clear all"}
            </button>
          )}
        </div>
      </div>

      {!hydrated ? (
        <div className="px-6 py-10 text-center text-sm text-slate">
          Loading your links…
        </div>
      ) : links.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <p className="text-sm font-medium text-ink">No links yet</p>
          <p className="mt-1 text-xs text-slate">
            Shorten a URL above and it&apos;ll show up here, on this browser.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-black/5 px-2 py-2">
          {links.map((link) => (
            <RecentLinkRow key={link.code} link={link} onRemove={onRemove} />
          ))}
        </ul>
      )}
    </section>
  );
}
