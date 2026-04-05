import crypto from "crypto";

const PROXY_URL = process.env.PROXY_URL || "http://localhost:3000";
const LMSCRIPT_ORIGIN = process.env.LMSCRIPT_ORIGIN || "https://lmscript.xyz";

const key = crypto.createHash("sha256").update(process.env.URL_ENCRYPTION_KEY!).digest();
const iv = crypto.createHash("sha256").update(key).digest().subarray(0, 16);

function encryptUrl(url: string): string {
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  return Buffer.concat([cipher.update(url, "utf8"), cipher.final()]).toString("base64url");
}

export function buildStreamProxyUrl(upstreamUrl: string): string {
  const encrypted = encryptUrl(upstreamUrl);
  return `${PROXY_URL}/m3u8-proxy?url=${encodeURIComponent(encrypted)}`;
}

export function buildImageProxyUrl(upstreamUrl: string): string {
  const encrypted = encryptUrl(upstreamUrl);
  const headers = encodeURIComponent(
    JSON.stringify({ Origin: LMSCRIPT_ORIGIN, Referer: LMSCRIPT_ORIGIN }),
  );
  return `${PROXY_URL}/image-proxy?url=${encodeURIComponent(encrypted)}&headers=${headers}`;
}
