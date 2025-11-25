import { Link } from 'react-router-dom';
import Button from '../components/common/Button.jsx';
import { MSG } from '../utils/messages.js';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="mb-2 text-2xl font-semibold">ページが見つかりません。</h1>
        <p className="text-muted mb-4 text-sm">{MSG.FE.UI.NOT_FOUND.HELP}</p>
        <div className="flex justify-center">
          <Link to="/books">
            <Button type="button">書籍一覧へ戻る</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
