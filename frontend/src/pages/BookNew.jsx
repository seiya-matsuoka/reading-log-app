import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useMe } from '../providers/meContext.jsx';
import BookForm from '../components/books/BookForm.jsx';
import { useToast } from '../providers/toastContext.js';

export default function BookNew() {
  const nav = useNavigate();
  const { isReadOnly } = useMe();
  const { showToast } = useToast();

  async function handleCreate(values) {
    // values： { title, total_pages, author, publisher, isbn }
    await api.post('/api/books', values);

    const msg = api.getLastMessage();
    if (msg) {
      showToast({ type: 'success', message: msg });
    }

    nav('/books');
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="bg-surface border-border/40 rounded-(--radius) border p-6 shadow-sm">
        <h1 className="mb-4 text-lg font-semibold">新規書籍登録</h1>
        <BookForm
          mode="create"
          initialValues={{
            title: '',
            totalPages: '',
            author: '',
            publisher: '',
            isbn: '',
          }}
          onSubmit={handleCreate}
          onCancel={() => nav('/books')}
          isReadOnly={isReadOnly}
        />
      </div>
    </div>
  );
}
