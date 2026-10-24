"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { Fragment } from "react";

const line: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const word: Variants = {
  hidden: { y: "110%" },
  show: { y: "0%", transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
};

interface FooterHeadlineProps {
  id?: string;
  text: string;
  className?: string;
}

/** Oversized footer statement: words rise out of clipped lines; the last word is outlined. */
export default function FooterHeadline({ id, text, className }: FooterHeadlineProps) {
  const reduce = useReducedMotion();
  const words = text.trim().split(/\s+/).filter(Boolean);
  return (
    <motion.h2
      id={id}
      className={className}
      variants={line}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
    >
      {words.map((w, i) => (
        <Fragment key={`${w}-${i}`}>
          <span data-word="" data-last={i === words.length - 1 ? "" : undefined}>
            <motion.span variants={word}>{w}</motion.span>
          </span>
          {i < words.length - 1 && " "}
        </Fragment>
      ))}
    </motion.h2>
  );
}
