import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getProfile } from "@/lib/data";
import { cx } from "@/lib/utils";
import styles from "./auth.module.css";

// Sign-in, sign-up and password screens for the dashboard. They sit outside the public layout,
// are reachable only by URL and are kept out of search results.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AuthLayout({ children }: LayoutProps<"/">) {
  const profile = await getProfile();
  return (
    <div className={styles.shell}>
      <div className={styles.backdrop} aria-hidden="true">
        <div className={styles.grid} />
        <div className={cx(styles.orb, styles.orbCyan)} />
        <div className={cx(styles.orb, styles.orbViolet)} />
        <span className={cx(styles.shape, styles.shapeLarge)} />
        <span className={cx(styles.shape, styles.shapeSmall)} />
      </div>

      <header className={styles.top}>
        <Link href="/" className={styles.logo} aria-label={`${profile.name} — back to the portfolio`}>
          <span>A</span>
          <span className={styles.logoN}>N</span>
          <span className={styles.logoDot} aria-hidden="true" />
        </Link>
        <Link href="/" className={styles.back}>
          <ArrowLeft size={15} aria-hidden="true" /> Back to site
        </Link>
      </header>

      <main id="main" className={styles.main}>
        {children}
      </main>

      <p className={styles.footnote}>Portfolio dashboard · Administrator access only</p>
    </div>
  );
}
