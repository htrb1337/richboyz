import { useMemo } from "react";
import { CLAN, ROLE_ORDER, type ClanMember } from "../config";
import type { DiscordProfile } from "../lib/discord";

type MembersProps = {
  profiles: Record<string, DiscordProfile>;
  loading: boolean;
};

function Avatar({ profile }: { profile: DiscordProfile }) {
  return (
    <div className="avatar-wrap">
      <img
        src={profile.avatarUrl}
        alt={profile.displayName}
        className="avatar-img"
      />
      {profile.decorationUrl && (
        <img
          src={profile.decorationUrl}
          alt=""
          className="avatar-deco"
          draggable={false}
        />
      )}
    </div>
  );
}

function MemberCard({
  member,
  profile,
  index,
}: {
  member: ClanMember;
  profile?: DiscordProfile;
  index: number;
}) {
  const data =
    profile ??
    ({
      id: member.id,
      username: "loading",
      displayName: "Linking…",
      tag: member.id,
      avatarUrl: "/images/smob-logo.png",
      bannerUrl: null,
      decorationUrl: null,
      clanTag: null,
      clanBadgeUrl: null,
      accentColor: null,
    } satisfies DiscordProfile);

  return (
    <article className="member-card fade-up p-7" style={{ animationDelay: `${index * 80}ms` }}>
      {data.bannerUrl && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 overflow-hidden rounded-t-[28px] opacity-40">
          <img src={data.bannerUrl} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
        </div>
      )}

      <Avatar profile={data} />

      <div className="relative mt-1 text-center">
        <p className="text-[10px] tracking-[0.34em] text-violet-500 uppercase">{member.role}</p>
        <h3 className="font-display mt-2 text-[26px] leading-none font-semibold text-[#16081f]">
          {data.displayName}
        </h3>
        <p className="mt-2 text-[13px] text-violet-700/70">{data.tag}</p>
        <p className="font-serif mt-1 text-lg text-[#6b5b78] italic">{member.title}</p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-[10px] tracking-[0.22em] text-violet-700">
            {data.clanBadgeUrl && <img src={data.clanBadgeUrl} alt="" className="h-3.5 w-3.5" />}
            {data.clanTag || CLAN.tag}
          </span>
        </div>

        <p className="mt-5 text-[10px] tracking-[0.16em] text-[#b3a3c0]">ID {member.id}</p>
      </div>
    </article>
  );
}

export default function Members({ profiles, loading }: MembersProps) {
  const ordered = useMemo(
    () =>
      [...CLAN.members].sort(
        (a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role),
      ),
    [],
  );

  return (
    <section id="members" className="relative px-6 py-28 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="text-[11px] tracking-[0.5em] text-violet-500">THE CREW</p>
          <h2 className="font-display mt-3 text-5xl font-semibold text-[#16081f] md:text-6xl">
            Members
          </h2>
          <p className="font-serif mx-auto mt-5 max-w-xl text-xl text-[#6b5b78] italic">
            Meet the people you'll play with.
          </p>
          {loading && (
            <p className="mt-4 text-[11px] tracking-[0.3em] text-violet-400">loading profiles…</p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ordered.map((member, index) => (
            <MemberCard
              key={member.id}
              member={member}
              profile={profiles[member.id]}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
