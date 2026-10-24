import { cx } from "@/lib/utils";
import styles from "./Tag.module.css";

interface TagListProps {
  items: string[];
  variant?: "default" | "accent" | "lime";
  label?: string;
  className?: string;
}

export default function TagList({ items, variant = "default", label, className }: TagListProps) {
  if (!items.length) return null;
  return (
    <ul className={cx(styles.list, className)} aria-label={label}>
      {items.map((item) => (
        <li key={item} className={cx(styles.tag, variant !== "default" && styles[variant])}>
          {item}
        </li>
      ))}
    </ul>
  );
}
