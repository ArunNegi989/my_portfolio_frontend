"use client";

import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import SmartImage from "@/components/shared/SmartImage";
import type { ImageAsset } from "@/types/content";
import styles from "./Gallery.module.css";

/** Responsive image gallery with an accessible lightbox (native <dialog>). */
export default function Gallery({ images, title }: { images: ImageAsset[]; title: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);

  const open = (i: number) => {
    setIndex(i);
    dialogRef.current?.showModal();
  };
  const close = useCallback(() => dialogRef.current?.close(), []);
  const step = useCallback((delta: number) => setIndex((i) => (i === null ? i : (i + delta + images.length) % images.length)), [images.length]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => setIndex(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    dialog.addEventListener("close", onClose);
    dialog.addEventListener("keydown", onKey);
    return () => {
      dialog.removeEventListener("close", onClose);
      dialog.removeEventListener("keydown", onKey);
      // Activity may hide this page while the lightbox is open; never leave it open behind.
      if (dialog.open) dialog.close();
    };
  }, [step]);

  if (!images.length) return null;
  const current = index !== null ? images[index] : null;

  return (
    <>
      <ul role="list" className={styles.grid}>
        {images.map((image, i) => (
          <li key={`${image.src}-${i}`} className={styles.item}>
            <button type="button" className={styles.thumb} onClick={() => open(i)} aria-label={`Open image ${i + 1} of ${images.length}: ${image.alt}`}>
              <SmartImage src={image.src} alt={image.alt} sizes="(max-width: 700px) 100vw, 50vw" />
              <span className={styles.expand} aria-hidden="true">
                <Expand size={16} />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog ref={dialogRef} className={styles.dialog} aria-label={`${title} gallery`}>
        {current && (
          <div className={styles.lightbox}>
            <div className={styles.lightboxImage}>
              <SmartImage src={current.src} alt={current.alt} sizes="90vw" />
            </div>
            <p className={styles.caption}>
              <span>
                {(index ?? 0) + 1} / {images.length}
              </span>
              {current.alt}
              {current.credit && <em> — {current.credit}</em>}
            </p>
            <button type="button" className={`${styles.control} ${styles.close}`} onClick={close} aria-label="Close gallery">
              <X size={20} aria-hidden="true" />
            </button>
            {images.length > 1 && (
              <>
                <button type="button" className={`${styles.control} ${styles.prev}`} onClick={() => step(-1)} aria-label="Previous image">
                  <ChevronLeft size={22} aria-hidden="true" />
                </button>
                <button type="button" className={`${styles.control} ${styles.next}`} onClick={() => step(1)} aria-label="Next image">
                  <ChevronRight size={22} aria-hidden="true" />
                </button>
              </>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}
