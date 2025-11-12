// Unicode正規化 + ゼロ幅除去 + URL検出

const ZERO_WIDTH = /[\u200B-\u200D\uFEFF]/g;
const LINK_RE = /(https?:\/\/|ftp:\/\/|www\.)/i;

export function nfkc(s) {
  return (s ?? '').toString().normalize('NFKC');
}

export function stripZeroWidth(s) {
  return (s ?? '').toString().replace(ZERO_WIDTH, '');
}

export function hasLink(s) {
  return LINK_RE.test((s ?? '').toString());
}

export function sanitizeInput(s) {
  return stripZeroWidth(nfkc(s));
}
