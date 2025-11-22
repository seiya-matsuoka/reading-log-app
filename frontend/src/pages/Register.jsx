import { MSG } from '../utils/messages.js';

export default function Register() {
  return (
    <div className="mx-auto max-w-md">
      <div className="bg-surface border-border/40 rounded-(--radius) border p-6 shadow-sm">
        <h1 className="mb-3 text-lg font-semibold">ユーザー登録（デモ）</h1>
        <p className="text-muted mb-4 text-sm">{MSG.FE.UI.REGISTER.HELP}</p>
      </div>
    </div>
  );
}
