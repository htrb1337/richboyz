import { LOGO_URL as EMBEDDED_LOGO } from "./logo";

/* ============================================================
   MERCY CONFIG — binabasa mula sa window.MERCY_CONFIG na nasa
   index.html mismo. Ibig sabihin: edit mo lang yung 1 HTML file
   (Notepad), save, refresh — no rebuild needed.
   Ang mga DEFAULTS dito ay fallback lang.
============================================================ */

export type UserEntry = {
  bg?: string;
  music?: string;
  /** fallback habang naglo-load o kapag failed ang fetch */
  display?: string;
  user?: string;
  avatar?: string;
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
const PEX_SQ = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940`;
const SONG = (n: number) => `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`;

const DEFAULT_MAIN_BG = PEX(9694216);
const DEFAULT_MAIN_MUSIC = SONG(9);

const DEFAULTS: MercyConfig = {
  logo: EMBEDDED_LOGO,
  tagline: "no mercy for the wicked.",
  mainBg: DEFAULT_MAIN_BG,
  mainMusic: DEFAULT_MAIN_MUSIC,
  featured: ["162969778699501569", "269143714883063808", "438027183136571392", "1152181912273985658"],
  members: [
    "80351110224678912",
    "516078522317307904",
    "371860641867796483",
    "432344474858684416",
    "446347358366087207",
    "233060767448789506",
    "94473479288602624",
    "282859044593598464",
  ],
  users: {
    "162969778699501569": { bg: PEX(9177957), music: SONG(7), display: "mercy", user: "mercy", avatar: PEX_SQ(15160990) },
    "269143714883063808": { bg: PEX(17916245), music: SONG(8), display: "vayne", user: "vayne", avatar: PEX_SQ(33342192) },
    "438027183136571392": { bg: PEX(34940541), music: SONG(10), display: "nyx.", user: "nyx", avatar: PEX_SQ(16251531) },
    "1152181912273985658": { bg: PEX(30994960), music: SONG(13), display: "cipher", user: "cipher", avatar: PEX_SQ(21927111) },
    "80351110224678912": { bg: PEX(9694216), music: SONG(1), display: "ng manloloKO", user: "wdasfgwd", avatar: PEX_SQ(39769120) },
    "516078522317307904": { bg: PEX(17916245), music: SONG(2), display: "vex", user: "dwarkk.", avatar: "https://cdn.discordapp.com/embed/avatars/3.png" },
    "371860641867796483": { bg: PEX(10063147), music: SONG(3), display: "trx", user: "io4unic.", avatar: PEX_SQ(10794970) },
    "432344474858684416": { bg: PEX(10293280), music: SONG(4), display: "ketchap", user: "x4ug3", avatar: PEX_SQ(18339019) },
    "446347358366087207": { bg: PEX(27390676), music: SONG(5), display: "fin", user: "0xpwn_", avatar: PEX_SQ(11113383) },
    "233060767448789506": { bg: PEX(39121238), music: SONG(6), display: "444 | Raiden", user: "3xclsv.r", avatar: PEX_SQ(33245150) },
    "94473479288602624": { bg: PEX(12036096), music: SONG(11), display: "zero", user: "_0000w", avatar: PEX_SQ(16251531) },
    "282859044593598464": { bg: PEX(34940541), music: SONG(12), display: "fvckedem", user: "fvckedem", avatar: PEX_SQ(39619133) },
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
  const clean = v.filter((x): x is string => typeof x === "string" && /^\d{5,}$/.test(x.trim())).map((x) => x.trim());
  return clean.length ? clean : fallback;
}

function buildConfig(): MercyConfig {
  const c = readWindowConfig();
  const users: Record<string, UserEntry> = { ...DEFAULTS.users };
  if (c.users && typeof c.users === "object") {
    for (const [id, entry] of Object.entries(c.users)) {
      if (!/^\d{5,}$/.test(id) || !entry || typeof entry !== "object") continue;
      users[id] = { ...users[id], ...entry };
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

export const DEFAULT_AVATAR = "https://cdn.discordapp.com/embed/avatars/0.png";

export function getUser(discordId: string): Required<Pick<UserEntry, "bg" | "music">> & UserEntry {
  const u = CONFIG.users[discordId] ?? {};
  return {
    ...u,
    bg: u.bg && u.bg.trim() ? u.bg.trim() : CONFIG.mainBg,
    music: u.music && u.music.trim() ? u.music.trim() : CONFIG.mainMusic,
  };
}
