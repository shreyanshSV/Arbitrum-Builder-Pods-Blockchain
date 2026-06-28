"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "motion/react";
import { ArrowRight, Activity, Boxes, Layers } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { buttonStyles } from "@/components/ui/Button";
import { ChainVisual } from "@/components/home/ChainVisual";
import { ParticleNetwork } from "@/components/home/ParticleNetwork";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 0.7, 0.2, 1] },
  },
};

const heroStats = [
  { icon: Layers, label: "4 interactive modules" },
  { icon: Activity, label: "Real-time CoinGecko data" },
  { icon: Boxes, label: "Live proof-of-work miner" },
];

export function Hero() {
  return (
    <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-12 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pt-20">
      {/* ambient blockchain backdrop (decorative): static render + live mesh */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <Image
          src="/generated/hero-network.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-right opacity-40 [mask-image:radial-gradient(130%_110%_at_80%_40%,black,transparent_70%)] sm:opacity-55"
        />
        <ParticleNetwork className="absolute inset-0 h-full w-full [mask-image:radial-gradient(120%_120%_at_70%_40%,black,transparent_78%)]" />
      </div>

      <motion.div variants={container} initial="hidden" animate="show">
        <motion.div variants={item}>
          <Badge variant="primary" className="mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Arbitrum Builder Pods · Web3 Field Guide
          </Badge>
        </motion.div>

        <motion.h1
          variants={item}
          className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl"
        >
          Understand <span className="text-gradient-brand">Web3</span> by
          actually building it.
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 max-w-xl text-lg leading-relaxed text-muted"
        >
          ChainLab is a hands-on tour through the ideas that power Ethereum and{" "}
          <span className="text-foreground">Arbitrum</span>: compare core
          concepts, watch ETH &amp; BTC move in real time, and mine your own
          blocks to feel why a blockchain is immutable.
        </motion.p>

        <motion.div variants={item} className="mt-8 flex flex-wrap gap-3">
          <Link href="/concepts" className={buttonStyles({ size: "lg" })}>
            Explore the concepts
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/simulator"
            className={buttonStyles({ variant: "secondary", size: "lg" })}
          >
            Mine a block
          </Link>
        </motion.div>

        <motion.ul
          variants={item}
          className="mt-10 flex flex-wrap gap-x-6 gap-y-3"
        >
          {heroStats.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-2 text-sm text-muted-strong"
            >
              <Icon className="h-4 w-4 text-primary" />
              {label}
            </li>
          ))}
        </motion.ul>
      </motion.div>

      {/* right: chain visual panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="relative"
      >
        <div className="glass-strong relative rounded-3xl p-6 sm:p-8">
          <div className="mb-5 flex items-center justify-between">
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              chain · preview
            </p>
            <span className="flex items-center gap-1.5 text-xs text-success">
              <span className="h-2 w-2 rounded-full bg-success" />
              synced
            </span>
          </div>
          <ChainVisual />
          <p className="mt-6 text-center text-xs text-muted">
            Each block stores the previous block&apos;s hash — change one and the
            rest break.
          </p>
        </div>
        {/* glow underlay */}
        <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-primary/10 blur-2xl" />
      </motion.div>
    </section>
  );
}
