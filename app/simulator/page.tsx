import { SimulatorClient } from "@/components/simulator/SimulatorClient";

export const metadata = {
  title: "Block Simulator",
  description:
    "An interactive proof-of-work block mining simulator: hash blocks with real " +
    "SHA-256, find a valid nonce, then tamper with the data and watch the chain break.",
};

export default function SimulatorPage() {
  return <SimulatorClient />;
}
