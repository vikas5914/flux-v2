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

/**
 * Fetch from an upstream URL, spoofing the Origin header so the remote host
 * treats the request as same-origin (same technique as the standalone CORS
 * reverse-proxy worker).
 */
function fetchUpstream(url: string, extraHeaders?: Record<string, string>) {
  const req = new Request(url);
  req.headers.set("Origin", new URL(url).origin);
  if (extraHeaders) {
    for (const [key, value] of Object.entries(extraHeaders)) {
      req.headers.set(key, value);
    }
  }
  return fetch(req);
}

export async function fetchLmscriptJson(path: string) {
  const response = await fetchUpstream(`${LMSCRIPT_API_BASE}${path}`, {
    accept: "application/json",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch lmscript data: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function fetchLmscriptText(url: string) {
  const response = await fetchUpstream(resolveLmscriptUrl(url), {
    accept: "text/vtt,text/plain;q=0.9,*/*;q=0.1",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch subtitle file: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

export async function fetchLmscript(url: string) {
  return fetchUpstream(resolveLmscriptUrl(url));
}
