import { CompactEncrypt } from "jose";

const PROXY_URL = process.env.PROXY_URL || "http://localhost:3000";

let secretKeyPromise: Promise<Uint8Array> | null = null;

function getSecretKey(): Promise<Uint8Array> {
  if (!secretKeyPromise) {
    secretKeyPromise = crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(process.env.URL_ENCRYPTION_KEY!))
      .then((buf) => new Uint8Array(buf));
  }
  return secretKeyPromise;
}

export async function encryptUrl(url: string): Promise<string> {
  const secret = await getSecretKey();
  return new CompactEncrypt(new TextEncoder().encode(url))
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .encrypt(secret);
}

export async function buildStreamProxyUrl(upstreamUrl: string): Promise<string> {
  const encrypted = await encryptUrl(upstreamUrl);
  return `${PROXY_URL}/m3u8-proxy?url=${encodeURIComponent(encrypted)}`;
}
