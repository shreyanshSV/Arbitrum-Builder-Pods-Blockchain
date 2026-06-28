import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { navItems, siteConfig } from "@/lib/site";
import { Logo } from "@/components/layout/Logo";
import { GithubIcon } from "@/components/ui/icons";

const resources = [
  { label: "CoinGecko API", href: "https://www.coingecko.com/en/api" },
  { label: "Arbitrum Docs", href: "https://docs.arbitrum.io" },
  { label: "Ethereum L2s", href: "https://ethereum.org/en/layer-2/" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 border-t border-border">
      <div className="divider-glow absolute inset-x-0 top-0" />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {/* brand */}
          <div className="col-span-2 flex flex-col gap-4 md:col-span-1">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-muted">
              {siteConfig.tagline}
            </p>
            <a
              href={siteConfig.author.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-strong transition-colors hover:border-border-strong hover:text-foreground"
            >
              <GithubIcon className="h-4 w-4" />
              View source
            </a>
          </div>

          {/* pages */}
          <nav aria-label="Footer" className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Pages
            </h3>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-strong transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* resources */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Resources
            </h3>
            {resources.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-muted-strong transition-colors hover:text-primary"
              >
                {item.label}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>

          {/* author */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Built by
            </h3>
            <p className="text-sm font-medium text-foreground">
              {siteConfig.author.name}
            </p>
            <p className="text-sm text-muted">{siteConfig.author.batch}</p>
            <a
              href={siteConfig.author.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary transition-colors hover:text-primary-strong"
            >
              @{siteConfig.author.githubHandle}
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-sm text-muted sm:flex-row">
          <p>
            © {year} {siteConfig.name}. Built for the {siteConfig.author.batch}.
          </p>
          <p className="text-muted">
            Data by CoinGecko · Hashing via Web Crypto (SHA-256)
          </p>
        </div>
      </div>
    </footer>
  );
}
