import type { ReactNode } from "react";
import SmartImage from "@/components/shared/SmartImage";
import type { ImageAsset } from "@/types/content";
import styles from "./PageHero.module.css";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description?: string;
  image?: ImageAsset;
  children?: ReactNode;
}

/** Shared hero for inner pages: oversized condensed title over a fine grid. */
export default function PageHero({ eyebrow, title, description, image, children }: PageHeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.grid} aria-hidden="true" />
      <div className={`container ${styles.inner} ${image ? styles.withImage : ""}`}>
        <div className={styles.text}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 className={styles.title}>{title}</h1>
          {description && <p className={styles.description}>{description}</p>}
          {children}
        </div>
        {image && (
          <div className={styles.media}>
            <SmartImage src={image.src} alt={image.alt} priority sizes="(max-width: 900px) 100vw, 40vw" />
          </div>
        )}
      </div>
    </section>
  );
}
