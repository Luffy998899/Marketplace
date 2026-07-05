import { BENTO_SPAN, getBentoSize } from '@/lib/bento';

export function CardSkeleton({ index = 0 }: { index?: number }) {
  const size = getBentoSize(index);
  return (
    <div
      className={`shimmer h-full min-h-[140px] overflow-hidden rounded-card border border-border bg-surface ${BENTO_SPAN[size]}`}
    />
  );
}

export function GridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="bento-grid">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} index={i} />
      ))}
    </div>
  );
}
