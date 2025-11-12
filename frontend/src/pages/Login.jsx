import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button.jsx';
import Select from '../components/common/Select.jsx';
import { useMe } from '../providers/meContext.jsx';

const USERS = ['demo-1', 'demo-2', 'demo-3', 'demo-readonly'];

export default function Login() {
  const { loginAs, me, loading } = useMe();
  const [user, setUser] = useState(localStorage.getItem('demoUser') || 'demo-1');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    await loginAs(user);
    navigate('/books');
  };

  return (
    <section className="mx-auto max-w-lg space-y-5">
      <h1 className="text-xl font-semibold">ログイン</h1>
      <p className="text-muted text-sm">
        デモアプリのため通常の認証は行いません。以下のプルダウンで「デモユーザー」を選択して
        <span className="font-medium">ログイン（ユーザー切り替え）</span>してください。
      </p>

      <form
        onSubmit={onSubmit}
        className="bg-surface space-y-3 rounded-(--radius) border border-slate-200 p-4 shadow-sm"
      >
        <label className="block text-sm">
          デモユーザー
          <Select className="mt-1" value={user} onChange={(e) => setUser(e.target.value)}>
            {USERS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </Select>
        </label>

        <div className="flex items-center gap-3">
          <Button type="submit">ログイン</Button>
          <span className="text-muted text-xs">現在: {loading ? '...' : me?.name || '未取得'}</span>
        </div>
      </form>

      <p className="text-muted text-xs">
        ※ <code>demo-readonly</code> は読み取り専用のため、書き込み操作は不可になります。
      </p>
    </section>
  );
}
