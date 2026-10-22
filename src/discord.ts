// ============================================================
// DISCORD FETCH — 2 sources, automatic:
//  1. PROFILE (display name, username, avatar, decoration)
//     → lookupbotdc API. Gumagana sa LAHAT ng valid Discord ID.
//     Walang need na membership, walang setup.
//  2. PRESENCE (online/idle/dnd dot + Playing/Spotify activity)
//     → Lanyard. Kailangan nasa discord.gg/lanyard yung user.
//     Kung wala siya dun: grey dot + "No Current Activity".
// ============================================================

import { useEffect, useState } from "react";

export type DiscordProfile = {
  id: string;
  username: string;
  display: string;
  avatar: string;
  decoration: string | null;
};

export type PresenceActivity = {
  id: string;
  name: string;
  type: number; // 0 Playing, 1 Streaming, 2 Listening, 3 Watching, 5 Competing
  details?: string | null;
  state?: string | null;
  timestamps?: { start?: number } | null;
};

export type Presence = {
  status: "online" | "idle" | "dnd" | "offline";
  activities: PresenceActivity[];
  listening_to_spotify: boolean;
  spotify?: {
    song: string;
    artist: string;
    album: string;
    album_art_url?: string | null;
  } | null;
};

type ProfileEntry = { profile: DiscordProfile | null; notFound: boolean; at: number };

const profileCache = new Map<string, ProfileEntry>();
const profileInflight = new Map<string, Promise<ProfileEntry>>();
const profileListeners = new Map<string, Set<(e: ProfileEntry) => void>>();

const presenceCache = new Map<string, { presence: Presence | null; at: number }>();
const presenceInflight = new Map<string, Promise<Presence | null>>();
const presenceListeners = new Map<string, Set<(p: Presence | null) => void>>();

function notifyProfile(id: string, e: ProfileEntry) {
  profileListeners.get(id)?.forEach((fn) => {
    try {
      fn(e);
    } catch {
      /* ignore */
    }
  });
}

function notifyPresence(id: string, p: Presence | null) {
  presenceListeners.get(id)?.forEach((fn) => {
    try {
      fn(p);
    } catch {
      /* ignore */
    }
  });
}

export function defaultAvatar(id: string): string {
  try {
    return `https://cdn.discordapp.com/embed/avatars/${Number((BigInt(id) >> 22n) % 6n)}.png`;
  } catch {
    return "https://cdn.discordapp.com/embed/avatars/0.png";
  }
}

/* ---------- 1. PROFILE — works for any valid ID ---------- */
async function fetchProfile(id: string): Promise<ProfileEntry> {
  const now = Date.now();
  const cached = profileCache.get(id);
  if (cached && now - cached.at < 5 * 60 * 1000) return cached;
  if (profileInflight.has(id)) return profileInflight.get(id)!;

  const p = (async (): Promise<ProfileEntry> => {
    try {
      const res = await fetch(`https://discord-lookup.lookupbotdc.workers.dev/search/${id}`);
      const json: unknown = await res.json().catch(() => null);
      const u = (json as { user?: Record<string, unknown> } | null)?.user;
      if (!res.ok || !u || typeof u.id !== "string") {
        const entry: ProfileEntry = {
          profile: cached?.profile ?? null,
          notFound: !cached?.profile,
          at: now,
        };
        profileCache.set(id, entry);
        notifyProfile(id, entry);
        return entry;
      }
      const j = json as { avatar_url?: string | null; avatar_url_gif?: string | null };
      const deco = u.avatar_decoration_data as { asset?: string } | null | undefined;
      const username = typeof u.username === "string" ? u.username : "unknown";
      const display =
        typeof u.global_name === "string" && u.global_name ? u.global_name : username;
      const profile: DiscordProfile = {
        id: u.id as string,
        username,
        display,
        avatar: j.avatar_url_gif || j.avatar_url || defaultAvatar(id),
        decoration: deco?.asset
          ? `https://cdn.discordapp.com/avatar-decoration-presets/${deco.asset}.png?size=256`
          : null,
      };
      const entry: ProfileEntry = { profile, notFound: false, at: now };
      profileCache.set(id, entry);
      notifyProfile(id, entry);
      return entry;
    } catch {
      // network error — keep old profile, allow quick retry
      return { profile: cached?.profile ?? null, notFound: false, at: 0 };
    } finally {
      profileInflight.delete(id);
    }
  })();

  profileInflight.set(id, p);
  return p;
}

