"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { registerLenis } from "@/lib/utils/scroll";

/** Lenis smooth scrolling for the public site. Disabled for reduced-motion users and touch devices. */
export default function SmoothScroll({ enabled = true }: { enabled?: boolean }) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!enabled) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;

    const lenis = new Lenis({ autoRaf: true, lerp: 0.12, anchors: { offset: -96 } });
    lenisRef.current = lenis;
    registerLenis(lenis);
    return () => {
      registerLenis(null);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [enabled]);

  // New route: jump to the top instantly so Lenis does not animate from the old position.
  useEffect(() => {
    if (!window.location.hash) lenisRef.current?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}
