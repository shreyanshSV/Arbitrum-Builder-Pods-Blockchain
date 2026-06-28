import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Accent, Concept, ConceptSide } from "@/components/concepts/data";

/**
 * Per-accent class bundle. Each side of a comparison is color-coded through one
 * of these — keeps the two columns visually distinct and on-brand.
 */
const accentStyles: Record<
  Accent,
  {
    text: string;
    chipBg: string;
    chipRing: string;
    glow: string;
    dot: string;
    bullet: string;
  }
> = {
  primary: {
    text: "text-primary",
    chipBg: "bg-primary/12",
    chipRing: "ring-primary/25",
    glow: "from-primary/15",
    dot: "bg-primary",
    bullet: "text-primary",
  },
  violet: {
    text: "text-accent-violet",
    chipBg: "bg-accent-violet/12",
    chipRing: "ring-accent-violet/25",
    glow: "from-accent-violet/15",
    dot: "bg-accent-violet",
    bullet: "text-accent-violet",
  },
  cyan: {
    text: "text-accent-cyan",
    chipBg: "bg-accent-cyan/12",
    chipRing: "ring-accent-cyan/25",
    glow: "from-accent-cyan/15",
    dot: "bg-accent-cyan",
    bullet: "text-accent-cyan",
  },
  danger: {
    text: "text-danger",
    chipBg: "bg-danger/12",
    chipRing: "ring-danger/25",
    glow: "from-danger/15",
    dot: "bg-danger",
    bullet: "text-danger",
  },
  amber: {
    // Bitcoin orange — uses the warning token (#ffc24b) family.
    text: "text-warning",
    chipBg: "bg-warning/12",
    chipRing: "ring-warning/25",
    glow: "from-warning/15",
    dot: "bg-warning",
    bullet: "text-warning",
  },
  neutral: {
    text: "text-muted-strong",
    chipBg: "bg-white/[0.06]",
    chipRing: "ring-white/10",
    glow: "from-white/5",
    dot: "bg-muted",
    bullet: "text-muted",
  },
};

function Side({ side }: { side: ConceptSide }) {
  const a = accentStyles[side.accent];
  const Icon = side.icon;

  return (
    <div className="group/side relative flex flex-1 flex-col overflow-hidden rounded-2xl p-6">
      {/* soft accent wash, brightens on hover */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b to-transparent opacity-60 transition-opacity duration-300 group-hover/side:opacity-100",
          a.glow,
        )}
      />

      <div className="flex items-center gap-3">
        <span
          className={cn(
            "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset",
            a.chipBg,
            a.chipRing,
          )}
        >
          <Icon className={cn("h-5 w-5", a.text)} aria-hidden />
        </span>
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted">
            {side.kicker}
          </p>
          <h4
            className={cn(
              "font-display text-lg font-bold leading-tight tracking-tight",
              a.text,
            )}
          >
            {side.label}
          </h4>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted-strong">
        {side.tagline}
      </p>

      <ul className="mt-5 flex flex-col gap-2.5">
        {side.points.map((point) => (
          <li key={point} className="flex items-start gap-2.5 text-sm">
            <Check
              className={cn("mt-0.5 h-4 w-4 shrink-0", a.bullet)}
              aria-hidden
            />
            <span className="leading-snug text-muted">{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * A single two-column side-by-side comparison block with a central "VS" divider.
 * Columns stack vertically below `md` and sit side by side from `md` up. Pure
 * server component — animation is handled by the surrounding <Reveal> on the page.
 */
export function ComparisonCard({ concept }: { concept: Concept }) {
  return (
    <article
      id={concept.id}
      className="glass lift scroll-mt-28 overflow-hidden rounded-3xl"
    >
      {/* header */}
      <header className="border-b border-border px-6 py-6 sm:px-8">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          <span className="h-px w-5 bg-primary/60" />
          {concept.eyebrow}
        </span>
        <h3 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {concept.title}
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          {concept.summary}
        </p>
      </header>

      {/* the two sides + central VS */}
      <div className="relative flex flex-col gap-3 p-3 sm:p-4 md:flex-row md:items-stretch md:gap-0">
        <Side side={concept.left} />

        {/* VS divider — horizontal on mobile, vertical on md+ */}
        <div
          className="relative flex items-center justify-center md:w-px md:self-stretch"
          aria-hidden
        >
          <div className="hidden h-full w-px bg-gradient-to-b from-transparent via-border-strong to-transparent md:block" />
          <div className="h-px w-full bg-gradient-to-r from-transparent via-border-strong to-transparent md:hidden" />
          <span className="absolute grid h-10 w-10 place-items-center rounded-full border border-border-strong bg-background-elevated font-display text-xs font-bold tracking-widest text-muted-strong shadow-[0_4px_20px_-6px_rgba(0,0,0,0.8)]">
            VS
          </span>
        </div>

        <Side side={concept.right} />
      </div>

      {/* bottom-line takeaway */}
      <footer className="flex items-start gap-3 border-t border-border bg-white/[0.02] px-6 py-5 sm:px-8">
        <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/12 text-[0.7rem] font-bold text-primary">
          TL
        </span>
        <p className="text-sm leading-relaxed text-muted-strong">
          <span className="font-semibold text-foreground">Bottom line: </span>
          {concept.bottomLine}
        </p>
      </footer>
    </article>
  );
}
