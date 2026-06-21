"use client";

import { useState } from "react";
import Image from "next/image";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { buildQrCodeUrl } from "@/lib/qrcode";
import { formatDate, daysUntil } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { RecentLink } from "@/types/url";

interface ResultStubProps {
  link: RecentLink;
  /** unique key forces remount + replay of the rise animation on each new result */
  animationKey: string;
}

export function ResultStub({ link, animationKey }: ResultStubProps) {
  const { copied, copy } = useCopyToClipboard();
  const [qrFailed, setQrFailed] = useState(false);
  const qrUrl = buildQrCodeUrl(link.shortUrl, {
    size: 240,
    foreground: "1B264F",
    background: "FFFFFF",
  });

  const remaining = daysUntil(link.expiryDate);
  const expiryLabel = !link.expiryDate
    ? "Never expires"
    : remaining !== null && remaining <= 0
      ? "Expired"
      : `Expires ${formatDate(link.expiryDate)}`;

  return (
    <div key={animationKey} className="animate-rise">
      <div className="rounded-2xl bg-white shadow-[0_30px_80px_-24px_rgba(15,21,48,0.45)] ring-1 ring-black/5 overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          {/* Left: link details */}
          <div className="flex-1 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate mb-2">
              Your short link
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={link.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xl sm:text-2xl font-bold text-space-indigo hover:text-french-blue break-all"
              >
                {link.shortUrl.replace(/^https?:\/\//, "")}
              </a>
              <button
                type="button"
                onClick={() => copy(link.shortUrl)}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  copied
                    ? "bg-sky-aqua/20 text-french-blue"
                    : "bg-french-blue text-white hover:bg-indigo-deep"
                )}
              >
                {copied ? "Copied ✓" : "Copy"}
              </button>
            </div>

            <p className="mt-3 text-sm text-slate break-all line-clamp-2">
              {link.longUrl}
            </p>

            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-black/5 pt-4">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate/70">
                  Status
                </dt>
                <dd
                  className={cn(
                    "mt-0.5 text-sm font-medium",
                    expiryLabel === "Expired" ? "text-red-600" : "text-ink"
                  )}
                >
                  {expiryLabel}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate/70">
                  Created
                </dt>
                <dd className="mt-0.5 text-sm font-medium text-ink">
                  {formatDate(link.createdAt)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Perforation divider — desktop: vertical, mobile: horizontal */}
          <div className="relative hidden sm:block w-0 perforation">
            <span className="notch notch-top" style={{ top: "-11px" }} />
            <span className="notch notch-bottom" style={{ bottom: "-11px" }} />
          </div>
          <div className="relative sm:hidden h-0 border-t-2 border-dashed border-black/10" />

          {/* Right: QR stub */}
          <div className="flex flex-col items-center justify-center gap-3 bg-aqua-tint p-6 sm:p-8 sm:w-[200px]">
            {!qrFailed ? (
              <div className="rounded-xl bg-white p-2 shadow-sm ring-1 ring-black/5">
                <Image
                  src={qrUrl}
                  alt={`QR code linking to ${link.shortUrl}`}
                  width={140}
                  height={140}
                  unoptimized
                  onError={() => setQrFailed(true)}
                />
              </div>
            ) : (
              <div className="flex h-[148px] w-[148px] items-center justify-center rounded-xl bg-white text-center text-xs text-slate ring-1 ring-black/5 p-3">
                QR code unavailable right now
              </div>
            )}
            <a
              href={qrUrl}
              download={`qr-${link.code}.png`}
              className="text-xs font-semibold text-french-blue hover:text-space-indigo underline underline-offset-2"
            >
              Download QR
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
