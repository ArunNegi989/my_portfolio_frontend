import { ArrowLeft, ArrowUpRight } from "lucide-react";
import ButtonLink from "@/components/shared/ButtonLink";
import styles from "./NotFoundContent.module.css";

export default function NotFoundContent() {
  return (
    <section className={styles.wrap} aria-labelledby="nf-title">
      <div className={styles.grid} aria-hidden="true" />
      <div className={`container ${styles.inner}`}>
        <p className={styles.code} aria-hidden="true">
          404
        </p>
        <p className={styles.eyebrow}>Error // route_not_found</p>
        <h1 id="nf-title" className={styles.title}>
          This page drifted out of orbit.
        </h1>
        <p className={styles.text}>The link may be broken, or the page may have moved. Let&apos;s get you back on track.</p>
        <div className={styles.actions}>
          <ButtonLink href="/" icon={<ArrowLeft size={16} aria-hidden="true" />}>
            Back home
          </ButtonLink>
          <ButtonLink href="/projects" variant="outline" icon={<ArrowUpRight size={16} aria-hidden="true" />}>
            View projects
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
