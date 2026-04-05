import { CompactEncrypt } from "jose";

const PROXY_URL = process.env.PROXY_URL || "http://localhost:3000";
const LMSCRIPT_ORIGIN = process.env.LMSCRIPT_ORIGIN || "https://lmscript.xyz";

let secretKeyPromise: Promise<Uint8Array> | null = null;

function getSecretKey(): Promise<Uint8Array> {
  if (!secretKeyPromise) {
    secretKeyPromise = crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(process.env.URL_ENCRYPTION_KEY!))
      .then((buf) => new Uint8Array(buf));
  }
  return secretKeyPromise;
}

async function encryptUrl(url: string): Promise<string> {
  const secret = await getSecretKey();
  return new CompactEncrypt(new TextEncoder().encode(url))
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .encrypt(secret);
}

export async function buildStreamProxyUrl(upstreamUrl: string): Promise<string> {
  const encrypted = await encryptUrl(upstreamUrl);
  return `${PROXY_URL}/m3u8-proxy?url=${encodeURIComponent(encrypted)}`;
}

export async function buildImageProxyUrl(upstreamUrl: string): Promise<string> {
  const encrypted = await encryptUrl(upstreamUrl);
  const headers = encodeURIComponent(
    JSON.stringify({ Origin: LMSCRIPT_ORIGIN, Referer: LMSCRIPT_ORIGIN }),
  );
  return `${PROXY_URL}/image-proxy?url=${encodeURIComponent(encrypted)}&headers=${headers}`;
}
