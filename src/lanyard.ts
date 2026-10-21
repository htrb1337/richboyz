// Live Discord profile + presence via Lanyard REST API.
// Profile (avatar, display, user, decoration) + status + activity lahat galing dito.
// REQUIREMENT: bawat user kailangan nasa https://discord.gg/lanyard server,
// kung hindi → "not-monitored" error ang ibabalik ng API.

import { useCallback, useEffect, useState } from "react";

export type LanyardActivity = {
  id: string;
  name: string;
  type: number; // 0 Playing, 1 Streaming, 2 Listening, 3 Watching, 4 Custom, 5 Competing
  details?: string | null;
  state?: string | null;
  emoji?: { name?: string } | null;
  timestamps?: { start?: number } | null;
  assets?: {
    large_image?: string | null;
    large_text?: string | null;
    small_image?: string | null;
  } | null;
};

export type DiscordUser = {
  id: string;
  username: string;
  global_name?: string | null;
  display_name?: string | null;
  avatar?: string | null;
  discriminator: string;
  avatar_decoration_data?: { asset: string; sku_id: string } | null;
};

export type LanyardData = {
  discord_user: DiscordUser;
  discord_status: "online" | "idle" | "dnd" | "offline";
  activities: LanyardActivity[];
  listening_to_spotify: boolean;
  spotify?: {
    track_id: string;
    song: string;
    artist: string;
    album: string;
    album_art_url?: string | null;
  } | null;
};

export type LanyardError = "not-monitored" | "not-found" | "network" | null;

type CacheEntry = { data: LanyardData | null; error: LanyardError; at: number };

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<CacheEntry>>();
const listeners = new Map<string, Set<(e: CacheEntry) => void>>();

function notify(id: string, entry: CacheEntry) {
  listeners.get(id)?.forEach((fn) => {
    try {
      fn(entry);
    } catch {
      /* ignore */
    }
  });
}

function parseError(json: unknown): LanyardError {
  try {
    const j = json as { success?: boolean; error?: { message?: string } | string };
    const msg = typeof j?.error === "string" ? j.error : j?.error?.message ?? "";
    if (/monitor/i.test(msg)) return "not-monitored";
    if (j?.success === false) return "not-found";
  } catch {
    /* ignore */
  }
  return "not-found";
}

export async function fetchLanyard(id: string, force = false): Promise<CacheEntry> {
  const now = Date.now();
  const cached = cache.get(id);
  if (!force && cached && now - cached.at < 10000) return cached;
  if (inflight.has(id)) return inflight.get(id)!;

  const p = (async (): Promise<CacheEntry> => {
    try {
      const res = await fetch(`https://api.lanyard.rest/v1/users/${id}`, { cache: "no-store" });
      if (!res.ok) {
        const entry: CacheEntry = {
          data: cached?.data ?? null,
          error: res.status === 404 ? "not-found" : "network",
          at: now,
        };
        cache.set(id, entry);
        notify(id, entry);
        return entry;
      }
      const json: unknown = await res.json();
      const j = json as { success?: boolean; data?: LanyardData };
      if (j?.success && j?.data) {
        const entry: CacheEntry = { data: j.data, error: null, at: now };
        cache.set(id, entry);
        notify(id, entry);
        return entry;
      }
      const entry: CacheEntry = { data: null, error: parseError(json), at: now };
      cache.set(id, entry);
      notify(id, entry);
      return entry;
    } catch {
      const entry: CacheEntry = { data: cached?.data ?? null, error: "network", at: now };
      cache.set(id, entry);
      notify(id, entry);
      return entry;
    } finally {
      inflight.delete(id);
    }
  })();

  inflight.set(id, p);
  return p;
}

export function useLanyard(id: string) {
  const [entry, setEntry] = useState<CacheEntry>(
    () => cache.get(id) ?? { data: null, error: null, at: 0 }
  );
  const [loading, setLoading] = useState(() => !cache.get(id));

  useEffect(() => {
    let alive = true;
    const existing = cache.get(id);
    if (existing) {
      setEntry({ ...existing });
      setLoading(false);
    } else {
      setLoading(true);
    }
    fetchLanyard(id).then((e) => {
      if (alive) {
        setEntry({ ...e });
        setLoading(false);
      }
    });
    if (!listeners.has(id)) listeners.set(id, new Set());
    const set = listeners.get(id)!;
    const onUpdate = (e: CacheEntry) => {
      if (alive) {
        setEntry({ ...e });
        setLoading(false);
      }
    };
    set.add(onUpdate);
    const t = window.setInterval(() => {
      fetchLanyard(id, true);
    }, 15000);
    const onVis = () => {
      if (document.visibilityState === "visible") fetchLanyard(id, true);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      alive = false;
      set.delete(onUpdate);
      window.clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [id]);

  const retry = useCallback(() => {
    setLoading(true);
    fetchLanyard(id, true).then((e) => {
      setEntry({ ...e });
      setLoading(false);
    });
  }, [id]);

  return { data: entry.data, loading, error: entry.error, retry };
}

/* ---------- profile helpers (lahat fetched) ---------- */

export function avatarUrl(u: DiscordUser, size = 256): string {
  if (!u.avatar) {
    try {
      if (u.discriminator && u.discriminator !== "0") {
        return `https://cdn.discordapp.com/embed/avatars/${Number(u.discriminator) % 5}.png`;
      }
      const idx = Number((BigInt(u.id) >> 22n) % 6n);
      return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
    } catch {
      return "https://cdn.discordapp.com/embed/avatars/0.png";
    }
  }
  const ext = u.avatar.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${ext}?size=${size}`;
}

export function decorationUrl(u: DiscordUser, size = 256): string | null {
  const asset = u.avatar_decoration_data?.asset;
  if (!asset) return null;
  return `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png?size=${size}`;
}

export function displayNameOf(u: DiscordUser): string {
  return u.global_name || u.display_name || u.username;
}

export function usernameOf(u: DiscordUser): string {
  return u.username;
}

export const STATUS_COLORS: Record<string, string> = {
  online: "#23a55a",
  idle: "#f0b232",
  dnd: "#f23f43",
  offline: "#5c5e66",
};

export function elapsedSince(start?: number | null) {
  if (!start) return null;
  const mins = Math.max(0, Math.floor((Date.now() - start) / 60000));
  if (mins < 1) return "just started";
  if (mins < 60) return `${mins}m elapsed`;
  const h = Math.floor(mins / 60);
  return `${h}h ${mins % 60}m elapsed`;
}
