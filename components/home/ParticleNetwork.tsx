"use client";

import { useEffect, useRef } from "react";
import { useReducedMotionSafe } from "@/components/ui/useReducedMotionSafe";

/**
 * Animated "blockchain mesh" — a lightweight canvas particle network of drifting
 * nodes connected by lines when they're near each other, with a subtle pull
 * toward the cursor. Pure code (no asset, no dependency). Caps node count by
 * area, pauses when off-screen or the tab is hidden, and renders a single static
 * frame under prefers-reduced-motion.
 */
export function ParticleNetwork({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotionSafe();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const c = ctx;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const LINK_DIST = 132;
    const MOUSE_DIST = 175;

    let width = 0;
    let height = 0;
    let nodes: { x: number; y: number; vx: number; vy: number }[] = [];
    let raf = 0;
    let visible = true;
    const mouse = { x: -9999, y: -9999 };

    function build() {
      const rect = canvas!.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(72, Math.max(22, Math.floor((width * height) / 15000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
      }));
    }

    function draw(animate: boolean) {
      c.clearRect(0, 0, width, height);

      // move
      if (animate) {
        for (const n of nodes) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > width) n.vx *= -1;
          if (n.y < 0 || n.y > height) n.vy *= -1;
          n.x = Math.max(0, Math.min(width, n.x));
          n.y = Math.max(0, Math.min(height, n.y));
        }
      }

      // links between nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DIST) {
            const alpha = (1 - dist / LINK_DIST) * 0.22;
            c.strokeStyle = `rgba(255,59,66,${alpha})`;
            c.lineWidth = 1;
            c.beginPath();
            c.moveTo(a.x, a.y);
            c.lineTo(b.x, b.y);
            c.stroke();
          }
        }
      }

      // links to cursor
      for (const n of nodes) {
        const dx = n.x - mouse.x;
        const dy = n.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < MOUSE_DIST) {
          const alpha = (1 - dist / MOUSE_DIST) * 0.4;
          c.strokeStyle = `rgba(255,138,61,${alpha})`;
          c.lineWidth = 1;
          c.beginPath();
          c.moveTo(n.x, n.y);
          c.lineTo(mouse.x, mouse.y);
          c.stroke();
        }
      }

      // nodes
      for (const n of nodes) {
        c.beginPath();
        c.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
        c.fillStyle = "rgba(255,99,104,0.75)";
        c.fill();
      }
    }

    function loop() {
      draw(true);
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (raf) return;
      raf = requestAnimationFrame(loop);
    }
    function stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    build();
    if (reduce) {
      draw(false); // single static frame
    } else {
      start();
    }

    const onResize = () => {
      build();
      if (reduce) draw(false);
    };
    const onMove = (e: PointerEvent) => {
      const rect = canvas!.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else if (!reduce && visible) start();
    };

    // pause when the hero scrolls out of view
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) stop();
        else if (!reduce && !document.hidden) start();
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduce]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
    />
  );
}
