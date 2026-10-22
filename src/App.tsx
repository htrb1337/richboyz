import { useCallback, useEffect, useRef, useState } from "react";
import { VolumeX } from "lucide-react";
import {
  useDiscord,
  STATUS_COLORS,
  elapsedSince,
  defaultAvatar,
  type Presence,
} from "./discord";
import { CONFIG, getUserMedia } from "./config";

/* ============================================================
   MERCY — ID + BG + MUSIC lang ang config (nasa 1 HTML file).
   Pangalan, avatar, decoration, status, activity = auto-fetch.
============================================================ */

type Person = {
  key: string;
  discordId: string;
  bg: string;
  music: string;
};

function buildPeople(ids: string[], prefix: string): Person[] {
  return ids.map((discordId) => {
    const m = getUserMedia(discordId);
    return { key: `${prefix}-${discordId}`, discordId, bg: m.bg, music: m.music };
  });
}

const FEATURED: Person[] = buildPeople(CONFIG.featured, "f");
const MEMBERS: Person[] = buildPeople(CONFIG.members, "m");
const ALL_PEOPLE = [...FEATURED, ...MEMBERS];

/* ---------- status dot ---------- */
function StatusDot({
  status,
  className = "h-3 w-3",
}: {
  status?: string | null;
  className?: string;
}) {
  const color = STATUS_COLORS[status ?? "offline"] ?? "#5c5e66";
  return (
    <span
      className={`absolute rounded-full border-2 border-black ${className}`}
      style={{ background: color, bottom: 1, right: 1 }}
    />
  );
}

/* ---------- avatar + decoration + dot ---------- */
function AvatarWithDeco({
  src,
  decoration,
  alt,
  imgClass,
  status,
  dotClass = "h-3 w-3",
}: {
  src: string;
  decoration: string | null;
  alt: string;
  imgClass: string;
  status?: string | null;
  dotClass?: string;
}) {
  return (
    <div className="relative shrink-0">
      <img src={src} alt={alt} draggable={false} className={imgClass} />
      {decoration && (
        <img
          src={decoration}
          alt=""
          draggable={false}
          className="absolute pointer-events-none"
          style={{ left: "-12%", top: "-12%", width: "124%", height: "124%", maxWidth: "none" }}
        />
      )}
      <StatusDot status={status} className={dotClass} />
    </div>
  );
}

/* ---------- live activity (Playing / Streaming / Spotify) ---------- */
function DiscordActivity({
  presence,
  loading,
}: {
  presence: Presence | null;
  loading: boolean;
}) {
  if (loading && !presence) {
    return (
      <div className="animate-pulse">
        <div className="h-3 w-20 rounded bg-white/10" />
        <div className="mt-2 h-3 w-32 rounded bg-white/5" />
      </div>
    );
  }

  if (!presence) {
    return <p className="font-display font-extrabold text-[13px]">No Current Activity</p>;
  }

  const { activities, listening_to_spotify, spotify } = presence;
  const game = activities.find((a) => a.type === 0);
  const stream = activities.find((a) => a.type === 1);
  const other = activities.find((a) => a.type === 2 || a.type === 3 || a.type === 5);

  if (listening_to_spotify && spotify) {
    return (
      <div>
        <p className="font-mono2 text-[9px] tracking-[0.2em] uppercase text-white/35">
          Listening to Spotify
        </p>
        <div className="mt-2 flex items-center gap-2.5">
          {spotify.album_art_url && (
            <img
              src={spotify.album_art_url}
              alt=""
              className="h-10 w-10 rounded-md object-cover shrink-0"
            />
          )}
          <div className="min-w-0">
            <p className="font-display font-bold text-[13px] leading-tight truncate">{spotify.song}</p>
            <p className="font-mono2 text-[10px] text-white/50 truncate">by {spotify.artist}</p>
            <p className="font-mono2 text-[10px] text-white/35 truncate">on {spotify.album}</p>
          </div>
        </div>
      </div>
    );
  }

  if (stream) {
    return (
      <div>
        <p className="font-mono2 text-[9px] tracking-[0.2em] uppercase text-white/35">
          Live on {stream.name}
        </p>
        <p className="mt-1 font-display font-bold text-[13px] leading-snug line-clamp-2">
          {stream.details ?? stream.state ?? stream.name}
        </p>
        {stream.state && stream.details && (
          <p className="mt-0.5 font-mono2 text-[10px] text-white/45 truncate">{stream.state}</p>
        )}
      </div>
    );
  }

  if (game) {
    const el = elapsedSince(game.timestamps?.start);
    return (
      <div>
        <p className="font-mono2 text-[9px] tracking-[0.2em] uppercase text-white/35">
          Playing{el ? ` — ${el}` : ""}
        </p>
        <p className="mt-1 font-display font-bold text-[13px] leading-tight truncate">{game.name}</p>
        {game.details && (
          <p className="mt-0.5 font-mono2 text-[10px] text-white/55 line-clamp-1">{game.details}</p>
        )}
        {game.state && (
          <p className="mt-0.5 font-mono2 text-[10px] text-white/40 line-clamp-1">{game.state}</p>
        )}
      </div>
    );
  }

  if (other) {
    return (
      <div>
        <p className="font-mono2 text-[9px] tracking-[0.2em] uppercase text-white/35">
          {other.name}
        </p>
        {other.details && (
          <p className="mt-1 font-display font-bold text-[13px] leading-tight line-clamp-1">
            {other.details}
          </p>
        )}
        {other.state && (
          <p className="mt-0.5 font-mono2 text-[10px] text-white/45 line-clamp-1">{other.state}</p>
        )}
        {!other.details && !other.state && (
          <p className="mt-1 font-display font-bold text-[13px]">{other.name}</p>
        )}
      </div>
    );
  }

  return <p className="font-display font-extrabold text-[13px]">No Current Activity</p>;
}

