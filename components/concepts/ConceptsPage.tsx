import Link from "next/link";
import { ArrowRight, BookOpen, Columns3, Lightbulb } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Badge } from "@/components/ui/Badge";
import { buttonStyles } from "@/components/ui/Button";
import { ComparisonCard } from "@/components/concepts/ComparisonCard";
import { ConceptsJumpNav } from "@/components/concepts/ConceptsJumpNav";
import { concepts, introStats } from "@/components/concepts/data";

/**
 * Concepts page body. Server component — the only interactive piece is the
 * scroll-spy jump nav, which is its own "use client" child.
 */
export function ConceptsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
      {/* intro hero */}
      <SectionHeading
        eyebrow="The fundamentals"
        title={
          <>
            Web3, <span className="text-gradient-brand">side by side</span>
          </>
        }
        subtitle="Four ideas you have to feel before the rest of Web3 clicks — each shown as a head-to-head comparison instead of a wall of text. No jargon, no hand-waving."
      />

      {/* intro stat row */}
      <Reveal delay={0.1}>
        <dl className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {introStats.map((stat) => (
            <div
              key={stat.label}
              className="glass rounded-2xl px-4 py-5 text-center"
            >
              <dt className="sr-only">{stat.label}</dt>
              <dd className="font-mono text-2xl font-bold tracking-tight tnum text-foreground sm:text-3xl">
                {stat.value}
              </dd>
              <p className="mt-1 text-xs leading-snug text-muted">
                {stat.label}
              </p>
            </div>
          ))}
        </dl>
      </Reveal>

      {/* how to read */}
      <Reveal delay={0.15} className="mt-6 flex justify-center">
        <Badge variant="primary">
          <Columns3 className="h-3.5 w-3.5" />
          Read each card left vs right
        </Badge>
      </Reveal>

      {/* sticky jump nav */}
      <div className="mt-14">
        <ConceptsJumpNav />
      </div>

      {/* the four comparison blocks */}
      <div className="flex flex-col gap-8 sm:gap-10">
        {concepts.map((concept, i) => (
          <Reveal key={concept.id} delay={Math.min(i * 0.06, 0.18)} y={28}>
            <ComparisonCard concept={concept} />
          </Reveal>
        ))}
      </div>

      {/* closing callout — ties back to the build theme */}
      <Reveal delay={0.1} className="mt-16">
        <div className="glass-strong relative overflow-hidden rounded-3xl p-8 sm:p-10">
          <div className="bg-dots absolute inset-0 opacity-40" aria-hidden />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                <Lightbulb className="h-4 w-4" />
                Why comparison cards?
              </span>
              <h3 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Contrast is the fastest way to understand
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                You rarely learn a concept in isolation — you learn it against
                what it is <span className="text-foreground">not</span>. Putting
                Web2 next to Web3, or a database next to a blockchain, turns
                abstract definitions into a clear set of trade-offs you can
                actually reason about. From here, go watch those trade-offs play
                out live.
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href="/prices" className={buttonStyles({ size: "lg" })}>
                <BookOpen className="h-4 w-4" />
                See it live
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/simulator"
                className={buttonStyles({ variant: "secondary", size: "lg" })}
              >
                Mine a block
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
