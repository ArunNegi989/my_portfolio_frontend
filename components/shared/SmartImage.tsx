"use client";

import Image, { type ImageLoader, type ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/utils";
import styles from "./SmartImage.module.css";

type SmartImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string;
  alt: string;
  wrapperClassName?: string;
};

const NEXT_IMAGE_HOSTS = ["images.pexels.com"];

function hostOf(src: string) {
  try {
    return new URL(src).hostname;
  } catch {
    return "";
  }
}

function canOptimize(src: string) {
  return src.startsWith("/") || NEXT_IMAGE_HOSTS.includes(hostOf(src));
}

/**
 * Unsplash's CDN (imgix) resizes and serves WebP/AVIF itself, so next/image asks it directly for
 * each srcset width instead of re-optimizing on our server.
 */
const unsplashLoader: ImageLoader = ({ src, width, quality }) => {
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 75));
  url.searchParams.set("auto", "format");
  url.searchParams.delete("h");
  return url.toString();
};

/**
 * next/image wrapper that fills its parent, "develops" the image in once it has loaded and
 * shows a branded fallback if the remote image fails. Hosts not configured in next.config.ts are rendered unoptimized.
 */
export default function SmartImage({ src, alt, className, wrapperClassName, sizes, onLoad, ...rest }: SmartImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const failed = !src || failedSrc === src;
  const loaded = loadedSrc === src;
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Safety net: an image that finished loading before hydration may not report onLoad,
  // and the reveal curtain must never stay down over a loaded image.
  useEffect(() => {
    const img = wrapperRef.current?.querySelector("img");
    if (img?.complete && img.naturalWidth > 0) setLoadedSrc(src);
  }, [src]);

  return (
    <div ref={wrapperRef} className={cx(styles.wrapper, !failed && (loaded ? styles.revealed : styles.loading), wrapperClassName)}>
      {failed ? (
        <div className={styles.fallback} role="img" aria-label={alt}>
          <span>AN.</span>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes ?? "100vw"}
          className={cx(styles.image, className)}
          {...(hostOf(src) === "images.unsplash.com" ? { loader: unsplashLoader } : { unoptimized: !canOptimize(src) })}
          onError={() => setFailedSrc(src)}
          onLoad={(event) => {
            setLoadedSrc(src);
            onLoad?.(event);
          }}
          {...rest}
        />
      )}
    </div>
  );
}
