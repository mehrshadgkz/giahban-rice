// Path: /app/about
// File: StatCounter.tsx
// Version: 1.0.0
//
// A single animated stat (e.g. "+۴۰ سابقه کشاورزی"). Counts up from 0 to
// the real number once it scrolls into view, instead of appearing as a
// static number immediately. Runs only once per page load.

"use client";

import { useEffect, useRef, useState } from "react";

const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

function toPersianDigits(num: number) {
  return String(num)
    .split("")
    .map((ch) => persianDigits[Number(ch)] ?? ch)
    .join("");
}

type StatCounterProps = {
  target: number;
  label: string;
  prefix?: string; // shown before the number, e.g. "٪"
  suffix?: string; // shown after the number, e.g. "+"
};

export default function StatCounter({
  target,
  label,
  prefix = "",
  suffix = "",
}: StatCounterProps) {
  const [value, setValue] = useState(0);
  const hasAnimated = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            const durationMs = 1500;
            const start = performance.now();

            function step(now: number) {
              const progress = Math.min((now - start) / durationMs, 1);
              // Ease-out curve so the count decelerates smoothly at the end
              // rather than stopping abruptly.
              const eased = 1 - Math.pow(1 - progress, 3);
              setValue(Math.round(eased * target));
              if (progress < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref}>
      <p className="text-4xl font-bold">
        {prefix}
        {toPersianDigits(value)}
        {suffix}
      </p>
      <p className="text-sm text-gray-300 mt-2">{label}</p>
    </div>
  );
}