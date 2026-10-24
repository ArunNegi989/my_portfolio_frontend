import type { ReactNode } from "react";
import Reveal from "@/components/animations/Reveal";
import { cx } from "@/lib/utils";
import styles from "./SectionHeading.module.css";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
  id?: string;
  align?: "left" | "split";
}

export default function SectionHeading({ eyebrow, title, description, action, id, align = "split" }: SectionHeadingProps) {
  return (
    <Reveal className={cx(styles.heading, align === "left" && styles.left)}>
      <div>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={id} className={styles.title}>
          {title}
        </h2>
      </div>
      {(description || action) && (
        <div className={styles.side}>
          {description && <p className={styles.description}>{description}</p>}
          {action}
        </div>
      )}
    </Reveal>
  );
}
