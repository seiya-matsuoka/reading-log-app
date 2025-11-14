export default function SkeletonCard() {
  return (
    <div className="bg-surface border-border/40 rounded-(--radius) border p-4 shadow-sm">
      <div className="bg-primary-50 h-4 w-1/2 animate-pulse rounded-(--radius)" />
      <div className="bg-primary-50 mt-3 h-3 w-2/3 animate-pulse rounded-(--radius)" />
      <div className="bg-primary-50 mt-5 h-3 w-1/4 animate-pulse rounded-(--radius)" />
    </div>
  );
}
