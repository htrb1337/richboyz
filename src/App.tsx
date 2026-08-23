import { useEffect, useRef, useState } from "react";
import Intro from "./components/Intro";
import Site from "./components/Site";
import Cursor from "./components/Cursor";
import { CLAN } from "./config";
import { fetchAllProfiles, type DiscordProfile } from "./lib/discord";

export default function App() {
  const [entered, setEntered] = useState(false);
  const [progressBoost, setProgressBoost] = useState(8);
  const [profiles, setProfiles] = useState<Record<string, DiscordProfile>>({});
  const [loadingMembers, setLoadingMembers] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    document.body.style.overflow = entered ? "" : "hidden";
  }, [entered]);

  useEffect(() => {
    const audio = new Audio(CLAN.musicUrl);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.4;
    audioRef.current = audio;

    const assets = ["/images/smob-logo.png", "/images/hero-wash.jpg"];
    let settled = 0;
    const mark = () => {
      settled += 1;
      setProgressBoost((value) => Math.max(value, Math.min(74, 16 + settled * 10)));
    };

    assets.forEach((src) => {
      const image = new Image();
      image.onload = mark;
      image.onerror = mark;
      image.src = src;
    });
    audio.addEventListener("canplaythrough", mark, { once: true });

    fetchAllProfiles(CLAN.members.map((member) => member.id))
      .then((list) => {
        const next: Record<string, DiscordProfile> = {};
        list.forEach((profile) => {
          next[profile.id] = profile;
        });
        setProfiles(next);
      })
      .finally(() => {
        setLoadingMembers(false);
        setProgressBoost((value) => Math.max(value, 90));
      });

    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  const handleProceed = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      void audio.play().catch(() => undefined);
    }
    setEntered(true);
    document.body.classList.add("entered");
  };

  return (
    <>
      <Cursor />
      {!entered && <Intro onProceed={handleProceed} progressBoost={progressBoost} />}
      {entered && (
        <Site profiles={profiles} loading={loadingMembers} audio={audioRef.current} />
      )}
    </>
  );
}
