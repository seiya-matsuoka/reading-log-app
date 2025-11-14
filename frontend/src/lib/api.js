const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// 一番最後のレスポンスで取得した message を保持する
let __lastMessage = null;

function headers() {
  const user = localStorage.getItem('demoUser') || 'demo-1';
  return { 'Content-Type': 'application/json', 'X-Demo-User': user };
}

async function request(method, path, body) {
  // リクエストごとに直前の message を初期化（前回の値が残るのを防止）
  __lastMessage = null;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: headers(),
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    // ネットワーク層での失敗をcatch（オフライン/CORS/接続断など）
    const e = new Error('ネットワークエラーが発生しました。接続を確認してください。');
    e.status = 0;
    e.cause = err;
    throw e;
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    // 例外（204 No Content 等）は握りつぶして null のままとする
  }

  // message がある場合は保持
  __lastMessage = json?.message ?? json?.data?.message ?? null;

  if (!res.ok || json?.error) {
    // 失敗時はバックエンドの文言をそのまま使用
    const e = new Error(__lastMessage || `HTTP ${res.status}`);
    e.status = res.status;
    e.payload = json;
    throw e;
  }

  // dataのみを返す
  return json?.data ?? null;
}

export const api = {
  get: (p) => request('GET', p),
  post: (p, b) => request('POST', p, b),
  patch: (p, b) => request('PATCH', p, b),
  delete: (p, b) => request('DELETE', p, b),
  getLastMessage() {
    return __lastMessage;
  },
};
