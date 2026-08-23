export type MemberRole = "Leader" | "Captain" | "Slayer" | "Support" | "Member";

export type ClanMember = {
  id: string;
  role: MemberRole;
  title: string;
};

export const CLAN = {
  name: "S MOB",
  tag: "SMOB",
  established: "2024",
  invite: "https://discord.gg/nDdqYTjaZW",
  roblox: "https://www.roblox.com/communities/985129349/South-Mob#!/about",
  developer: "jah",
  musicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
  members: [
    { id: "773952016036790272", role: "Leader", title: "Leader" },
    { id: "804955810820128798", role: "Captain", title: "Captain" },
    { id: "209796601357533184", role: "Captain", title: "Captain" },
    { id: "604779545018761237", role: "Slayer", title: "Slayer" },
    { id: "159985870458322944", role: "Slayer", title: "Slayer" },
    { id: "270904126974590976", role: "Support", title: "Support" },
  ] satisfies ClanMember[],
};

export const ROLE_ORDER: MemberRole[] = [
  "Leader",
  "Captain",
  "Slayer",
  "Support",
  "Member",
];

export const VALUES = [
  {
    title: "Safe place",
    text: "Be kind. No toxicity. You can talk, learn, and play without stress.",
  },
  {
    title: "You're welcome",
    text: "New or not, you can sit with us. Come as you are.",
  },
  {
    title: "Play with us",
    text: "We queue PVP, have fun, and run it back. Jump in anytime.",
  },
];
