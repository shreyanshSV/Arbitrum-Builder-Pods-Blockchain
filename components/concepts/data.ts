import {
  Globe,
  Boxes,
  Bitcoin as BitcoinFallback,
  Coins,
  KeyRound,
  Lock,
  Database,
  Network,
  type LucideIcon,
} from "lucide-react";

/**
 * Color accent for a comparison side. Maps to the design-system token families
 * so every side stays on-brand. `neutral` is the muted/legacy side, the others
 * are the brand/crypto sides.
 */
export type Accent = "primary" | "violet" | "cyan" | "danger" | "amber" | "neutral";

export type ConceptSide = {
  /** Short heading for the side, e.g. "Web2". */
  label: string;
  /** One-word category, shown as a small kicker above the label. */
  kicker: string;
  /** Lucide icon component for the side. */
  icon: LucideIcon;
  /** Accent family used to color-code this side. */
  accent: Accent;
  /** A single-sentence framing of what this side *is*. */
  tagline: string;
  /** 3–5 concise, accurate contrasting facts. */
  points: string[];
};

export type Concept = {
  id: string;
  /** Display title, e.g. "Web2 vs Web3". */
  title: string;
  /** Section eyebrow / kicker. */
  eyebrow: string;
  /** One-line summary shown under the title. */
  summary: string;
  left: ConceptSide;
  right: ConceptSide;
  /** The "so what" takeaway shown at the foot of the card. */
  bottomLine: string;
};

/**
 * The four core comparisons. Copy is original and fact-checked to a beginner-
 * accurate level. (`Bitcoin` is imported aliased as `BitcoinFallback` purely to
 * avoid shadowing the concept's domain name in this file.)
 */
export const concepts: Concept[] = [
  {
    id: "web2-vs-web3",
    eyebrow: "The shift",
    title: "Web2 vs Web3",
    summary:
      "The same internet, a different ownership model. Web2 is rented from platforms; Web3 is owned by users through cryptographic keys.",
    left: {
      label: "Web2",
      kicker: "Platform internet",
      icon: Globe,
      accent: "neutral",
      tagline: "Apps run on company-controlled servers you log into.",
      points: [
        "Centralized servers owned by a single company",
        "The platform holds your data and your account",
        "Access via email, username, and password",
        "Rules and access can change or be revoked anytime",
        "Trust the operator to behave and stay online",
      ],
    },
    right: {
      label: "Web3",
      kicker: "Ownership internet",
      icon: Boxes,
      accent: "primary",
      tagline: "Apps run on open networks you interact with via a wallet.",
      points: [
        "Decentralized networks of independent nodes",
        "You own assets and identity through your wallet",
        "Permissionless — no sign-up or gatekeeper",
        "Logic lives in public, verifiable smart contracts",
        "Trust math and code instead of a company",
      ],
    },
    bottomLine:
      "Web3 doesn't replace the web — it changes who is in control: the user, not the platform.",
  },
  {
    id: "ethereum-vs-bitcoin",
    eyebrow: "The two giants",
    title: "Ethereum vs Bitcoin",
    summary:
      "Both are public blockchains, but they were built for different jobs: Bitcoin to store value, Ethereum to run programs.",
    left: {
      label: "Bitcoin",
      kicker: "Digital gold",
      icon: BitcoinFallback,
      accent: "amber",
      tagline: "A scarce, decentralized store of value and payment rail.",
      points: [
        "Optimized as a store of value (\"digital gold\")",
        "Secured by Proof of Work (mining)",
        "New block roughly every 10 minutes",
        "Tracks coins with the UTXO model",
        "Deliberately limited scripting — no general apps",
      ],
    },
    right: {
      label: "Ethereum",
      kicker: "World computer",
      icon: Coins,
      accent: "primary",
      tagline: "A programmable platform for smart contracts and apps.",
      points: [
        "Runs arbitrary smart contracts on the EVM",
        "Secured by Proof of Stake since The Merge (2022)",
        "New block roughly every 12 seconds",
        "Tracks balances with the account model",
        "Foundation for DeFi, NFTs, and L2s like Arbitrum",
      ],
    },
    bottomLine:
      "Bitcoin is money that is hard to change; Ethereum is a computer that anyone can program.",
  },
  {
    id: "public-vs-private-key",
    eyebrow: "The keypair",
    title: "Public Key vs Private Key",
    summary:
      "Every wallet is a cryptographic key pair. One you can shout from the rooftops; the other you must guard with your life.",
    left: {
      label: "Public Key",
      kicker: "Your address",
      icon: KeyRound,
      accent: "cyan",
      tagline: "The shareable address others use to send you funds.",
      points: [
        "Safe to publish — it's how people pay you",
        "Mathematically derived from the private key",
        "Used to verify signatures you create",
        "Cannot be reversed to reveal the private key",
        "Think of it as your account number",
      ],
    },
    right: {
      label: "Private Key",
      kicker: "Your secret",
      icon: Lock,
      accent: "danger",
      tagline: "The secret that signs transactions and controls funds.",
      points: [
        "Must stay secret — never share or screenshot it",
        "Signs and authorizes every transaction",
        "Whoever holds it fully controls the funds",
        "Often backed up as a 12–24 word seed phrase",
        "Lose it and the assets are gone forever",
      ],
    },
    bottomLine:
      "Share the public key to get paid; protect the private key, because it *is* ownership.",
  },
  {
    id: "blockchain-vs-database",
    eyebrow: "The ledger",
    title: "Blockchain vs Traditional Database",
    summary:
      "A blockchain is a database with very different rules — built for trustless agreement instead of raw speed and control.",
    left: {
      label: "Traditional Database",
      kicker: "Managed store",
      icon: Database,
      accent: "neutral",
      tagline: "A fast, central store an administrator fully controls.",
      points: [
        "Centralized — one owner/admin runs it",
        "Full CRUD: create, read, update, delete",
        "Very fast and inexpensive to operate",
        "ACID guarantees keep data consistent",
        "You must trust the operator not to tamper",
      ],
    },
    right: {
      label: "Blockchain",
      kicker: "Shared ledger",
      icon: Network,
      accent: "primary",
      tagline: "An append-only ledger replicated across many nodes.",
      points: [
        "Decentralized — copies held by many nodes",
        "Append-only: you add, you don't edit or delete",
        "Tamper-evident — each block hashes the last",
        "Trustless: consensus replaces a middleman",
        "Slower and redundant by design, as a trade-off",
      ],
    },
    bottomLine:
      "Use a database when you trust one operator; use a blockchain when no one should have to be trusted.",
  },
];

/** Quick stats for the intro row — one number per concept theme. */
export const introStats: { value: string; label: string }[] = [
  { value: "4", label: "core comparisons" },
  { value: "2", label: "key cryptography" },
  { value: "~12s", label: "Ethereum block time" },
  { value: "100%", label: "plain-English copy" },
];
