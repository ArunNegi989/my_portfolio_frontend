// Browser-side intro state, shared by the intro overlay and the "Replay Intro" button.
// Deliberately not a "use client" module: the root layout imports the boot script string.

import { settings } from "@/data/settings";
import { unlockScroll } from "@/lib/utils/scroll";

const STORAGE_KEY = "an-portfolio-intro-seen";

export type IntroStatus = "playing" | "done";
export interface IntroState {
  status: IntroStatus;
  run: number;
}

/**
 * Runs before first paint. Sets html[data-intro] so returning visitors never see the overlay
 * flash and first-time visitors never see the homepage flash before the intro starts.
 * Without JavaScript the attribute is absent and CSS hides the overlay entirely.
 */
export const INTRO_BOOT_SCRIPT = `(function(){var d=document.documentElement;var s=false;try{s=localStorage.getItem(${JSON.stringify(
  STORAGE_KEY,
)})==="1"}catch(e){}d.dataset.intro=(${settings.introEnabled}&&!s)?"playing":"done";})();`;

const SERVER_STATE: IntroState = { status: "playing", run: 0 };
let state: IntroState | null = null;
const listeners = new Set<() => void>();

function readSeen(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function current(): IntroState {
  if (!state) state = { status: settings.introEnabled && !readSeen() ? "playing" : "done", run: 0 };
  return state;
}

function setHtmlFlag(status: IntroStatus) {
  document.documentElement.dataset.intro = status;
}

function emit() {
  listeners.forEach((listener) => listener());
}

export const introStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: current,
  getServerSnapshot: () => SERVER_STATE,
  finish() {
    if (current().status === "done") return;
    state = { ...current(), status: "done" };
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Storage unavailable (private mode): the intro simply plays again next visit.
    }
    setHtmlFlag("done");
    // Give scrolling back immediately rather than after the overlay's exit fade.
    unlockScroll("intro");
    emit();
  },
  replay() {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    state = { status: "playing", run: current().run + 1 };
    setHtmlFlag("playing");
    emit();
  },
};
