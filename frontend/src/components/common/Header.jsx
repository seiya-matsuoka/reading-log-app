import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const users = ['demo-1', 'demo-2', 'demo-3', 'demo-readonly'];

export default function Header() {
  const location = useLocation();
  const [user, setUser] = useState(localStorage.getItem('demoUser') || 'demo-1');

  useEffect(() => {
    localStorage.setItem('demoUser', user);
  }, [user]);

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/books" className="font-semibold">
          Reading Log App
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            to="/books"
            className={`text-sm ${location.pathname.startsWith('/books') ? 'font-semibold' : ''}`}
          >
            一覧
          </Link>

          <select
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className="ml-4 rounded border px-2 py-1 text-sm"
            title="デモユーザー切替"
          >
            {users.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </nav>
      </div>
    </header>
  );
}
