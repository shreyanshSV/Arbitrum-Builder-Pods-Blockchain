import { Card, CardBody } from "@/components/ui/Card";

/**
 * Loading placeholder for a price card. Mirrors the real card's layout so the
 * grid doesn't jump when data arrives. Uses the global `shimmer` utility.
 */
export function PriceCardSkeleton() {
  return (
    <Card aria-hidden>
      <CardBody>
        {/* header: monogram + name */}
        <div className="flex items-center gap-3">
          <div className="shimmer h-11 w-11 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="shimmer h-4 w-24 rounded" />
            <div className="shimmer h-3 w-12 rounded" />
          </div>
          <div className="shimmer h-6 w-16 rounded-full" />
        </div>

        {/* price */}
        <div className="mt-5 space-y-2">
          <div className="shimmer h-8 w-32 rounded" />
        </div>

        {/* sparkline */}
        <div className="shimmer mt-5 h-10 w-full rounded-lg" />

        {/* stats grid */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="shimmer h-3 w-16 rounded" />
              <div className="shimmer h-4 w-20 rounded" />
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
