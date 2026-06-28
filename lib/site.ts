/**
 * Central site configuration: brand, author, and the single source of truth
 * for navigation. Every page links to all four routes from here, so the nav
 * stays consistent and active-state highlighting works everywhere.
 */

export const siteConfig = {
  name: "ChainLab",
  tagline: "An interactive field guide to Web3 & Arbitrum.",
  description:
    "ChainLab is a hands-on Web3 learning hub: an Arbitrum & Layer-2 explainer, " +
    "core-concept comparison cards, a live ETH/BTC price dashboard, and an " +
    "interactive proof-of-work block mining simulator.",
  url: "https://chainlab.example.com",
  author: {
    name: "Shreyansh",
    github: "https://github.com/shreyanshSV/Arbitrum-Builder-Pods-Blockchain",
    githubHandle: "shreyanshSV",
    batch: "Arbitrum Builder Pods · LamprosDAO",
  },
} as const;

export type NavItem = {
  label: string;
  href: string;
  /** short descriptor used in menus / footer */
  blurb: string;
};

export const navItems: NavItem[] = [
  { label: "Home", href: "/", blurb: "Arbitrum & Layer-2 overview" },
  { label: "Concepts", href: "/concepts", blurb: "Web3 comparison cards" },
  { label: "Live Prices", href: "/prices", blurb: "Real-time ETH & BTC" },
  { label: "Simulator", href: "/simulator", blurb: "Mine blocks, break chains" },
];