/* ---------- featured card ---------- */
function FeaturedCard({
  person,
  index,
  isActive,
  onEnter,
  onLeave,
  onClick,
}: {
  person: Person;
  index: number;
  isActive: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  const { profile, profileLoading, notFound, presence } = useDiscord(person.discordId);
  const display = notFound ? "Unknown User" : profile?.display ?? "···";
  const user = notFound ? "invalid-id" : profile?.username ?? "···";
  const avatar = profile?.avatar ?? defaultAvatar(person.discordId);
  const deco = profile?.decoration ?? null;
  const status = presence?.status ?? "offline";
  const delays = ["delay-1", "delay-2", "delay-3", "delay-4"];

  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
      className={`relative overflow-hidden rounded-[20px] border cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] animate-fade-up ${
        delays[index % delays.length]
      } ${
        isActive
          ? "w-[320px] md:w-[340px] h-[430px] border-white/25"
          : "w-[320px] md:w-[108px] h-[92px] md:h-[430px] border-white/10 hover:border-white/25"
      }`}
    >
      {/* collapsed */}
      <div
        className={`absolute inset-0 transition-opacity duration-400 ${
          isActive ? "opacity-0" : "opacity-100"
        }`}
      >
        <img src={person.bg} alt="" className="h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80" />
      </div>

      <div
        className={`absolute inset-0 flex md:flex-col flex-row items-center justify-center gap-3 p-3 transition-all duration-400 ${
          isActive ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
        }`}
      >
        <AvatarWithDeco
          src={avatar}
          decoration={deco}
          alt={display}
          imgClass="h-12 w-12 md:h-[68px] md:w-[68px] rounded-full object-cover border-2 border-black/80"
          status={status}
        />
        <p
          className={`font-display font-extrabold text-sm md:text-[15px] tracking-tight max-w-[90px] md:max-w-full truncate ${
            profileLoading ? "animate-pulse text-white/40" : ""
          }`}
        >
          {display}
        </p>
      </div>

      {/* expanded */}
      <div
        className={`absolute inset-0 flex flex-col bg-[#0b0b10] transition-all duration-400 ${
          isActive
            ? "opacity-100 translate-y-0 delay-100"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="relative h-[118px] shrink-0 overflow-hidden">
          <img src={person.bg} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-[#0b0b10]" />
        </div>
        <div className="relative flex justify-center -mt-9 shrink-0">
          <AvatarWithDeco
            src={avatar}
            decoration={deco}
            alt={display}
            imgClass="h-[72px] w-[72px] rounded-full object-cover border-[3px] border-[#0b0b10]"
            status={status}
            dotClass="h-3.5 w-3.5"
          />
        </div>
        <div className="flex flex-col items-center mt-1.5 px-5 shrink-0">
          <h3
            className={`font-display font-extrabold text-lg leading-none truncate max-w-full ${
              profileLoading ? "animate-pulse text-white/40" : ""
            }`}
          >
            {display}
          </h3>
          <p className="mt-1 font-mono2 italic text-[11px] text-white/40 truncate">@{user}</p>
        </div>
        <div className="mt-3 border-t border-white/10 shrink-0" />
        <div className="px-4 py-3 flex-1 min-h-0 overflow-hidden">
          <DiscordActivity presence={presence} loading={profileLoading} />
        </div>
      </div>
    </div>
  );
}

/* ---------- member card ---------- */
function MemberCard({
  person,
  index,
  isActive,
  onEnter,
  onLeave,
  onClick,
}: {
  person: Person;
  index: number;
  isActive: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  const { profile, profileLoading, notFound, presence } = useDiscord(person.discordId);
  const display = notFound ? "Unknown User" : profile?.display ?? "···";
  const user = notFound ? "invalid-id" : profile?.username ?? "···";
  const avatar = profile?.avatar ?? defaultAvatar(person.discordId);
  const deco = profile?.decoration ?? null;
  const status = presence?.status ?? "offline";
  const delays = ["delay-1", "delay-2", "delay-3", "delay-4"];

  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
      className={`relative h-[150px] rounded-2xl overflow-hidden border cursor-pointer transition-colors duration-500 animate-fade-up bg-black ${
        delays[index % delays.length]
      } ${isActive ? "border-white/25" : "border-white/10 hover:border-white/20"}`}
    >
      <img
        src={person.bg}
        alt=""
        className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${
          isActive ? "opacity-80 scale-100" : "opacity-40 scale-105"
        }`}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />

      <div
        className={`absolute top-1/2 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isActive ? "left-5 -translate-y-1/2 translate-x-0" : "left-1/2 -translate-y-1/2 -translate-x-1/2"
        }`}
      >
        <AvatarWithDeco
          src={avatar}
          decoration={deco}
          alt={display}
          imgClass="h-[84px] w-[84px] rounded-full object-cover border-2 border-black/70"
          status={status}
          dotClass="h-3.5 w-3.5"
        />
      </div>

      <div
        className={`absolute left-[118px] right-5 top-1/2 -translate-y-1/2 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isActive
            ? "opacity-100 translate-x-0 delay-150"
            : "opacity-0 translate-x-8 pointer-events-none"
        }`}
      >
        <p
          className={`font-display font-extrabold text-lg leading-tight truncate ${
            profileLoading ? "animate-pulse text-white/40" : ""
          }`}
        >
          {display}
        </p>
        <p className="mt-0.5 font-mono2 text-xs text-white/50 truncate">@{user}</p>
      </div>
    </div>
  );
}

