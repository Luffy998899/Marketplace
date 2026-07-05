'use client';

import { useEffect, useRef, useState } from 'react';
import { useFinePointer } from '@/lib/useMediaQuery';

/** Lime ring + dot cursor — desktop only; disabled on touch devices. */
export function CustomCursor() {
  const finePointer = useFinePointer();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });
  const hovering = useRef(false);
  const clicking = useRef(false);
  const [, tick] = useState(0);

  useEffect(() => {
    if (!finePointer) return;

    document.documentElement.classList.add('custom-cursor-active');

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };

    const onDown = () => {
      clicking.current = true;
      tick((n) => n + 1);
    };

    const onUp = () => {
      clicking.current = false;
      tick((n) => n + 1);
    };

    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      hovering.current = !!el?.closest(
        'a, button, [role="button"], input, select, textarea, label, summary, .cursor-hover',
      );
    };

    let raf = 0;
    const animate = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.18;
      pos.current.y += (target.current.y - pos.current.y) * 0.18;

      const scale = clicking.current ? 0.85 : hovering.current ? 1.55 : 1;
      const ring = ringRef.current;
      const dot = dotRef.current;

      if (ring) {
        ring.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%) scale(${scale})`;
      }
      if (dot) {
        dot.style.transform = `translate3d(${target.current.x}px, ${target.current.y}px, 0) translate(-50%, -50%) scale(${clicking.current ? 0.6 : 1})`;
      }

      raf = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    document.addEventListener('mouseover', onOver, { passive: true });
    raf = requestAnimationFrame(animate);

    return () => {
      document.documentElement.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseover', onOver);
      cancelAnimationFrame(raf);
    };
  }, [finePointer]);

  if (!finePointer) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]" aria-hidden>
      <div
        ref={ringRef}
        className="absolute left-0 top-0 h-8 w-8 rounded-full border border-lime/70 transition-[border-color] duration-200 will-change-transform"
        style={{ transform: 'translate3d(-100px, -100px, 0) translate(-50%, -50%)' }}
      />
      <div
        ref={dotRef}
        className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-lime shadow-lime-sm will-change-transform"
        style={{ transform: 'translate3d(-100px, -100px, 0) translate(-50%, -50%)' }}
      />
    </div>
  );
}
