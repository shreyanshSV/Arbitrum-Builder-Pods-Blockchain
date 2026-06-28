import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { ArbitrumExplainer } from "@/components/home/ArbitrumExplainer";
import { FinalCTA } from "@/components/home/FinalCTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <ArbitrumExplainer />
      <FinalCTA />
    </>
  );
}
