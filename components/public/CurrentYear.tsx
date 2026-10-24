"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// The prerendered shell must not read the clock (Cache Components), so the year
// is read in the browser only; the server snapshot is the fallback below.
export default function CurrentYear({ fallback = 2026 }: { fallback?: number }) {
  const year = useSyncExternalStore(subscribe, () => new Date().getFullYear(), () => fallback);
  return <span>{year}</span>;
}
