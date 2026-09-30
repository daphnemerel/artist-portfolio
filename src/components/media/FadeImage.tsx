"use client";

import Image, { type ImageProps } from "next/image";
import { useCallback, useState } from "react";
import styles from "./media.module.css";

/** next/image that fades in once loaded. Keeps natural aspect ratio — never crops. */
export function FadeImage({ className, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  // Cached images can finish loading before hydration, so onLoad never fires — check on mount too.
  const ref = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth > 0) setLoaded(true);
  }, []);
  return (
    <Image
      {...props}
      ref={ref}
      className={`${styles.image} ${className ?? ""}`}
      data-loaded={loaded}
      onLoad={() => setLoaded(true)}
    />
  );
}
