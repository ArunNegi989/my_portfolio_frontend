import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cx } from "@/lib/utils";
import styles from "./Button.module.css";

type Variant = "primary" | "outline" | "ghost";

interface ButtonLinkProps extends Omit<ComponentProps<"a">, "href"> {
  href: string;
  variant?: Variant;
  icon?: ReactNode;
  external?: boolean;
}

/** Link styled as a button. Internal paths use next/link; external ones open in a new tab. */
export default function ButtonLink({ href, variant = "primary", icon, external, className, children, ...rest }: ButtonLinkProps) {
  const classes = cx(styles.button, styles[variant], className);
  const content = (
    <>
      <span>{children}</span>
      {icon && <span className={styles.icon}>{icon}</span>}
    </>
  );
  const isExternal = external ?? /^(https?:|mailto:)/.test(href);
  if (isExternal) {
    return (
      <a href={href} className={classes} target={href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer" {...rest}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...rest}>
      {content}
    </Link>
  );
}

export { styles as buttonStyles };
