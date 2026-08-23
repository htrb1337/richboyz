import { useEffect, useState } from "react";
import Members from "./Members";
import AudioDock from "./AudioDock";
import Logo from "./Logo";
import type { DiscordProfile } from "../lib/discord";
import { CLAN, VALUES } from "../config";

type SiteProps = {
  profiles: Record<string, DiscordProfile>;
  loading: boolean;
  audio: HTMLAudioElement | null;
};

const NAV = [
  { href: "#home", label: "HOME" },
  { href: "#members", label: "CREW" },
  { href: "#about", label: "ABOUT" },
  { href: "#join", label: "PLAY WITH US" },
];

const MARQUEE = ["S MOB", "YOU'RE WELCOME", "PLAY WITH US", "PVP", "DISCORD", "ROBLOX"];

export default function Site({ profiles, loading, audio }: SiteProps) {
  const [muted, setMuted] = useState(false);
  const [active, setActive] = useState("#home");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setVisible(true), 40);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      let current = "#home";
      for (const item of NAV) {
        const el = document.getElementById(item.href.slice(1));
        if (el && el.getBoundingClientRect().top < 160) current = item.href;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleMute = () => {
    if (!audio) return;
    audio.muted = !audio.muted;
    setMuted(audio.muted);
  };

  return (
    <div
      className={`relative min-h-screen bg-[#fbf8ff] transition-opacity duration-1000 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="pointer-events-none fixed inset-0 opacity-45"
        style={{
          backgroundImage: "url(/images/hero-wash.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <header className="fixed top-0 right-0 left-0 z-40 border-b border-violet-100/80 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <a href="#home" className="flex items-center gap-2.5">
            <Logo className="h-10 w-[92px]" />
            <span className="font-display text-sm font-semibold tracking-[0.28em] text-violet-700">
              {CLAN.tag}
            </span>
          </a>
          <nav className="hidden items-center gap-7 md:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`nav-link ${active === item.href ? "active" : ""}`}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <a
            href={CLAN.invite}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2 text-[10px] tracking-[0.28em] text-white shadow-[0_10px_24px_rgba(139,44,255,0.28)]"
          >
JOIN DISCORD
          </a>
        </div>
      </header>

      <section
        id="home"
        className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-24"
      >
        <p className="fade-up mb-6 text-[11px] tracking-[0.58em] text-violet-500">
          S MOB · YOU'RE WELCOME
        </p>
        <Logo className="scale-in w-[min(92vw,560px)]" />
        <p className="font-serif fade-up mt-8 max-w-xl text-center text-2xl text-[#5b4a68] italic md:text-3xl">
          You're welcome here. Come play with us.
        </p>
        <div className="fade-up mt-10 flex flex-wrap items-center justify-center gap-3">
          <SocialLink href={CLAN.roblox} label="JOIN ROBLOX" icon="roblox" />
          <SocialLink href={CLAN.invite} label="JOIN DISCORD" icon="discord" />
        </div>
      </section>

      <div className="relative overflow-hidden border-y border-violet-100 bg-white/70 py-4">
        <div className="marquee text-[13px] tracking-[0.42em] text-violet-600/80">
          {[...MARQUEE, ...MARQUEE, ...MARQUEE, ...MARQUEE].map((word, i) => (
            <span key={`${word}-${i}`} className="flex items-center gap-10">
              {word}
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            </span>
          ))}
        </div>
      </div>

      <Members profiles={profiles} loading={loading} />

      <section id="about" className="relative px-6 py-24 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="text-[11px] tracking-[0.5em] text-violet-500">ABOUT</p>
            <h2 className="font-display mt-3 text-5xl font-semibold text-[#16081f]">
              You're welcome
            </h2>
            <p className="font-serif mx-auto mt-5 max-w-2xl text-xl text-[#6b5b78] italic">
              A PVP clan and a friendly place. Come hang out and play with us.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {VALUES.map((value, i) => (
              <article
                key={value.title}
                className="member-card fade-up p-8"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <p className="text-[10px] tracking-[0.34em] text-violet-500">
                  0{i + 1}
                </p>
                <h3 className="font-display mt-3 text-2xl font-semibold text-[#16081f]">
                  {value.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#5b4a68]">{value.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="join" className="relative px-6 py-28 text-center">
        <div className="mx-auto max-w-3xl rounded-[36px] border border-violet-100 bg-white/75 px-8 py-16 shadow-[0_30px_80px_rgba(109,40,217,0.1)] backdrop-blur-xl">
          <Logo className="mx-auto mb-6 h-20 w-44" />
          <p className="text-[11px] tracking-[0.5em] text-violet-500">PLAY WITH US</p>
          <h2 className="font-display mt-3 text-5xl font-semibold text-[#16081f]">
            Play with us
          </h2>
          <p className="font-serif mx-auto mt-5 max-w-lg text-xl text-[#6b5b78] italic">
            Join the Roblox group or Discord. We'd love to play with you.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <SocialLink href={CLAN.roblox} label="JOIN ROBLOX" icon="roblox" />
            <SocialLink href={CLAN.invite} label="JOIN DISCORD" icon="discord" />
          </div>
        </div>
      </section>

      <footer className="border-t border-violet-100 px-6 py-10 text-center">
        <Logo className="mx-auto mb-4 h-16 w-48" />
        <p className="text-[11px] tracking-[0.32em] text-violet-400">
          {CLAN.name} · play with us
        </p>
        <p className="mt-3 text-[11px] tracking-[0.28em] text-violet-300">
          developed by {CLAN.developer}
        </p>
      </footer>

      <AudioDock muted={muted} onToggle={toggleMute} />
    </div>
  );
}

function SocialLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: "roblox" | "discord";
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2.5 rounded-full border border-violet-200 bg-white/80 px-5 py-3 text-[11px] tracking-[0.28em] text-violet-700 shadow-[0_10px_28px_rgba(109,40,217,0.08)] transition-all hover:-translate-y-0.5 hover:border-violet-400 hover:bg-violet-600 hover:text-white"
    >
      {icon === "discord" ? <DiscordIcon /> : <RobloxIcon />}
      {label}
    </a>
  );
}

function DiscordIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20 5.7A17.6 17.6 0 0 0 15.6 4l-.4.8a16 16 0 0 1 4 1.7 14.8 14.8 0 0 0-14.4 0A16 16 0 0 1 8.8 4.8L8.4 4A17.6 17.6 0 0 0 4 5.7C1.8 9.1 1.2 12.4 1.4 15.7A17.7 17.7 0 0 0 7 18.4l.8-1.3a11.4 11.4 0 0 1-1.8-.9l.4-.3a12.6 12.6 0 0 0 10.8 0l.4.3a11.4 11.4 0 0 1-1.8.9l.8 1.3a17.7 17.7 0 0 0 5.6-2.7c.4-4 .1-7.3-1.2-10.7ZM8.8 13.8c-.8 0-1.5-.8-1.5-1.7s.7-1.8 1.5-1.8 1.6.8 1.5 1.8-.7 1.7-1.5 1.7Zm6.4 0c-.8 0-1.5-.8-1.5-1.7s.7-1.8 1.5-1.8 1.6.8 1.5 1.8-.6 1.7-1.5 1.7Z" />
    </svg>
  );
}

function RobloxIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.6 2 22 18.6 5.4 22 2 5.4 18.6 2Zm-7.2 7.4-4.8 1 1 4.8 4.8-1-1-4.8Z" />
    </svg>
  );
}
