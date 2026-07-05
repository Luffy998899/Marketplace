export function CardSkeleton() {
  return (
    <div className="card-surface shimmer aspect-[3/4] w-full overflow-hidden rounded-2xl bg-ink-800/60" />
  );
}

export function GridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
