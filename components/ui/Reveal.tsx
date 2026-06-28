"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { useReducedMotionSafe } from "@/components/ui/useReducedMotionSafe";

type RevealProps = HTMLMotionProps<"div"> & {
  /** entrance delay in seconds (use for manual staggering) */
  delay?: number;
  /** vertical travel distance in px */
  y?: number;
  /** re-animate every time it enters the viewport instead of once */
  repeat?: boolean;
};

/**
 * Scroll-reveal wrapper. Fades + lifts its children into view when scrolled to.
 * Honors prefers-reduced-motion by rendering instantly with no transform.
 */
export function Reveal({
  children,
  delay = 0,
  y = 20,
  repeat = false,
  ...props
}: RevealProps) {
  const reduce = useReducedMotionSafe();

  if (reduce) {
    // Render fully visible with no animation. `initial={false}` makes motion
    // jump straight to the target so content can never get stuck at opacity 0.
    return (
      <motion.div {...props} initial={false} animate={{ opacity: 1, y: 0 }}>
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: !repeat, margin: "-80px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 0.7, 0.2, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
