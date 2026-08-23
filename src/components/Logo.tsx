import { useEffect, useState } from "react";
import { prepareLogo } from "../lib/logo";

type LogoProps = {
  src?: string;
  alt?: string;
  className?: string;
};

export default function Logo({
  src = "/images/smob-logo.png",
  alt = "S MOB",
  className = "w-[min(92vw,520px)]",
}: LogoProps) {
  const [clean, setClean] = useState(src);

  useEffect(() => {
    let live = true;
    void prepareLogo(src).then((url) => {
      if (live) setClean(url);
    });
    return () => {
      live = false;
    };
  }, [src]);

  return (
    <div className={`logo-shine ${className}`}>
      <img src={clean} alt={alt} className="logo-img" draggable={false} />
      <img src={clean} alt="" className="logo-gloss" draggable={false} aria-hidden />
    </div>
  );
}
