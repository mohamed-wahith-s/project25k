export function getApiBase() {
  const raw = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  // Support both absolute (http://...) and relative (/api) bases.
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw.replace(/\/$/, '');
  const base = new URL(window.location.origin);
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return new URL(path.replace(/\/$/, ''), base).toString();
}

export function joinApi(base, path) {
  // IMPORTANT: don't use a leading "/" here, or URL() will reset the base path
  // (e.g. base "http://x/api" + "/colleges" => "http://x/colleges" which drops "/api").
  const p = path.startsWith('/') ? path.slice(1) : path;
  return new URL(p, base.endsWith('/') ? base : `${base}/`).toString();
}