export default function App() {
  const [entered, setEntered] = useState(false);
  const [view, setView] = useState<"home" | "members">("home");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentUrlRef = useRef<string>("");
  const fadeTimer = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  /* favicon galing sa config logo */
  useEffect(() => {
    try {
      let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.type = CONFIG.logo.startsWith("data:image/svg") ? "image/svg+xml" : "image/png";
      link.href = CONFIG.logo;
    } catch {
      /* ignore */
    }
  }, []);

  /* ---------- starfield ---------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    let raf = 0;
    const stars = Array.from({ length: 130 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.3 + 0.3,
      p: Math.random() * Math.PI * 2,
      sp: Math.random() * 0.02 + 0.005,
    }));
    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const st of stars) {
        st.p += st.sp;
        const tw = 0.3 + Math.abs(Math.sin(st.p)) * 0.6;
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${tw})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  /* ---------- audio with crossfade ---------- */
  const fadeTo = useCallback((targetVolume: number, duration = 350) => {
    const audio = audioRef.current;
    if (!audio) return Promise.resolve();
    if (fadeTimer.current) window.clearInterval(fadeTimer.current);
    return new Promise<void>((resolve) => {
      const start = audio.volume;
      const diff = targetVolume - start;
      const steps = 14;
      let i = 0;
      fadeTimer.current = window.setInterval(() => {
        i++;
        audio.volume = Math.max(0, Math.min(1, start + diff * (i / steps)));
        if (i >= steps) {
          if (fadeTimer.current) window.clearInterval(fadeTimer.current);
          resolve();
        }
      }, duration / steps);
    });
  }, []);

  const playUrl = useCallback(
    async (url: string) => {
      let audio = audioRef.current;
      if (!audio) {
        audio = new Audio(url);
        audio.loop = true;
        audio.preload = "auto";
        audio.volume = 0;
        audioRef.current = audio;
      }
      if (currentUrlRef.current === url) {
        if (audio.paused) {
          try {
            await audio.play();
            setIsPlaying(true);
          } catch {
            /* ignore */
          }
          if (!muted) await fadeTo(0.5, 400);
        }
        return;
      }
      try {
        await fadeTo(0, 250);
      } catch {
        /* ignore */
      }
      currentUrlRef.current = url;
      audio.src = url;
      audio.loop = true;
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
      if (!muted) await fadeTo(0.5, 500);
      else audio.volume = 0;
    },
    [fadeTo, muted]
  );

  useEffect(() => {
    if (!entered) return;
    const found = ALL_PEOPLE.find((p) => p.key === hoveredId);
    playUrl(found ? found.music : CONFIG.mainMusic);
  }, [hoveredId, entered, playUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = muted ? 0 : 0.5;
  }, [muted]);

  const handleEnter = async () => {
    setEntered(true);
    const audio = new Audio(CONFIG.mainMusic);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0;
    audioRef.current = audio;
    currentUrlRef.current = CONFIG.mainMusic;
    try {
      await audio.play();
      setIsPlaying(true);
      await fadeTo(0.5, 900);
    } catch {
      setIsPlaying(false);
    }
  };

  const hover = (id: string | null) => setHoveredId(id);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden noise">
      {/* ================= BACKGROUNDS ================= */}
      <div className="fixed inset-0 z-0 bg-black overflow-hidden">
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${
            hoveredId ? "opacity-0" : "opacity-100"
          }`}
        >
          <img
            src={CONFIG.mainBg}
            alt=""
            className="h-full w-full object-cover opacity-20 saturate-0"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/85 to-black" />
        </div>

        {ALL_PEOPLE.map((p) => (
          <div
            key={p.key}
            className={`absolute inset-0 transition-opacity duration-700 ${
              hoveredId === p.key ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <img
              src={p.bg}
              alt=""
              loading="eager"
              className={`h-full w-full object-cover ${hoveredId === p.key ? "animate-bg-zoom" : ""}`}
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/85" />
          </div>
        ))}

        <canvas
          ref={canvasRef}
          className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${
            hoveredId ? "opacity-0" : "opacity-100"
          }`}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.7)_100%)]" />
      </div>

      {/* ================= NAV — MEMBERS lang ================= */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-end px-6 md:px-10 py-5">
        <button
          onClick={() => {
            setView((v) => (v === "members" ? "home" : "members"));
            setHoveredId(null);
          }}
          className={`relative font-mono2 text-[11px] font-bold tracking-[0.25em] transition ${
            view === "members" ? "text-white" : "text-white/45 hover:text-white"
          }`}
        >
          MEMBERS
          <span
            className={`absolute -bottom-1 left-0 h-px bg-white transition-all duration-300 ${
              view === "members" ? "w-full" : "w-0"
            }`}
          />
        </button>
      </header>

      {/* ================= HOME ================= */}
      {view === "home" && (
        <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pt-16 pb-16">
          <div className="flex flex-col items-center animate-fade-up">
            <img
              src={CONFIG.logo}
              alt="mercy"
              className="h-16 md:h-[72px] w-auto object-contain logo-glow animate-floaty"
              draggable={false}
            />
            <p className="mt-3 font-mono2 text-[10px] tracking-[0.35em] text-white/30 lowercase">
              {CONFIG.tagline}
            </p>
          </div>

          <div className="mt-6 flex flex-col md:flex-row items-center gap-3">
            {FEATURED.map((f, i) => (
              <FeaturedCard
                key={f.key}
                person={f}
                index={i}
                isActive={hoveredId === f.key}
                onEnter={() => hover(f.key)}
                onLeave={() => hover(null)}
                onClick={() => hover(hoveredId === f.key ? null : f.key)}
              />
            ))}
          </div>
        </main>
      )}

      {/* ================= MEMBERS ================= */}
      {view === "members" && (
        <main className="relative z-10 min-h-screen max-w-5xl mx-auto px-4 md:px-8 pt-24 pb-28">
          <h2 className="text-center font-mono2 text-xs tracking-[0.5em] text-white/70 pl-2 animate-fade-up">
            ¶ MEMBERS ¶
          </h2>

          <div className="mt-8 grid md:grid-cols-2 gap-4">
            {MEMBERS.map((m, i) => (
              <MemberCard
                key={m.key}
                person={m}
                index={i}
                isActive={hoveredId === m.key}
                onEnter={() => hover(m.key)}
                onLeave={() => hover(null)}
                onClick={() => hover(hoveredId === m.key ? null : m.key)}
              />
            ))}
          </div>
        </main>
      )}

      {/* ================= mute lang — maliit ================= */}
      <button
        onClick={() => setMuted((m) => !m)}
        className="fixed bottom-5 right-5 z-50 h-11 w-11 rounded-xl border border-white/10 bg-black/60 backdrop-blur-xl flex items-center justify-center hover:border-white/30 transition text-white"
        title={muted ? "unmute" : "mute"}
      >
        {muted || !isPlaying ? (
          <VolumeX size={16} />
        ) : (
          <span className="flex items-end gap-[3px] h-4">
            <span className="eq-bar eq-1" />
            <span className="eq-bar eq-2" />
            <span className="eq-bar eq-3" />
          </span>
        )}
      </button>

      {/* ================= ENTER ================= */}
      {!entered && (
        <div
          onClick={handleEnter}
          className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center cursor-pointer px-6 text-center"
        >
          <img
            src={CONFIG.logo}
            alt="mercy"
            className="h-24 md:h-28 w-auto object-contain logo-glow"
            draggable={false}
          />
          <p className="mt-6 font-mono2 text-[11px] tracking-[0.3em] text-white/40 uppercase">
            click to enter
          </p>
        </div>
      )}
    </div>
  );
}
