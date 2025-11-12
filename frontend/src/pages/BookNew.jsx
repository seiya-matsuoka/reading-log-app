import { useState } from 'react';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';

export default function BookNew() {
  const [form, setForm] = useState({
    title: '',
    total_pages: '',
    author: '',
    publisher: '',
    isbn: '',
  });

  const onSubmit = (e) => {
    e.preventDefault();
    //  API接続を実装
  };

  return (
    <section className="mx-auto max-w-lg space-y-5">
      <h1 className="text-xl font-semibold">新規書籍</h1>
      <p className="text-muted text-sm">書籍の情報を入力して保存してください。</p>

      <form
        onSubmit={onSubmit}
        className="bg-surface space-y-3 rounded-(--radius) border border-slate-200 p-4 shadow-sm"
      >
        <label className="block text-sm">
          書籍名
          <Input
            className="mt-1"
            placeholder="書籍名"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </label>

        <label className="block text-sm">
          総ページ数
          <Input
            className="mt-1"
            type="number"
            placeholder="例: 320"
            value={form.total_pages}
            onChange={(e) => setForm({ ...form, total_pages: e.target.value })}
          />
        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            著者（任意）
            <Input
              className="mt-1"
              placeholder="著者（任意）"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            出版社（任意）
            <Input
              className="mt-1"
              placeholder="出版社（任意）"
              value={form.publisher}
              onChange={(e) => setForm({ ...form, publisher: e.target.value })}
            />
          </label>
        </div>

        <label className="block text-sm">
          ISBN（任意・ハイフンなし）
          <Input
            className="mt-1"
            placeholder="ISBN（任意・ハイフン無し）"
            value={form.isbn}
            onChange={(e) => setForm({ ...form, isbn: e.target.value })}
          />
        </label>

        <div className="flex items-center gap-3">
          <Button type="submit">保存</Button>
          <Button type="button" variant="ghost">
            キャンセル
          </Button>
        </div>
      </form>
    </section>
  );
}
