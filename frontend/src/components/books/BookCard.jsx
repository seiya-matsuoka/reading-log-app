import { Link } from 'react-router-dom';
import QuickUpdateForm from './QuickUpdateForm.jsx';
import { formatYmd } from '../../utils/date.js';

export default function BookCard({ book, onUpdated }) {
  const total = Number(book.total_pages) || 0;
  const read = Number(book.pages_read) || 0;

  // total_pages が 0 / null の場合でも NaN にならないよう 0% でガード
  const progress = total > 0 ? Math.min(100, Math.round((read / total) * 100)) : 0;

  const updatedLabel = book.updated_at ? formatYmd(book.updated_at) : '';

  return (
    <article className="bg-surface border-border/40 flex flex-col gap-3 rounded-(--radius) border p-4 shadow-sm">
      {/* ヘッダー（タイトル・著者・更新日時） */}
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to={`/books/${book.id}`}
            className="block truncate text-sm font-semibold hover:underline"
            title={book.title}
          >
            {book.title}
          </Link>

          {book.author && (
            <div className="text-muted mt-0.5 truncate text-xs" title={book.author}>
              {book.author}
            </div>
          )}
        </div>

        {updatedLabel && (
          <div className="text-muted text-right text-[11px] leading-tight">
            <div>最終更新</div>
            <div>{updatedLabel}</div>
          </div>
        )}
      </header>

      {/* 進捗バー */}
      <div>
        <div className="bg-surface-2 h-2 overflow-hidden rounded-full">
          <div
            className="bg-primary-500 h-full transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-muted mt-1 flex items-center justify-between text-xs">
          <span>
            {read}/{total} ページ（{progress}%）
          </span>
          <span>累計 {book.minutes_total ?? 0} 分</span>
        </div>
      </div>

      {/* クイック更新フォーム */}
      <QuickUpdateForm bookId={book.id} totalPages={total} onSaved={onUpdated} />
    </article>
  );
}
