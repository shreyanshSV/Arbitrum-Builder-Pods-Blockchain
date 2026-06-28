import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { buttonStyles } from "@/components/ui/Button";
import { navItems } from "@/lib/site";

export function FinalCTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <Reveal>
        <div className="glass-strong relative overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-12">
          <div className="bg-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
          <div
            className="absolute left-1/2 top-0 h-40 w-[36rem] max-w-full -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
            aria-hidden
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Stop reading about Web3.{" "}
              <span className="text-gradient-brand">Start touching it.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              Compare the concepts, watch the markets move, and mine your first
              block — all in one place.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/concepts" className={buttonStyles({ size: "lg" })}>
                Start with the concepts
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/prices"
                className={buttonStyles({ variant: "secondary", size: "lg" })}
              >
                Check live prices
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
