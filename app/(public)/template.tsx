import styles from "./template.module.css";

// Remounts on every top-level public navigation, replaying a CSS-only page entrance.
// Opacity only: a transform here would become the containing block for fixed-position
// descendants (intro overlay, gallery lightbox) and misplace them mid-animation.
export default function PublicTemplate({ children }: { children: React.ReactNode }) {
  return (
    <>
      <span className={styles.sweep} aria-hidden="true" />
      <div className={styles.page}>{children}</div>
    </>
  );
}
