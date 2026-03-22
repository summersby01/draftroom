export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-36 animate-pulse rounded-2xl bg-surface/80" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-40 animate-pulse rounded-2xl bg-surface/80" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-64 animate-pulse rounded-2xl bg-surface/80" />
        ))}
      </div>
    </div>
  );
}
