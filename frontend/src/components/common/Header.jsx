import { NavLink, Link } from 'react-router-dom';
import { useMe } from '../../providers/meContext.jsx';

const linkBase = 'px-3 py-2 rounded-(--radius) text-sm font-medium transition hover:bg-surface-2';
const linkActive = 'bg-surface-3 text-primary-600';

export default function Header() {
  const { me } = useMe();

  const linkCls = ({ isActive }) => `${linkBase} ${isActive ? linkActive : 'text-muted'}`;

  return (
    <header className="bg-surface border-border/50 border-b">
      <div className="container mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link to="/books" className="text-text font-semibold">
          Reading Log App
        </Link>
        <nav className="flex items-center gap-2">
          <NavLink to="/books" end className={linkCls}>
            一覧
          </NavLink>
          <NavLink to="/books/new" className={linkCls}>
            新規書籍
          </NavLink>
          <NavLink to="/login" className={linkCls}>
            ログイン
          </NavLink>
          <NavLink to="/register" className={linkCls}>
            ユーザー登録
          </NavLink>
          <div className="text-muted text-xs">{me ? `現在のユーザー：${me.name}` : '読込中…'}</div>
        </nav>
      </div>
    </header>
  );
}
