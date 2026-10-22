import { LOGO_URL as EMBEDDED_LOGO } from "./logo";

/* ============================================================
   MERCY CONFIG — binabasa mula sa window.MERCY_CONFIG na nasa
   index.html mismo. Edit mo lang yung 1 HTML file (Notepad),
   save, refresh. No rebuild, no setup.
   ------------------------------------------------------------
   CONFIG = ID + BG + MUSIC lang. Walang manual names.
   Pangalan, avatar, decoration = 100% auto-fetch sa Discord.
============================================================ */

export type UserEntry = {
  bg?: string;
  music?: string;
};

export type MercyConfig = {
  logo: string;
  tagline: string;
  mainBg: string;
  mainMusic: string;
  featured: string[];
  members: string[];
  users: Record<string, UserEntry>;
};

const PEX = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200`;
const SONG = (n: number) => `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`;

const DEFAULTS: MercyConfig = {
  logo: EMBEDDED_LOGO,
  tagline: "no mercy for the wicked.",
  mainBg: PEX(9694216),
  mainMusic: SONG(9),
  featured: [
    "94490510688792576",
    "235148962103951360",
    "155149108183695360",
    "936929561302675456",
  ],
  members: [
    "80351110224678912",
    "282859044593598464",
    "270904126974590976",
    "432610292342587392",
    "159985870458322944",
    "235088799074484224",
    "713586207119900693",
    "172002275412279296",
  ],
  users: {
    "94490510688792576": { bg: PEX(9177957), music: SONG(7) },
    "235148962103951360": { bg: PEX(17916245), music: SONG(8) },
    "155149108183695360": { bg: PEX(34940541), music: SONG(10) },
    "936929561302675456": { bg: PEX(30994960), music: SONG(13) },
    "80351110224678912": { bg: PEX(9694216), music: SONG(1) },
    "282859044593598464": { bg: PEX(17916245), music: SONG(2) },
    "270904126974590976": { bg: PEX(10063147), music: SONG(3) },
    "432610292342587392": { bg: PEX(10293280), music: SONG(4) },
    "159985870458322944": { bg: PEX(27390676), music: SONG(5) },
    "235088799074484224": { bg: PEX(39121238), music: SONG(6) },
    "713586207119900693": { bg: PEX(12036096), music: SONG(11) },
    "172002275412279296": { bg: PEX(34940541), music: SONG(12) },
  },
};

function readWindowConfig(): Partial<MercyConfig> {
  try {
    const w = window as unknown as { MERCY_CONFIG?: Partial<MercyConfig> };
    if (w && w.MERCY_CONFIG && typeof w.MERCY_CONFIG === "object") return w.MERCY_CONFIG;
  } catch {
    /* ignore */
  }
  return {};
}

function pickStr(v: unknown, fallback: string): string {
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}

function pickIds(v: unknown, fallback: string[]): string[] {
  if (!Array.isArray(v)) return fallback;
  const clean = v
    .filter((x): x is string => typeof x === "string" && /^\d{5,}$/.test(x.trim()))
    .map((x) => x.trim());
  return clean.length ? clean : fallback;
}

function buildConfig(): MercyConfig {
  const c = readWindowConfig();
  const users: Record<string, UserEntry> = { ...DEFAULTS.users };
  if (c.users && typeof c.users === "object") {
    for (const [id, entry] of Object.entries(c.users)) {
      if (!/^\d{5,}$/.test(id) || !entry || typeof entry !== "object") continue;
      const e = entry as UserEntry;
      users[id] = {
        ...users[id],
        ...(typeof e.bg === "string" && e.bg.trim() ? { bg: e.bg.trim() } : {}),
        ...(typeof e.music === "string" && e.music.trim() ? { music: e.music.trim() } : {}),
      };
    }
  }
  return {
    logo: pickStr(c.logo, DEFAULTS.logo),
    tagline: pickStr(c.tagline, DEFAULTS.tagline),
    mainBg: pickStr(c.mainBg, DEFAULTS.mainBg),
    mainMusic: pickStr(c.mainMusic, DEFAULTS.mainMusic),
    featured: pickIds(c.featured, DEFAULTS.featured),
    members: pickIds(c.members, DEFAULTS.members),
    users,
  };
}

export const CONFIG: MercyConfig = buildConfig();

export function getUserMedia(discordId: string): { bg: string; music: string } {
  const u = CONFIG.users[discordId] ?? {};
  return {
    bg: u.bg && u.bg.trim() ? u.bg.trim() : CONFIG.mainBg,
    music: u.music && u.music.trim() ? u.music.trim() : CONFIG.mainMusic,
  };
}
