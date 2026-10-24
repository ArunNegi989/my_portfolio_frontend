// Coordinates page scroll locking between the intro overlay / mobile menu and Lenis.

interface LenisLike {
  stop(): void;
  start(): void;
  scrollTo(target: number, options?: { immediate?: boolean }): void;
}

let lenis: LenisLike | null = null;
const locks = new Set<string>();

function apply() {
  const locked = locks.size > 0;
  document.documentElement.style.overflow = locked ? "hidden" : "";
  if (locked) lenis?.stop();
  else lenis?.start();
}

export function registerLenis(instance: LenisLike | null) {
  lenis = instance;
  if (instance && locks.size) instance.stop();
}

export function lockScroll(key: string) {
  locks.add(key);
  apply();
}

export function unlockScroll(key: string) {
  if (!locks.delete(key)) return;
  apply();
}

export function scrollToTop() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (lenis) lenis.scrollTo(0, { immediate: reduce });
  else window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
}
