"use client";

import { RotateCcw } from "lucide-react";
import { introStore } from "@/components/animations/introStore";
import styles from "./Hero.module.css";

export default function ReplayIntroButton() {
  return (
    <button type="button" className={styles.replay} onClick={() => introStore.replay()}>
      <RotateCcw size={14} aria-hidden="true" /> Replay Intro
    </button>
  );
}
