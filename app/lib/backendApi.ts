/**
 * Shieldo backend (warranty + contact) client helpers.
 *
 * The base URL is the theme setting `warranty_api_url` (set per store in the Salla
 * dashboard). `VITE_SHIELDO_API_URL` is a local-dev fallback only: `.env` is gitignored, so it
 * never reaches a Salla build. Never put secrets here, everything in a theme is public.
 */
export function getApiBase(settings: unknown): string | undefined {
  const fromSettings = (settings as { warranty_api_url?: string } | undefined)?.warranty_api_url;
  // In dev, `.env` wins over twilight.preview.json so a local backend can be tested without editing it.
  const fromEnv = import.meta.env.DEV ? import.meta.env.VITE_SHIELDO_API_URL : '';
  const base = (fromEnv?.trim() || fromSettings?.trim() || '').replace(/\/+$/, '');
  if (!base) return undefined;
  // Production must be HTTPS; plain http is allowed for localhost only.
  const ok = base.startsWith('https://') || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/.test(base);
  return ok ? base : undefined;
}

/** POST JSON with a timeout. Resolves with the HTTP status for any response; throws on network error/timeout. */
export async function postJson<T = unknown>(
  base: string,
  path: string,
  body: unknown,
  timeoutMs = 10000
): Promise<{ status: number; data: T | null }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${base}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    const json = await res.json().catch(() => null);
    return { status: res.status, data: (json?.data ?? json) as T | null };
  } finally {
    clearTimeout(timer);
  }
}
