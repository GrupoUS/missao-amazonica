import { useEffect, useRef, useState } from 'react';

interface Props {
  value: number;
  format?: (n: number) => string;
  durationMs?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

const defaultFormatter = new Intl.NumberFormat('pt-BR');

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

export default function AnimatedNumber({
  value,
  format,
  durationMs = 1200,
  prefix,
  suffix,
  className,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setDisplay(value);
      return;
    }

    let rafId = 0;
    let started = false;

    const animate = (start: number, target: number) => {
      const startTime = performance.now();
      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        setDisplay(Math.round(start + (target - start) * easeOutCubic(progress)));
        if (progress < 1) {
          rafId = requestAnimationFrame(tick);
        }
      };
      rafId = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started) {
            started = true;
            animate(0, value);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [value, durationMs]);

  const formatter = format ?? ((n: number) => defaultFormatter.format(n));

  return (
    <span ref={ref} className={`tabular-nums ${className ?? ''}`} aria-live="polite">
      {prefix}
      {formatter(display)}
      {suffix}
    </span>
  );
}
