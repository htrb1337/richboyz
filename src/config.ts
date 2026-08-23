export type MemberRole = "Leader" | "Captain" | "Slayer" | "Support" | "Member";

export type ClanMember = {
  id: string;
  role: MemberRole;
  title: string;
};

export const CLAN = {
  name: "S MOB",
  tag: "SMOB",
  established: "2025",
  invite: "https://discord.gg/nDdqYTjaZW",
  roblox: "https://www.roblox.com/communities/985129349/South-Mob#!/about",
  developer: "jah",
  musicUrl: "https://file.garden/aTzT5J7_xC8SSTd2/%E6%B2%A1%E6%87%82.mp3",
  members: [
    { id: "1485214254536855643", role: "Proprietor", title: "Crazy" },
    { id: "1399746060968005683", role: "Proprietor", title: "Beloved" },
    { id: "1459760647477919818", role: "Proprietor", title: "Captain" },
    { id: "1142156139950252152", role: "Gettin", title: "Bisaya Slayer" },
    { id: "1528026648958603344", role: "Gettin", title: "Slayer" },
    { id: "1453678917264216208", role: "Tier 1", title: "The Best" },
  ] satisfies ClanMember[],
};

export const ROLE_ORDER: MemberRole[] = [
  "Jah",
  "Captain",
  "Slayer",
  "Support",
  "Member",
  "Beloved",
  "The Best",
   "Bisaya Slayer",
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
