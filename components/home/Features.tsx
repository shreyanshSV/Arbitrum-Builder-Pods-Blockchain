import Link from "next/link";
import Image from "next/image";
import {
  Columns3,
  LineChart,
  Boxes,
  ArrowUpRight,
  Zap,
  ShieldCheck,
  Gauge,
} from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

const features = [
  {
    href: "/concepts",
    icon: Columns3,
    image: "/generated/concepts.png",
    title: "Concept Comparison Cards",
    desc: "Web2 vs Web3, Ethereum vs Bitcoin, public vs private keys, and blockchains vs databases — explained side by side, in plain language.",
    iconColor: "text-primary",
  },
  {
    href: "/prices",
    icon: LineChart,
    image: "/generated/prices.png",
    title: "Live Price Dashboard",
    desc: "Real-time ETH, BTC, ARB and more from CoinGecko, with 7-day sparklines, 24h change arrows, and a server-streamed live mode.",
    iconColor: "text-accent-cyan",
  },
  {
    href: "/simulator",
    icon: Boxes,
    image: "/generated/simulator.png",
    title: "Proof-of-Work Simulator",
    desc: "Mine blocks with genuine SHA-256 hashing, find a valid nonce, then edit a block and watch the whole chain turn red.",
    iconColor: "text-accent-violet",
  },
];

const pillars = [
  { icon: Zap, label: "Fast & cheap L2 transactions" },
  { icon: ShieldCheck, label: "Secured by Ethereum mainnet" },
  { icon: Gauge, label: "Real cryptographic hashing" },
];

export function Features() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="What's inside"
        title={
          <>
            Four modules, <span className="text-gradient">one journey</span>
          </>
        }
        subtitle="Every page is a working mini-app built around a single Web3 idea — so the concepts stop being abstract and start being tangible."
      />

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <Reveal key={feature.href} delay={i * 0.08}>
              <Link
                href={feature.href}
                className="group glass lift block h-full overflow-hidden rounded-2xl"
              >
                {/* thematic image topper */}
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={feature.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  {/* fade the image into the card body */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  {/* icon chip over the image */}
                  <div className="absolute bottom-3 left-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-background/70 backdrop-blur">
                    <Icon className={cn("h-5 w-5", feature.iconColor)} />
                  </div>
                </div>

                <div className="p-6 pt-5">
                  <h3 className="font-display text-xl font-bold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted">
                    {feature.desc}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary transition-transform group-hover:translate-x-0.5">
                    Open module
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}

        {/* wide highlight card with the chain-cubes render */}
        <Reveal delay={0.1} className="sm:col-span-2 lg:col-span-3">
          <div className="glass relative overflow-hidden rounded-2xl p-7 sm:p-9">
            <Image
              src="/generated/chain-cubes.png"
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-right opacity-25 [mask-image:linear-gradient(to_right,transparent,black_55%)]"
            />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <h3 className="font-display text-2xl font-bold tracking-tight">
                  Built around the{" "}
                  <span className="text-gradient-brand">Arbitrum</span> way of
                  scaling Ethereum
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  Layer-2 rollups bundle thousands of transactions off-chain and
                  settle them on Ethereum. The result: the same security, a
                  fraction of the cost. Scroll on to see exactly how.
                </p>
              </div>
              <ul className="grid shrink-0 gap-3">
                {pillars.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-3 text-sm">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/12 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-muted-strong">{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
