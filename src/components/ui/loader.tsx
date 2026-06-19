"use client";

import { useEffect, useState } from "react";

// ─── BeautifulLoader ────────────────────────────────────────────────────────
// A compact spinner with glow used in tables / inline spots.
export function BeautifulLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6 rounded-3xl bg-black/20 dark:bg-black/45 backdrop-blur-xl border border-white/10 shadow-2xl animate-in fade-in duration-500 max-w-xs">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-md" />
        <svg className="w-full h-full animate-[spin_1s_linear_infinite]" viewBox="0 0 50 50">
          <circle className="text-white/10" cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="4" />
          <circle
            className="text-primary"
            cx="25" cy="25" r="20" fill="none" stroke="currentColor"
            strokeWidth="4" strokeLinecap="round"
            strokeDasharray="125" strokeDashoffset="80"
            style={{ filter: "drop-shadow(0 0 4px var(--primary))" }}
          />
        </svg>
      </div>
      <p className="text-xs font-semibold tracking-wider text-gradient uppercase animate-pulse select-none text-center">
        {text}
      </p>
    </div>
  );
}

// ─── FullPageLoader ──────────────────────────────────────────────────────────
// Covers the entire viewport while the app is booting / session resolving.
export function FullPageLoader() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const id = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 450);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-xl">
      {/* Outer glow ring */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Pulse rings */}
        <span className="absolute inline-flex h-28 w-28 rounded-full bg-primary/20 animate-ping" />
        <span className="absolute inline-flex h-20 w-20 rounded-full bg-primary/30 animate-ping [animation-delay:0.3s]" />

        {/* Spinner */}
        <div className="relative w-24 h-24">
          <svg className="w-full h-full animate-[spin_1.2s_linear_infinite]" viewBox="0 0 100 100">
            {/* Track */}
            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor"
              strokeWidth="6" className="text-primary/10" />
            {/* Arc */}
            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor"
              strokeWidth="6" strokeLinecap="round"
              strokeDasharray="264" strokeDashoffset="180"
              className="text-primary"
              style={{ filter: "drop-shadow(0 0 8px var(--primary))" }}
            />
          </svg>
          {/* Centre icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
        Paryatan VMS
      </h1>
      <p className="text-sm text-muted-foreground font-medium tracking-widest uppercase">
        Loading{dots}
      </p>

      {/* Progress bar */}
      <div className="mt-8 w-48 h-1 rounded-full bg-primary/10 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full"
          style={{
            animation: "indeterminate-progress 1.5s cubic-bezier(0.65,0.05,0.35,0.95) infinite",
          }}
        />
      </div>

      <style>{`
        @keyframes indeterminate-progress {
          0%   { transform: translateX(-100%) scaleX(0.3); }
          40%  { transform: translateX(0%)    scaleX(0.7); }
          70%  { transform: translateX(60%)   scaleX(0.5); }
          100% { transform: translateX(200%)  scaleX(0.3); }
        }
      `}</style>
    </div>
  );
}

// ─── TopProgressBar ──────────────────────────────────────────────────────────
// Slim animated bar at the very top; mount it, and it auto-completes.
export function TopProgressBar({ duration = 800 }: { duration?: number }) {
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Fast start, then slow crawl, then snap to 100 and fade
    const t1 = setTimeout(() => setWidth(60), 50);
    const t2 = setTimeout(() => setWidth(80), 300);
    const t3 = setTimeout(() => setWidth(100), duration - 100);
    const t4 = setTimeout(() => setVisible(false), duration + 200);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [duration]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 z-[99999] h-[3px] bg-primary rounded-r-full transition-all ease-out shadow-[0_0_8px_var(--primary)]"
      style={{ width: `${width}%`, transitionDuration: `${duration / 3}ms` }}
    />
  );
}
