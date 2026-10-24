"use client";

import { Check, Link2 } from "lucide-react";
import { useEffect, useState } from "react";
import { LinkedinIcon, WhatsappIcon } from "@/components/shared/BrandIcons";
import styles from "./Article.module.css";

/** Share links built from the configured canonical URL; "Copy link" uses the current address. */
export default function ShareLinks({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(t);
  }, [copied]);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className={styles.share}>
      <p className={styles.shareTitle}>Share</p>
      <div className={styles.shareLinks}>
        <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn">
          <LinkedinIcon size={16} />
        </a>
        <a href={`https://x.com/intent/post?url=${encodedUrl}&text=${encodedTitle}`} target="_blank" rel="noopener noreferrer" aria-label="Share on X">
          <span aria-hidden="true" className={styles.xMark}>
            𝕏
          </span>
        </a>
        <a href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">
          <WhatsappIcon size={16} />
        </a>
        <button
          type="button"
          aria-label={copied ? "Link copied" : "Copy link"}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(window.location.href);
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? <Check size={16} aria-hidden="true" /> : <Link2 size={16} aria-hidden="true" />}
        </button>
      </div>
      <span className="sr-only" aria-live="polite">
        {copied ? "Link copied to clipboard" : ""}
      </span>
    </div>
  );
}
