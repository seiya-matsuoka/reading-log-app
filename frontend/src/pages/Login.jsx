import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMe } from '../providers/meContext.jsx';
import Select from '../components/common/Select.jsx';
import Button from '../components/common/Button.jsx';
import { MSG } from '../utils/messages.js';

const OPTIONS = [
  { label: 'デモユーザ1（編集可）', value: 'demo-1' },
  { label: 'デモユーザ2（編集可）', value: 'demo-2' },
  { label: 'デモユーザ3（編集可）', value: 'demo-3' },
  { label: '閲覧用デモユーザ（読み取り専用）', value: 'demo-readonly' },
];

export default function Login() {
  const { loginAs } = useMe();
  const nav = useNavigate();
  const [user, setUser] = useState(localStorage.getItem('demoUser') || 'demo-1');
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await loginAs(user);
      nav('/books');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="bg-surface border-border/40 rounded-(--radius) border p-6 shadow-sm">
        <h1 className="mb-3 text-lg font-semibold">ログイン（デモ）</h1>

        {/* 説明文 */}
        <p className="text-muted mb-1 text-sm">{MSG.FE.UI.LOGIN.HELP}</p>
        <p className="text-muted mb-1 text-xs">{MSG.FE.UI.DEMO.NOTICE}</p>
        <p className="text-muted mb-4 text-xs">{MSG.FE.UI.NOTE.LINK_NOTICE}</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-user" className="mb-1 block text-sm">
              ユーザー
            </label>
            <Select
              id="login-user"
              value={user}
              disabled={saving}
              onChange={(e) => setUser(e.target.value)}
            >
              {OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="text-center">
            <Button type="submit" disabled={saving} loading={saving} className="min-w-[120px]">
              ログイン
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
