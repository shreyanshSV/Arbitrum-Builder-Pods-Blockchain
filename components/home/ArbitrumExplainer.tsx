import { TrendingUp, Layers2, Wallet } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GasCompare } from "@/components/home/GasCompare";

const points = [
  {
    icon: TrendingUp,
    step: "01",
    title: "Why Ethereum needed Layer 2",
    body: "Ethereum processes only a handful of transactions per second. When demand spikes, blocks fill up and users bid against each other on gas — so fees climb fast. Ethereum stays secure and decentralized, but it simply can't scale to the whole world on its own.",
  },
  {
    icon: Layers2,
    step: "02",
    title: "What Arbitrum is & how it helps",
    body: "Arbitrum is an optimistic rollup — a Layer-2 network that runs transactions off mainnet, bundles thousands together, and posts compressed proof back to Ethereum. You keep Ethereum-grade security (data and settlement live on L1) while the heavy lifting happens on a faster, cheaper layer.",
  },
  {
    icon: Wallet,
    step: "03",
    title: "The real-world benefit",
    body: "A swap that might cost several dollars on mainnet often costs just a few cents on Arbitrum, and confirms in moments. Same wallet, same apps, same security model — a fraction of the fee. That's what makes everyday on-chain activity practical.",
  },
];

export function ArbitrumExplainer() {
  return (
    <section
      id="layer2"
      className="relative scroll-mt-24 border-y border-border bg-background-elevated/40"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading
          eyebrow="Arbitrum · Layer 2"
          title={
            <>
              Scaling Ethereum, <span className="text-gradient-brand">
                explained simply
              </span>
            </>
          }
          subtitle="The theme of this site. Three ideas explain why Layer-2 rollups like Arbitrum matter — and why they're where builders are heading."
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          {/* the three required points */}
          <ol className="space-y-4">
            {points.map((point, i) => {
              const Icon = point.icon;
              return (
                <Reveal key={point.step} delay={i * 0.08}>
                  <li className="glass flex gap-5 rounded-2xl p-6">
                    <div className="flex flex-col items-center gap-2">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="font-mono text-xs text-muted">
                        {point.step}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold tracking-tight">
                        {point.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {point.body}
                      </p>
                    </div>
                  </li>
                </Reveal>
              );
            })}
          </ol>

          {/* the benefit, visualized */}
          <Reveal delay={0.15}>
            <GasCompare />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
