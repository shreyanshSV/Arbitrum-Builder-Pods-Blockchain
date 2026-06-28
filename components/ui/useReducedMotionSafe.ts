"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Hydration-safe reduced-motion preference.
 *
 * `motion`'s `useReducedMotion()` reads `matchMedia` and returns the real value
 * on the FIRST client render — but the server always renders as "no preference".
 * Components that branch their markup on it (e.g. rendering different motion
 * props) therefore mismatch during hydration for users who enable reduced
 * motion. This wrapper returns `false` on the server AND the first client render
 * (so the markup matches), then the user's true preference after mount.
 */
export function useReducedMotionSafe(): boolean {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time post-mount flag
    setMounted(true);
  }, []);
  return mounted ? Boolean(reduce) : false;
}
