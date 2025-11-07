const URL_RE = /\bhttps?:\/\/|www\./i;

export function hasLink(str) {
  return typeof str === 'string' && URL_RE.test(str);
}

export function isNonEmptyText(str) {
  return typeof str === 'string' && str.trim().length > 0;
}

export function toPositiveInt(val) {
  const n = Number(val);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// 10桁 or 13桁の数字のみ許可（ハイフン不可）
export function isValidIsbnOrEmpty(s) {
  if (s == null || s === '') return true;
  return /^\d{10}(\d{3})?$/.test(String(s));
}
