"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { concepts } from "@/components/concepts/data";

/**
 * Sticky sub-navigation that lets readers jump between the four comparison
 * blocks, with scroll-spy highlighting the section currently in view.
 */
export function ConceptsJumpNav() {
  const [activeId, setActiveId] = useState<string>(concepts[0]?.id ?? "");

  useEffect(() => {
    const sections = concepts
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry nearest the top that's currently intersecting.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      // Bias the "active" zone to the upper third of the viewport.
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 },
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Jump to a comparison"
      className="sticky top-20 z-20 -mx-4 mb-12 px-4 sm:mx-0 sm:px-0"
    >
      <div className="glass-strong flex gap-1.5 overflow-x-auto rounded-2xl p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {concepts.map((c) => {
          const active = c.id === activeId;
          return (
            <a
              key={c.id}
              href={`#${c.id}`}
              aria-current={active ? "true" : undefined}
              className={cn(
                "whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-medium transition-colors sm:text-sm",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted hover:bg-white/[0.06] hover:text-foreground",
              )}
            >
              {c.title}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
