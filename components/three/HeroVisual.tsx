"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { introStore } from "@/components/animations/introStore";
import styles from "./HeroVisual.module.css";

// The Three.js bundle only loads when the browser can actually use it.
const loadScene = () => import("./HeroScene");
const HeroScene = dynamic(loadScene, { ssr: false, loading: () => null });

type Mode = "pending" | "webgl" | "fallback";

let cachedMode: Mode | null = null;

function detectMode(): Mode {
  if (cachedMode) return cachedMode;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = window.matchMedia("(max-width: 640px)").matches;
  let webgl = false;
  try {
    const canvas = document.createElement("canvas");
    webgl = Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    webgl = false;
  }
  cachedMode = webgl && !reduce && !small ? "webgl" : "fallback";
  return cachedMode;
}

const noopSubscribe = () => () => {};

/** Interactive 3D scene with a lightweight CSS fallback (no WebGL, small screens, reduced motion). */
export default function HeroVisual({ labels }: { labels: string[] }) {
  const mode = useSyncExternalStore<Mode>(noopSubscribe, detectMode, () => "pending");
  // While the intro covers the page, the scene is not rendered (keeps the intro smooth) but its chunk is preloaded.
  const intro = useSyncExternalStore(introStore.subscribe, introStore.getSnapshot, introStore.getServerSnapshot);
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    if (mode === "webgl") void loadScene();
  }, [mode]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "100px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={styles.visual}>
      {mode === "webgl" ? (
        intro.status === "done" && <HeroScene labels={labels} active={inView} />
      ) : (
        <Fallback labels={labels} animate={mode === "fallback"} />
      )}
    </div>
  );
}

function Fallback({ labels, animate }: { labels: string[]; animate: boolean }) {
  return (
    <div className={`${styles.fallback} ${animate ? styles.animated : ""}`} aria-hidden="true">
      <div className={styles.orb} />
      <div className={`${styles.ring} ${styles.ringA}`} />
      <div className={`${styles.ring} ${styles.ringB}`} />
      <div className={styles.orbit}>
        {labels.slice(0, 6).map((label, i) => (
          <span key={label} className={styles.chip} style={{ "--i": i, "--n": Math.min(labels.length, 6) } as React.CSSProperties}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
