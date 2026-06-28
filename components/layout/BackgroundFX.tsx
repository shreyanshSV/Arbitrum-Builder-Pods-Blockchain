/**
 * Fixed, non-interactive ambient background shared by every page. Deliberately
 * restrained: a faint grid, a single focused crimson glow at the top, a very
 * soft ember glow low-right, a film-grain layer for depth, and a vignette. No
 * rainbow blobs — the goal is an intentional, premium dark stage, not a busy
 * "AI gradient". Animations are disabled under prefers-reduced-motion.
 */
export function BackgroundFX() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* base wash */}
      <div className="absolute inset-0 bg-background" />

      {/* faint structural grid, fading toward the bottom */}
      <div className="bg-grid absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />

      {/* primary crimson glow anchored top-center */}
      <div
        className="aurora animate-drift left-1/2 top-[-22%] h-[55vh] w-[80vw] max-w-[1100px] -translate-x-1/2 opacity-40"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,59,66,0.9), transparent 72%)",
        }}
      />
      {/* soft ember support glow, low and off to the side */}
      <div
        className="aurora animate-drift bottom-[-18%] right-[-6%] h-[42vh] w-[42vh] opacity-25"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,138,61,0.8), transparent 70%)",
          animationDelay: "-9s",
        }}
      />

      {/* film grain for texture */}
      <div className="noise absolute inset-0 opacity-[0.04] mix-blend-soft-light" />

      {/* top fade so the sticky navbar sits on solid color */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background to-transparent" />
      {/* bottom vignette */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
