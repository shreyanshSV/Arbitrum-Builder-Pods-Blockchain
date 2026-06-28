import type { Metadata } from "next";
import { ConceptsPage } from "@/components/concepts/ConceptsPage";

export const metadata: Metadata = {
  title: "Concepts",
  description:
    "Core Web3 concepts explained as side-by-side comparison cards: Web2 vs Web3, Ethereum vs Bitcoin, public vs private keys, and blockchains vs traditional databases.",
};

export default function Page() {
  return <ConceptsPage />;
}
