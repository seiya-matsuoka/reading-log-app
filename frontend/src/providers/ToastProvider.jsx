import { useCallback, useState } from 'react';
import { ToastContext } from './toastContext.js';

// グローバルトーストを提供する Provider コンポーネント。
// アプリ全体をラップし、useToast() で showToast({ type, message }) を呼べるようにする。
export function ToastProvider({ children }) {
  // 画面に表示中のトースト配列
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(({ type = 'success', message }) => {
    if (!message) return;

    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);

    // 一定時間後に自動で閉じる
    const timeout = type === 'error' ? 5000 : 3000;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, timeout);
  }, []);

  const value = { showToast };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* 画面に重ねて表示するトースト */}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:justify-end">
        <div className="space-y-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={[
                'pointer-events-auto max-w-md rounded-(--radius) border px-3 py-2 text-sm shadow-sm',
                t.type === 'error'
                  ? 'border-danger-100 bg-danger-50 text-danger-600'
                  : 'border-primary-100 bg-primary-50 text-primary-600',
              ].join(' ')}
            >
              {t.message}
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
