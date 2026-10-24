"use client";

import { ExternalLink, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { buttonStyles } from "@/components/shared/ButtonLink";
import { cx, displayHost, isWebsiteUrl } from "@/lib/utils";
import styles from "./LiveSiteButton.module.css";

interface LiveSiteButtonProps {
  href?: string;
  label?: string;
  variant?: "primary" | "outline";
  /** Shows the target hostname under the label so visitors know where they are going. */
  showHost?: boolean;
  className?: string;
}

/**
 * Opens a project's real website in a new tab. Renders nothing when no valid http(s) URL is set,
 * so a missing live URL never turns into a broken or invented link.
 */
export default function LiveSiteButton({ href, label = "Visit Live Website", variant = "primary", showHost, className }: LiveSiteButtonProps) {
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    if (!opening) return;
    const id = window.setTimeout(() => setOpening(false), 1600);
    return () => window.clearTimeout(id);
  }, [opening]);

  if (!isWebsiteUrl(href)) return null;
  const host = displayHost(href);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cx(buttonStyles.button, buttonStyles[variant], styles.live, className)}
      aria-label={`${label}: ${host} (opens in a new tab)`}
      aria-busy={opening || undefined}
      onClick={() => setOpening(true)}
    >
      <span className={styles.text}>
        <span>{opening ? "Opening…" : label}</span>
        {showHost && <span className={styles.host}>{host}</span>}
      </span>
      <span className={cx(buttonStyles.icon, styles.icon)} aria-hidden="true">
        {opening ? <LoaderCircle size={16} className={styles.spin} /> : <ExternalLink size={16} />}
      </span>
    </a>
  );
}
