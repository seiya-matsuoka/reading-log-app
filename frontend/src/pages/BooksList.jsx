import SkeletonCard from '../components/common/SkeletonCard.jsx';

export default function BooksList() {
  return (
    <div className="space-y-3">
      <div className="text-muted text-sm">（一覧・検索バー・統計バー）</div>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
