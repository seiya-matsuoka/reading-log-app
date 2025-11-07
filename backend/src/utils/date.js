// JST日付のバリデーションとユーティリティ
// - 形式: YYYY-MM-DD
// - 未来日: 不可（JST基準で本日まで）

// 形式検証
export function isValidDateJstOrEmpty(s) {
  if (s == null || s === '') return true;
  return /^\d{4}-\d{2}-\d{2}$/.test(String(s));
}

// 未来日チェック
export function isNotFutureJst(dateStr) {
  // JST 00:00 として
  const d = new Date(`${dateStr}T00:00:00+09:00`);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  // 現在をJSTローカライズし、日付切り捨て
  const nowJst = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  const todayJst = new Date(nowJst.getFullYear(), nowJst.getMonth(), nowJst.getDate());
  return d.getTime() <= todayJst.getTime();
}

// 正規化：空なら null、指定があれば YYYY-MM-DD のまま返却（事前に形式/未来日チェック済みを前提とする）
export function normalizeDateJstOrNull(s) {
  if (s == null || s === '') return null;
  return String(s);
}
