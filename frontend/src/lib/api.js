const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

function headers() {
  const user = localStorage.getItem('demoUser') || 'demo-1';
  return { 'Content-Type': 'application/json', 'X-Demo-User': user };
}

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.error) {
    throw new Error(json?.message || `HTTP ${res.status}`);
  }
  return json; // { data?, message? }
}

export const api = {
  get: (p) => request('GET', p),
  post: (p, b) => request('POST', p, b),
  patch: (p, b) => request('PATCH', p, b),
  delete: (p, b) => request('DELETE', p, b),
};
