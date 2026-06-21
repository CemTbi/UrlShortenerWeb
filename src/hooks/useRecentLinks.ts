"use client";

import { useCallback, useEffect, useState } from "react";
import type { RecentLink } from "@/types/url";

const STORAGE_KEY = "stub:recent-links";
const MAX_ITEMS = 25;

function readFromStorage(): RecentLink[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as RecentLink[];
  } catch {
    return [];
  }
}

function writeToStorage(links: RecentLink[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  } catch {
    // localStorage unavailable (private mode / quota) — fail silently,
    // the list just won't persist this session.
  }
}

export function useRecentLinks() {
  const [hydrated, setHydrated] = useState(false);
  const [links, setLinks] = useState<RecentLink[]>([]);
  useEffect(() => {
    const stored = readFromStorage();
    setLinks(stored);
    setHydrated(true);
  }, []);

  // keep multiple tabs in sync
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) {
        setLinks(readFromStorage());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addLink = useCallback((link: RecentLink) => {
    setLinks((prev) => {
      const deduped = prev.filter((l) => l.code !== link.code);
      const next = [link, ...deduped].slice(0, MAX_ITEMS);
      writeToStorage(next);
      return next;
    });
  }, []);

  const updateLink = useCallback(
    (code: string, patch: Partial<RecentLink>) => {
      setLinks((prev) => {
        const next = prev.map((l) =>
          l.code === code ? { ...l, ...patch } : l
        );
        writeToStorage(next);
        return next;
      });
    },
    []
  );

  const removeLink = useCallback((code: string) => {
    setLinks((prev) => {
      const next = prev.filter((l) => l.code !== code);
      writeToStorage(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setLinks([]);
    writeToStorage([]);
  }, []);

  return { links, hydrated, addLink, updateLink, removeLink, clearAll };
}
