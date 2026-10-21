import { useCallback, useEffect, useRef, useState } from "react";
import { VolumeX } from "lucide-react";
import { useLanyard, STATUS_COLORS, elapsedSince } from "./lanyard";
import { LOGO_URL } from "./logo";

/* ============================================================
   MERCY — ALL CONFIG IN ONE PLACE
   ------------------------------------------------------------
   MAIN_BG_URL / MAIN_MUSIC → kapag walang naka-hover
   FETCH_IDS               → Discord User ID ng bawat tao.
                             Ito ang ginagamit pang-FETCH ng
                             live Discord activity + status dot.
   PAANO KUNIN ANG ID:
     1. Discord Settings → Advanced → ON ang Developer Mode
     2. Right-click sa profile → "Copy User ID"
     3. Sali sa discord.gg/lanyard (para maging public presence)
     4. Palitan mo lang number dito sa baba, rebuild, tapos na.
   ------------------------------------------------------------
   Logo = naka-embed sa ./logo.ts (base64) kaya 1 HTML file lang.
============================================================ */

const MAIN_BG_URL =
  "https://images.pexels.com/photos/9694216/pexels-photo-9694216.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";

const MAIN_MUSIC = {
  url: "https://file.garden/aTzT5J7_xC8SSTd2/0826(1).MP3",
};

/* ★★★ ID FOR FETCH — DITO MO PAPALITAN LAHAT ★★★ */
const FETCH_IDS = {
  mercy: "1485214254536855643", // ← 3 featured cards
  vayne: "1488791474945658920",
  nyx: "1554143191077232832",
  m1: "80351110224678912", // ← 8 members
  m2: "516078522317307904",
  m3: "371860641867796483",
  m4: "432344474858684416",
  m5: "446347358366087207",
  m6: "233060767448789506",
  m7: "94473479288602624",
  m8: "282859044593598464",
} as const;

type Person = {
  id: string;
  display: string;
  user: string;
  avatar: string;
  bg: string;
  music: string;
  discordId: string;
};

/* 3 featured — laging visible, walang tab */
const FEATURED: Person[] = [
  {
    id: "mercy",
    display: "mercy",
    user: "mercy",
    avatar:
      "https://images.pexels.com/photos/15160990/pexels-photo-15160990.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    bg: "https://images.pexels.com/photos/9177957/pexels-photo-9177957.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    discordId: FETCH_IDS.mercy,
  },
  {
    id: "vayne",
    display: "vayne",
    user: "vayne",
    avatar:
      "https://images.pexels.com/photos/33342192/pexels-photo-33342192.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    bg: "https://images.pexels.com/photos/17916245/pexels-photo-17916245.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    discordId: FETCH_IDS.vayne,
  },
  {
    id: "nyx",
    display: "nyx.",
    user: "nyx",
    avatar:
      "https://images.pexels.com/photos/16251531/pexels-photo-16251531.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    bg: "https://images.pexels.com/photos/34940541/pexels-photo-34940541.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    discordId: FETCH_IDS.nyx,
  },
];

