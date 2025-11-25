import { NavLink, Link } from 'react-router-dom';
import { useMe } from '../../providers/meContext.jsx';

const linkBase =
  'whitespace-nowrap px-3 py-2 rounded-(--radius) text-sm font-medium transition hover:bg-surface-2';
const linkActive = 'bg-surface-3 text-primary-600';

export default function Header() {
  const { me } = useMe();

  const linkCls = ({ isActive }) => `${linkBase} ${isActive ? linkActive : 'text-muted'}`;

  const currentUserText = me ? `現在のユーザー：${me.name}` : '現在のユーザー：未選択';

  return (
    <header className="bg-surface border-border/50 border-b">
      <div className="container mx-auto max-w-5xl px-4 py-2 md:py-0">
        {/* PC幅（md 以上）： 左にアプリ名 / 右にタブ＋ユーザー情報
            モバイル幅： 上段にアプリ名＋ユーザー情報 / 下段に横スクロールタブ */}
        <div className="flex flex-col gap-2 md:h-14 md:flex-row md:items-center md:justify-between md:gap-4">
          {/* モバイル幅の場合：上段となりアプリ名＋ユーザー情報 */}
          <div className="flex items-center justify-between">
            <Link to="/books" className="text-text font-semibold">
              Reading Log App
            </Link>

            {/* ユーザー情報（モバイル幅のみ表示） */}
            <div className="text-muted ml-3 text-xs md:hidden">{currentUserText}</div>
          </div>

          {/* モバイル幅の場合：下段となり横スクロールタブ */}
          <div className="flex items-center gap-2">
            <div className="-mx-4 flex-1 overflow-x-auto px-4 md:mx-0 md:overflow-visible md:px-0">
              <nav className="flex gap-2">
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
              </nav>
            </div>

            {/* ユーザー情報（PC幅（md 以上）のみ表示） */}
            <div className="text-muted hidden text-xs md:block">{currentUserText}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
