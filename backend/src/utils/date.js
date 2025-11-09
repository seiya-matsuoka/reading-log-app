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

// JSTの「本日」の Date オブジェクト（時分秒は 00:00:00）。
export function jstToday() {
  const now = new Date();
  const s = now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' });
  const d = new Date(s);
  // 00:00:00 に正規化
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// 指定年月の暦日数を返す（西暦）。
export function daysInMonth(year, month) {
  // 1月を 0 として扱うため、翌月の0日で指定月の最終日を取得する
  return new Date(year, month, 0).getDate();
}
