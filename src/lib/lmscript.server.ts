const LMSCRIPT_ORIGIN = process.env.LMSCRIPT_ORIGIN || "https://lmscript.xyz";
const LMSCRIPT_API_BASE = `${LMSCRIPT_ORIGIN}/v1`;

export const LMSCRIPT_CACHE_CONTROL = "public, max-age=86400, stale-while-revalidate=86400";
export const LMSCRIPT_CDN_CACHE_CONTROL = "max-age=86400";
export const LMSCRIPT_IMAGE_CACHE_CONTROL = "public, max-age=31536000, immutable";
export const LMSCRIPT_IMAGE_CDN_CACHE_CONTROL = "max-age=31536000";

export function resolveLmscriptUrl(value: string) {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  return new URL(value, LMSCRIPT_ORIGIN).toString();
}

const CORS_PROXY = "https://proxy.killcors.com/?url=";
const PROXY_URL = process.env.PROXY_URL || "http://localhost:3000";

function fetchViaProxy(proxiedUrl: string, extraHeaders?: Record<string, string>) {
  const req = new Request(proxiedUrl);
  if (extraHeaders) {
    for (const [key, value] of Object.entries(extraHeaders)) {
      req.headers.set(key, value);
    }
  }
  return fetch(req);
}

function fetchViaCorsProxy(url: string, extraHeaders?: Record<string, string>) {
  return fetchViaProxy(`${CORS_PROXY}${encodeURIComponent(url)}`, extraHeaders);
}

function fetchViaEnvProxy(url: string, extraHeaders?: Record<string, string>) {
  return fetchViaProxy(`${PROXY_URL}/?destination=${encodeURIComponent(url)}`, extraHeaders);
}

async function fetchLmscriptJsonVia(fetcher: typeof fetchViaCorsProxy, path: string) {
  const response = await fetcher(`${LMSCRIPT_API_BASE}${path}`, {
    accept: "application/json",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch lmscript data: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const fetchLmscriptJson = (path: string) => fetchLmscriptJsonVia(fetchViaCorsProxy, path);
export const fetchLmscriptDetailJson = (path: string) =>
  fetchLmscriptJsonVia(fetchViaEnvProxy, path);

export async function fetchLmscriptText(url: string) {
  const response = await fetchViaEnvProxy(resolveLmscriptUrl(url), {
    accept: "text/vtt,text/plain;q=0.9,*/*;q=0.1",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch subtitle file: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

export async function fetchLmscript(url: string) {
  return fetchViaEnvProxy(resolveLmscriptUrl(url));
}
