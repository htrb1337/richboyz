export type DiscordProfile = {
  id: string;
  username: string;
  displayName: string;
  tag: string;
  avatarUrl: string;
  bannerUrl: string | null;
  decorationUrl: string | null;
  clanTag: string | null;
  clanBadgeUrl: string | null;
  accentColor: string | null;
};

function defaultAvatar(id: string) {
  try {
    const idx = Number((BigInt(id) >> 22n) % 6n);
    return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
  } catch {
    return "https://cdn.discordapp.com/embed/avatars/0.png";
  }
}

function decorationUrl(asset?: string | null) {
  if (!asset) return null;
  return `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png?size=240&passthrough=true`;
}

function clanBadgeUrl(guildId?: string | null, badge?: string | null) {
  if (!guildId || !badge) return null;
  return `https://cdn.discordapp.com/clan-badges/${guildId}/${badge}.png?size=64`;
}

function formatTag(username: string, discriminator?: string | null, rawTag?: string | null) {
  if (rawTag && rawTag.includes("#") && !rawTag.endsWith("#0")) return rawTag;
  if (discriminator && discriminator !== "0") return `${username}#${discriminator}`;
  return `@${username}`;
}

async function getJSON(url: string, timeout = 5200): Promise<any> {
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`status ${res.status}`);
    return await res.json();
  } finally {
    window.clearTimeout(timer);
  }
}

function fromCyan(data: any): DiscordProfile | null {
  if (!data?.id || data.success === false) return null;
  const username = data.username || "unknown";
  const decoAsset =
    data.avatar_decoration?.asset || data.avatar_decoration_data?.asset || null;
  const clan = data.clan || data.primary_guild || data.guild_tag || null;
  return {
    id: String(data.id),
    username,
    displayName: data.display_name || data.global_name || username,
    tag: formatTag(username, data.discriminator, data.tag),
    avatarUrl: data.avatarUrl || data.avatar_url || defaultAvatar(data.id),
    bannerUrl: data.bannerUrl || data.banner_url || null,
    decorationUrl: decorationUrl(decoAsset),
    clanTag: clan?.tag || null,
    clanBadgeUrl: clanBadgeUrl(
      clan?.identity_guild_id || clan?.id || clan?.guild_id,
      clan?.badge,
    ),
    accentColor: data.banner_color || null,
  };
}

function fromJapi(json: any): DiscordProfile | null {
  const data = json?.data;
  if (!data?.id) return null;
  const username = data.username || "unknown";
  const decoAsset = data.avatar_decoration_data?.asset || null;
  const clan = data.clan || data.primary_guild || null;
  let avatar = data.avatarURL as string | undefined;
  if (avatar && !avatar.includes("size=")) avatar = `${avatar}?size=512`;
  return {
    id: String(data.id),
    username,
    displayName: data.global_name || username,
    tag: formatTag(username, data.discriminator, data.tag),
    avatarUrl: avatar || defaultAvatar(data.id),
    bannerUrl: data.bannerURL || null,
    decorationUrl: decorationUrl(decoAsset),
    clanTag: clan?.tag || null,
    clanBadgeUrl: clanBadgeUrl(
      clan?.identity_guild_id || clan?.id || clan?.guild_id,
      clan?.badge,
    ),
    accentColor: data.banner_color || null,
  };
}

function fromLanyard(json: any): DiscordProfile | null {
  const user = json?.data?.discord_user;
  if (!user?.id) return null;
  const username = user.username || "unknown";
  const hash = user.avatar as string | null;
  const animated = Boolean(hash?.startsWith("a_"));
  const avatarUrl = hash
    ? `https://cdn.discordapp.com/avatars/${user.id}/${hash}.${animated ? "gif" : "png"}?size=512`
    : defaultAvatar(user.id);
  const decoAsset = user.avatar_decoration_data?.asset || null;
  const clan = user.primary_guild || user.clan || null;
  const banner = user.banner as string | null;
  return {
    id: String(user.id),
    username,
    displayName: user.display_name || user.global_name || username,
    tag: formatTag(username, user.discriminator),
    avatarUrl,
    bannerUrl: banner
      ? `https://cdn.discordapp.com/banners/${user.id}/${banner}.${banner.startsWith("a_") ? "gif" : "png"}?size=512`
      : null,
    decorationUrl: decorationUrl(decoAsset),
    clanTag: clan?.tag || null,
    clanBadgeUrl: clanBadgeUrl(clan?.identity_guild_id || clan?.id, clan?.badge),
    accentColor: null,
  };
}

export async function fetchDiscordProfile(id: string): Promise<DiscordProfile> {
  const sources = [
    () => getJSON(`https://avatar-cyan.vercel.app/api/${id}`).then(fromCyan),
    () => getJSON(`https://japi.rest/discord/v1/user/${id}`).then(fromJapi),
    () => getJSON(`https://api.lanyard.rest/v1/users/${id}`).then(fromLanyard),
  ];

  for (const source of sources) {
    try {
      const profile = await source();
      if (profile) return profile;
    } catch {
      // try the next public lookup
    }
  }

  return {
    id,
    username: "unknown",
    displayName: "Unknown Soul",
    tag: id,
    avatarUrl: defaultAvatar(id),
    bannerUrl: null,
    decorationUrl: null,
    clanTag: null,
    clanBadgeUrl: null,
    accentColor: null,
  };
}

export async function fetchAllProfiles(ids: string[]) {
  return Promise.all(ids.map((id) => fetchDiscordProfile(id)));
}
