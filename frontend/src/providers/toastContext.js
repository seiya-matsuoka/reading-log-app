// トースト用の Context と、それを使用するためのカスタムフックだけを定義

import { createContext, useContext } from 'react';

// グローバルで共有するトースト表示用のContext
export const ToastContext = createContext(null);

// 任意のコンポーネントからトーストを表示するためのフック
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // ToastProvider 配下以外で呼ばれた場合は例外を投げる
    throw new Error('useToast は ToastProvider 内で使用する必要があります。');
  }
  return ctx;
}
