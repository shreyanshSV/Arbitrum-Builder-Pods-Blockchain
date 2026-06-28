"use client";

import { useEffect, useRef } from "react";
import { useReducedMotionSafe } from "@/components/ui/useReducedMotionSafe";

/**
 * Hero background video (muted, looping, decorative).
 *
 * - `poster` is the generated still, so the area paints instantly AND degrades
 *   gracefully: if /generated/hero.mp4 is absent (it's gitignored / not shipped
 *   in the public repo), the poster image simply shows instead.
 * - Honors prefers-reduced-motion: the video is paused (poster frame only).
 * - Decorative, so aria-hidden and not focusable.
 */
export function HeroBackground() {
  const reduce = useReducedMotionSafe();
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (reduce) {
      video.pause();
    } else {
      // play() can reject if the tab is backgrounded — ignore safely
      void video.play().catch(() => {});
    }
  }, [reduce]);

  return (
    <video
      ref={ref}
      aria-hidden
      muted
      loop
      playsInline
      autoPlay
      preload="metadata"
      poster="/generated/hero-network.png"
      className="h-full w-full object-cover object-right"
    >
      <source src="/generated/hero.mp4" type="video/mp4" />
    </video>
  );
}