/* ---------- 2. PRESENCE — Lanyard (needs membership) ---------- */
async function fetchPresence(id: string, force = false): Promise<Presence | null> {
  const now = Date.now();
  const cached = presenceCache.get(id);
  if (!force && cached && now - cached.at < 10000) return cached.presence;
  if (presenceInflight.has(id)) return presenceInflight.get(id)!;

  const p = (async (): Promise<Presence | null> => {
    try {
      const res = await fetch(`https://api.lanyard.rest/v1/users/${id}`, { cache: "no-store" });
      if (!res.ok) return cached?.presence ?? null;
      const json = (await res.json()) as {
        success?: boolean;
        data?: {
          discord_status?: Presence["status"];
          activities?: PresenceActivity[];
          listening_to_spotify?: boolean;
          spotify?: Presence["spotify"];
        };
      };
      if (json?.success && json?.data) {
        const d = json.data;
        const presence: Presence = {
          status: d.discord_status ?? "offline",
          activities: Array.isArray(d.activities) ? d.activities : [],
          listening_to_spotify: !!d.listening_to_spotify,
          spotify: d.spotify ?? null,
        };
        presenceCache.set(id, { presence, at: now });
        notifyPresence(id, presence);
        return presence;
      }
      // not monitored → no presence (quiet)
      presenceCache.set(id, { presence: null, at: now });
      return null;
    } catch {
      return cached?.presence ?? null;
    } finally {
      presenceInflight.delete(id);
    }
  })();

  presenceInflight.set(id, p);
  return p;
}

/* ---------- one hook for everything ---------- */
export function useDiscord(id: string) {
  const [profile, setProfile] = useState<DiscordProfile | null>(
    () => profileCache.get(id)?.profile ?? null
  );
  const [notFound, setNotFound] = useState(false);
  const [profileLoading, setProfileLoading] = useState(
    () => !profileCache.get(id)?.profile
  );
  const [presence, setPresence] = useState<Presence | null>(
    () => presenceCache.get(id)?.presence ?? null
  );

  useEffect(() => {
    let alive = true;

    const pc = profileCache.get(id);
    if (pc?.profile) {
      setProfile(pc.profile);
      setProfileLoading(false);
      setNotFound(false);
    } else {
      setProfile(null);
      setProfileLoading(true);
      setNotFound(false);
    }
    fetchProfile(id).then((e) => {
      if (!alive) return;
      setProfile(e.profile);
      setNotFound(e.notFound && !e.profile);
      setProfileLoading(false);
    });
    if (!profileListeners.has(id)) profileListeners.set(id, new Set());
    const pset = profileListeners.get(id)!;
    const onProfile = (e: ProfileEntry) => {
      if (!alive) return;
      setProfile(e.profile);
      setNotFound(e.notFound && !e.profile);
      setProfileLoading(false);
    };
    pset.add(onProfile);

    const pr = presenceCache.get(id);
    setPresence(pr?.presence ?? null);
    fetchPresence(id).then((p) => {
      if (alive) setPresence(p);
    });
    if (!presenceListeners.has(id)) presenceListeners.set(id, new Set());
    const rset = presenceListeners.get(id)!;
    const onPresence = (p: Presence | null) => {
      if (alive) setPresence(p);
    };
    rset.add(onPresence);

    const t = window.setInterval(() => {
      fetchPresence(id, true);
    }, 15000);
    const onVis = () => {
      if (document.visibilityState === "visible") fetchPresence(id, true);
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      alive = false;
      pset.delete(onProfile);
      rset.delete(onPresence);
      window.clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [id]);

  return { profile, profileLoading, notFound, presence };
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
