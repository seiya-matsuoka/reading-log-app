export default function SkeletonCard({ variant = 'list' }) {
  if (variant === 'detail') {
    // 詳細画面（情報量の多いカードをイメージ）
    return (
      <div className="skeleton-card bg-surface border-border/40 rounded-(--radius) border p-4 shadow-sm">
        <div className="bg-primary-50 h-4 w-3/4 animate-pulse rounded-(--radius)" />
        <div className="bg-primary-50 mt-3 h-3 w-1/2 animate-pulse rounded-(--radius)" />
        <div className="bg-primary-50 mt-2 h-3 w-1/3 animate-pulse rounded-(--radius)" />
        <div className="bg-primary-50 mt-4 h-2 w-full animate-pulse rounded-full" />
        <div className="bg-primary-50 mt-2 h-3 w-2/3 animate-pulse rounded-(--radius)" />
      </div>
    );
  }

  // 一覧画面（タイトル・メタ情報・進捗バーをイメージ）
  return (
    <div className="skeleton-card bg-surface border-border/40 rounded-(--radius) border p-4 shadow-sm">
      <div className="bg-primary-50 h-4 w-2/3 animate-pulse rounded-(--radius)" />
      <div className="bg-primary-50 mt-3 h-3 w-1/2 animate-pulse rounded-(--radius)" />
      <div className="bg-primary-50 mt-5 h-2 w-full animate-pulse rounded-full" />
      <div className="bg-primary-50 mt-2 h-3 w-1/3 animate-pulse rounded-(--radius)" />
    </div>
  );
}
