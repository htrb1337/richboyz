import { useEffect, useRef, useState } from "react";

export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const [hot, setHot] = useState(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (ring.current) {
        ring.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      const target = e.target as HTMLElement | null;
      setHot(Boolean(target?.closest("a, button, [data-cursor='hot']")));
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return <div ref={ring} className={`cursor-ring hidden md:block ${hot ? "hot" : ""}`} />;
}
