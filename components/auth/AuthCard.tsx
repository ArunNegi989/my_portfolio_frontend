import { TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cx } from "@/lib/utils";
import styles from "./Auth.module.css";

interface AuthCardProps {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  /** Plain-language note that this page is a frontend preview, shown above the form. */
  demoNote: string;
  footer?: ReactNode;
  wide?: boolean;
  children: ReactNode;
}

export default function AuthCard({ icon, eyebrow, title, description, demoNote, footer, wide, children }: AuthCardProps) {
  return (
    <section className={cx(styles.card, wide && styles.wide)} aria-labelledby="auth-title">
      <header className={styles.head}>
        <span className={styles.badge} aria-hidden="true">
          {icon}
        </span>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 id="auth-title" className={styles.title}>
          {title}
        </h1>
        <p className={styles.description}>{description}</p>
      </header>
      <p className={styles.demo}>
        <TriangleAlert size={16} aria-hidden="true" />
        <span>
          <strong>Preview only.</strong> {demoNote}
        </span>
      </p>
      {children}
      {footer && <p className={styles.footer}>{footer}</p>}
    </section>
  );
}
