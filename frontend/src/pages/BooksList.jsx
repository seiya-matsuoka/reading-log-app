import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { useMe } from '../providers/meContext.jsx';
import SearchBar from '../components/books/SearchBar.jsx';
import StatsBar from '../components/books/StatsBar.jsx';
import BookCard from '../components/books/BookCard.jsx';
import PageLoading from '../components/common/PageLoading.jsx';
import { jstToday } from '../utils/date.js';
import { MSG } from '../utils/messages.js';

export default function BooksList() {
  const { loading: meLoading } = useMe();

  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');

  const [keyword, setKeyword] = useState('');
  const [state, setState] = useState('reading'); // reading | done | all

  const today = jstToday();
  const [year, month] = today.split('-');
  const [ym, setYm] = useState({ year, month });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const qs = new URLSearchParams();
      if (keyword) qs.set('keyword', keyword);
      if (state && state !== 'all') qs.set('state', state);

      const queryString = qs.toString();
      const url = queryString ? `/api/books?${queryString}` : '/api/books';

      const bookList = await api.get(url);
      setBooks(bookList || []);
    } catch (err) {
      setError(err?.message || MSG.FE.ERR.NETWORK);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [keyword, state]);

  useEffect(() => {
    if (!meLoading) {
      fetchAll();
    }
  }, [meLoading, fetchAll]);

  return (
    <div className="space-y-4">
      <SearchBar
        keyword={keyword}
        onKeywordChange={setKeyword}
        state={state}
        onStateChange={setState}
      />

      <StatsBar ym={ym} onChangeYm={setYm} />

      {loading ? (
        <PageLoading variant="list" />
      ) : error ? (
        <div className="bg-destructive/10 border-destructive/40 text-destructive rounded-(--radius) border p-4 text-sm">
          <p className="mb-1 font-semibold">{MSG.FE.ERR.BOOKLIST}</p>
          <p>{error}</p>
        </div>
      ) : books.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {books.map((b) => (
            <BookCard key={b.id} book={b} onUpdated={fetchAll} />
          ))}
        </div>
      ) : (
        <div className="bg-surface-1 border-border/40 text-muted rounded-(--radius) border p-6 text-center text-sm">
          <p className="text-primary-600 mb-1 text-base font-medium">{MSG.FE.UI.EMPTY.BOOKS}</p>
          <p>{MSG.FE.UI.BOOKLIST.HELP}</p>
        </div>
      )}
    </div>
  );
}
