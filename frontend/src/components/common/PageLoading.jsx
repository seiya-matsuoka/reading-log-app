import { useEffect, useMemo, useState } from 'react';
import SkeletonCard from './SkeletonCard.jsx';
import Spinner from './Spinner.jsx';
import { MSG } from '../../utils/messages.js';

export default function PageLoading({ variant = 'list', slowThresholdMs = 5000 }) {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setSlow(true);
    }, slowThresholdMs);

    return () => {
      clearTimeout(timerId);
    };
  }, [slowThresholdMs]);

  const skeletons = useMemo(() => {
    if (variant === 'detail') {
      // 詳細画面：上段 2カード（情報/進捗）、下段 2カード（メモ/ログ）のイメージ
      return new Array(4).fill(0);
    }
    // 一覧画面：2カラム x 3行 = 6カードのイメージ
    return new Array(6).fill(0);
  }, [variant]);

  const gridClass =
    variant === 'detail' ? 'grid gap-4 md:grid-cols-2' : 'grid grid-cols-1 gap-4 sm:grid-cols-2';

  return (
    <div className="space-y-4">
      {slow && (
        <div className="bg-surface-1 border-border/40 text-muted flex items-start gap-3 rounded-(--radius) border p-3 text-xs sm:text-sm">
          <Spinner className="text-primary-600 mt-0.5 size-5" />
          <div className="space-y-1">
            <p className="text-primary text-sm font-medium">{MSG.FE.UI.LOADING.SLOW_BOOT_TITLE}</p>
            <p>{MSG.FE.UI.LOADING.SLOW_BOOT_DETAIL}</p>
          </div>
        </div>
      )}

      <p className="text-muted text-sm">{MSG.FE.UI.LOADING.DEFAULT}</p>

      <div className={gridClass}>
        {skeletons.map((_, index) => (
          <SkeletonCard key={index} variant={variant === 'detail' ? 'detail' : 'list'} />
        ))}
      </div>
    </div>
  );
}
