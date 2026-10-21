// Live Discord presence via Lanyard REST API.
// How to use your own accounts:
// 1. Enable Discord Developer Mode → right-click your profile → Copy User ID
// 2. Join https://discord.gg/lanyard (required for presence to be public)
// 3. Replace the `discordId` fields in App.tsx with your IDs.

import { useEffect, useState } from "react";

export type LanyardActivity = {
  id: string;
  name: string;
  type: number; // 0 = Playing, 1 = Streaming, 2 = Listening, 3 = Watching, 4 = Custom, 5 = Competing
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

export type LanyardData = {
  discord_user: {
    id: string;
    username: string;
    global_name?: string | null;
    avatar?: string | null;
    discriminator: string;
  };
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

const cache = new Map<string, LanyardData | null>();
const inflight = new Map<string, Promise<LanyardData | null>>();

async function fetchLanyard(id: string): Promise<LanyardData | null> {
  if (cache.has(id) && cache.get(id)) return cache.get(id) as LanyardData;
  if (inflight.has(id)) return inflight.get(id)!;
  const p = (async () => {
    try {
      const res = await fetch(`https://api.lanyard.rest/v1/users/${id}`);
      if (!res.ok) return null;
      const json = await res.json();
      if (json?.success && json?.data) {
        cache.set(id, json.data as LanyardData);
        return json.data as LanyardData;
      }
      return null;
    } catch {
      return null;
    } finally {
      inflight.delete(id);
    }
  })();
  inflight.set(id, p);
  return p;
}

export function useLanyard(id: string) {
  const [data, setData] = useState<LanyardData | null>(() => cache.get(id) ?? null);
  const [loading, setLoading] = useState(() => !cache.has(id));

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const d = await fetchLanyard(id);
      if (alive) {
        setData(d);
        setLoading(false);
      }
    };
    if (!cache.has(id)) {
      load();
    } else {
      setData(cache.get(id) ?? null);
      setLoading(false);
    }
    const t = window.setInterval(load, 30000);
    return () => {
      alive = false;
      window.clearInterval(t);
    };
  }, [id]);

  return { data, loading };
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
