import { NavLink, Link } from 'react-router-dom';
import { useMe } from '../../providers/meContext.jsx';

export default function Header() {
  const { me } = useMe();
  const linkCls = (active) =>
    `text-sm transition-colors hover:opacity-80 ${active ? 'font-semibold' : ''}`;

  return (
    <header className="bg-surface/95 border-b border-slate-200 backdrop-blur">
      <div className="container mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/books" className="text-text font-semibold">
          Reading Log App
        </Link>
        <nav className="flex items-center gap-4">
          <NavLink to="/books" end className={({ isActive }) => linkCls(isActive)}>
            一覧
          </NavLink>
          <NavLink to="/books/new" className={({ isActive }) => linkCls(isActive)}>
            新規書籍
          </NavLink>
          <NavLink to="/login" className={({ isActive }) => linkCls(isActive)}>
            ログイン
          </NavLink>
          <NavLink to="/register" className={({ isActive }) => linkCls(isActive)}>
            ユーザー登録
          </NavLink>
          <span className="text-muted ml-2 text-xs">{me ? me.name : '...'}</span>
        </nav>
      </div>
    </header>
  );
}