/* members grid */
const MEMBERS: Person[] = [
  {
    id: "m1",
    display: "ng manloloKO",
    user: "wdasfgwd",
    avatar:
      "https://images.pexels.com/photos/39769120/pexels-photo-39769120.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    bg: "https://images.pexels.com/photos/9694216/pexels-photo-9694216.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    discordId: FETCH_IDS.m1,
  },
  {
    id: "m2",
    display: "vex",
    user: "dwarkk.",
    avatar: "https://cdn.discordapp.com/embed/avatars/3.png",
    bg: "https://images.pexels.com/photos/17916245/pexels-photo-17916245.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    discordId: FETCH_IDS.m2,
  },
  {
    id: "m3",
    display: "trx",
    user: "io4unic.",
    avatar:
      "https://images.pexels.com/photos/10794970/pexels-photo-10794970.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    bg: "https://images.pexels.com/photos/10063147/pexels-photo-10063147.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    discordId: FETCH_IDS.m3,
  },
  {
    id: "m4",
    display: "ketchap",
    user: "x4ug3",
    avatar:
      "https://images.pexels.com/photos/18339019/pexels-photo-18339019.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    bg: "https://images.pexels.com/photos/10293280/pexels-photo-10293280.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    discordId: FETCH_IDS.m4,
  },
  {
    id: "m5",
    display: "fin",
    user: "0xpwn_",
    avatar:
      "https://images.pexels.com/photos/11113383/pexels-photo-11113383.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    bg: "https://images.pexels.com/photos/27390676/pexels-photo-27390676.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    discordId: FETCH_IDS.m5,
  },
  {
    id: "m6",
    display: "444 | Raiden",
    user: "3xclsv.r",
    avatar:
      "https://images.pexels.com/photos/33245150/pexels-photo-33245150.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    bg: "https://images.pexels.com/photos/39121238/pexels-photo-39121238.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    discordId: FETCH_IDS.m6,
  },
  {
    id: "m7",
    display: "zero",
    user: "_0000w",
    avatar:
      "https://images.pexels.com/photos/16251531/pexels-photo-16251531.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    bg: "https://images.pexels.com/photos/12036096/pexels-photo-12036096.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
    discordId: FETCH_IDS.m7,
  },
  {
    id: "m8",
    display: "fvckedem",
    user: "fvckedem",
    avatar:
      "https://images.pexels.com/photos/39619133/pexels-photo-39619133.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    bg: "https://images.pexels.com/photos/34940541/pexels-photo-34940541.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
    discordId: FETCH_IDS.m8,
  },
];

const ALL_PEOPLE = [...FEATURED, ...MEMBERS];

/* ---------- real discord status dot ---------- */
function StatusDot({ discordId, className = "h-3 w-3" }: { discordId: string; className?: string }) {
  const { data } = useLanyard(discordId);
  const color = STATUS_COLORS[data?.discord_status ?? "offline"] ?? "#5c5e66";
  return (
    <span
      className={`absolute rounded-full border-2 border-black ${className}`}
      style={{ background: color, bottom: 2, right: 2 }}
    />
  );
}

