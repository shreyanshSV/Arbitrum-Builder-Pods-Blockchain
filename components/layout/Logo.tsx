import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

/**
 * ChainLab brand mark: an isometric "block" cube with the brand gradient,
 * optionally followed by the wordmark. Pure SVG so it scales crisply and
 * adapts to the theme.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      role="img"
      aria-label={`${siteConfig.name} logo`}
      className={cn("h-7 w-7", className)}
    >
      <defs>
        <linearGradient id="cube-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffe08a" />
          <stop offset="100%" stopColor="#ffc53d" />
        </linearGradient>
        <linearGradient id="cube-left" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffc53d" />
          <stop offset="100%" stopColor="#d18f00" />
        </linearGradient>
        <linearGradient id="cube-right" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd45c" />
          <stop offset="100%" stopColor="#eaa200" />
        </linearGradient>
      </defs>
      <polygon points="16,2.5 29,10 16,17.5 3,10" fill="url(#cube-top)" />
      <polygon points="3,10 16,17.5 16,30 3,22.5" fill="url(#cube-left)" />
      <polygon points="29,10 16,17.5 16,30 29,22.5" fill="url(#cube-right)" />
      <polygon
        points="16,2.5 29,10 16,17.5 3,10"
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="0.5"
      />
    </svg>
  );
}

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {showWordmark && (
        <span className="font-display text-lg font-bold tracking-tight">
          Chain<span className="text-gradient-brand">Lab</span>
        </span>
      )}
    </span>
  );
}
