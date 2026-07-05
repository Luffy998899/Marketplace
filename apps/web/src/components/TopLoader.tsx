'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

/** Thin lime progress bar on route change — premium app feel. */
export function TopLoader() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    setProgress(0);
    const t1 = requestAnimationFrame(() => setProgress(70));
    const t2 = setTimeout(() => setProgress(100), 280);
    const t3 = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 520);
    return () => {
      cancelAnimationFrame(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed left-0 right-0 top-0 z-[100] h-0.5 bg-border-subtle">
      <div
        className="h-full bg-lime shadow-lime-sm transition-[width] duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