/* ---------- live discord activity (fetched) — compact ---------- */
function DiscordActivity({ discordId }: { discordId: string }) {
  const { data, loading } = useLanyard(discordId);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-3 w-20 rounded bg-white/10" />
        <div className="mt-2 h-3 w-32 rounded bg-white/5" />
      </div>
    );
  }

  if (!data) {
    return <p className="font-display font-extrabold text-[13px]">No Current Activity</p>;
  }

  const { activities, listening_to_spotify, spotify } = data;
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
            <p className="font-display font-bold text-[13px] leading-tight truncate">
              {spotify.song}
            </p>
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
          } catch {}
          if (!muted) await fadeTo(0.5, 400);
        }
        return;
      }
      try {
        await fadeTo(0, 250);
      } catch {}
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
    const found = ALL_PEOPLE.find((p) => p.id === hoveredId);
    playUrl(found ? found.music : MAIN_MUSIC.url);
  }, [hoveredId, entered, playUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = muted ? 0 : 0.5;
  }, [muted]);

  const handleEnter = async () => {
    setEntered(true);
    const audio = new Audio(MAIN_MUSIC.url);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0;
    audioRef.current = audio;
    currentUrlRef.current = MAIN_MUSIC.url;
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
          <img src={MAIN_BG_URL} alt="" className="h-full w-full object-cover opacity-20 saturate-0" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/85 to-black" />
        </div>

        {ALL_PEOPLE.map((p) => (
          <div
            key={p.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              hoveredId === p.id ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <img
              src={p.bg}
              alt=""
              loading="eager"
              className={`h-full w-full object-cover ${hoveredId === p.id ? "animate-bg-zoom" : ""}`}
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
              src={LOGO_URL}
              alt="mercy"
              className="h-16 md:h-[72px] w-auto object-contain logo-glow animate-floaty"
              draggable={false}
            />
            <p className="mt-3 font-mono2 text-[10px] tracking-[0.35em] text-white/30 lowercase">
              no mercy for the wicked.
            </p>
          </div>

          {/* 3 cards — lahat same height tulad sa reference */}
          <div className="mt-6 flex flex-col md:flex-row items-center gap-3">
            {FEATURED.map((f, i) => {
              const isActive = hoveredId === f.id;
              return (
                <div
                  key={f.id}
                  onMouseEnter={() => hover(f.id)}
                  onMouseLeave={() => hover(null)}
                  onClick={() => hover(isActive ? null : f.id)}
                  className={`relative overflow-hidden rounded-[20px] border cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] animate-fade-up ${
                    i === 0 ? "delay-1" : i === 1 ? "delay-2" : "delay-3"
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
                    <img src={f.bg} alt="" className="h-full w-full object-cover opacity-50" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80" />
                  </div>

                  <div
                    className={`absolute inset-0 flex md:flex-col flex-row items-center justify-center gap-3 p-3 transition-all duration-400 ${
                      isActive ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={f.avatar}
                        alt={f.display}
                        className="h-12 w-12 md:h-[68px] md:w-[68px] rounded-full object-cover border-2 border-black/80"
                      />
                      <StatusDot discordId={f.discordId} />
                    </div>
                    <p className="font-display font-extrabold text-sm md:text-[15px] tracking-tight">
                      {f.display}
                    </p>
                  </div>

                  {/* expanded — compact tulad sa reference */}
                  <div
                    className={`absolute inset-0 flex flex-col bg-[#0b0b10] transition-all duration-400 ${
                      isActive
                        ? "opacity-100 translate-y-0 delay-100"
                        : "opacity-0 translate-y-4 pointer-events-none"
                    }`}
                  >
                    <div className="relative h-[118px] shrink-0 overflow-hidden">
                      <img src={f.bg} alt="" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-[#0b0b10]" />
                    </div>
                    <div className="relative flex justify-center -mt-9 shrink-0">
                      <div className="relative">
                        <img
                          src={f.avatar}
                          alt={f.display}
                          className="h-[72px] w-[72px] rounded-full object-cover border-[3px] border-[#0b0b10]"
                        />
                        <StatusDot discordId={f.discordId} className="h-3.5 w-3.5" />
                      </div>
                    </div>
                    <div className="flex flex-col items-center mt-1.5 px-5 shrink-0">
                      <h3 className="font-display font-extrabold text-lg leading-none">
                        {f.display}
                      </h3>
                      <p className="mt-1 font-mono2 italic text-[11px] text-white/40">@{f.user}</p>
                    </div>
                    <div className="mt-3 border-t border-white/10 shrink-0" />
                    <div className="px-4 py-3 flex-1 min-h-0 overflow-hidden">
                      <DiscordActivity discordId={f.discordId} />
                    </div>
                  </div>
                </div>
              );
            })}
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
            {MEMBERS.map((m, i) => {
              const isActive = hoveredId === m.id;
              return (
                <div
                  key={m.id}
                  onMouseEnter={() => hover(m.id)}
                  onMouseLeave={() => hover(null)}
                  onClick={() => hover(isActive ? null : m.id)}
                  className={`relative h-[150px] rounded-2xl overflow-hidden border cursor-pointer transition-colors duration-500 animate-fade-up bg-black ${
                    i % 4 === 0 ? "delay-1" : i % 4 === 1 ? "delay-2" : i % 4 === 2 ? "delay-3" : "delay-4"
                  } ${isActive ? "border-white/25" : "border-white/10 hover:border-white/20"}`}
                >
                  {/* background laging kita — walang grey */}
                  <img
                    src={m.bg}
                    alt=""
                    className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${
                      isActive ? "opacity-80 scale-100" : "opacity-40 scale-105"
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />

                  {/* avatar — gitna, gagalaw pa-left kapag hover */}
                  <div
                    className={`absolute top-1/2 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isActive
                        ? "left-5 -translate-y-1/2 translate-x-0"
                        : "left-1/2 -translate-y-1/2 -translate-x-1/2"
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={m.avatar}
                        alt={m.display}
                        className="h-[84px] w-[84px] rounded-full object-cover border-2 border-black/70"
                      />
                      <StatusDot discordId={m.discordId} className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  {/* name — lalabas kapag hover */}
                  <div
                    className={`absolute left-[118px] right-5 top-1/2 -translate-y-1/2 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isActive
                        ? "opacity-100 translate-x-0 delay-150"
                        : "opacity-0 translate-x-8 pointer-events-none"
                    }`}
                  >
                    <p className="font-display font-extrabold text-lg leading-tight truncate">
                      {m.display}
                    </p>
                    <p className="mt-0.5 font-mono2 text-xs text-white/50">@{m.user}</p>
                  </div>
                </div>
              );
            })}
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
            src={LOGO_URL}
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
