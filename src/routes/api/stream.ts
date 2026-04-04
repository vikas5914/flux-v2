import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { withEdgeCache } from "#/lib/edge-cache.server";
import {
  fetchLmscriptJson,
  LMSCRIPT_CACHE_CONTROL,
  LMSCRIPT_CDN_CACHE_CONTROL,
  resolveLmscriptUrl,
} from "#/lib/lmscript.server";

const searchSchema = z.object({
  movieId: z.coerce.number().int().positive(),
  quality: z.string().optional(),
});

// Base64url encode/decode to keep upstream URLs opaque in the browser
function encodeToken(url: string): string {
  return btoa(url).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeToken(token: string): string {
  const padded = token.replace(/-/g, "+").replace(/_/g, "/");
  return atob(padded);
}

function rewriteM3u8(body: string, baseUrl: string, selfOrigin: string): string {
  const base = new URL(baseUrl);
  return body
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return line;
      // Resolve relative URI to absolute, then wrap through our proxy
      const resolved = new URL(trimmed, base).toString();
      return `${selfOrigin}/api/stream-proxy?t=${encodeURIComponent(encodeToken(resolved))}`;
    })
    .join("\n");
}

async function fetchAndProxy(upstreamUrl: string, selfOrigin: string): Promise<Response> {
  const req = new Request(upstreamUrl);
  req.headers.set("Origin", new URL(upstreamUrl).origin);
  const response = await fetch(req);

  if (!response.ok) {
    return new Response("Upstream error", { status: 502 });
  }

  const contentType = response.headers.get("Content-Type") ?? "";
  const isM3u8 =
    contentType.includes("mpegurl") ||
    contentType.includes("x-mpegURL") ||
    upstreamUrl.endsWith(".m3u8");

  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Cache-Control", LMSCRIPT_CACHE_CONTROL);
  headers.set("CDN-Cache-Control", LMSCRIPT_CDN_CACHE_CONTROL);

  if (isM3u8) {
    const text = await response.text();
    const rewritten = rewriteM3u8(text, upstreamUrl, selfOrigin);
    headers.set("Content-Type", "application/vnd.apple.mpegurl");
    return new Response(rewritten, { headers });
  }

  // Pass through segment data (ts, mp4, etc.)
  const upstreamCt = response.headers.get("Content-Type");
  if (upstreamCt) headers.set("Content-Type", upstreamCt);
  return new Response(response.body, { headers });
}

export const Route = createFileRoute("/api/stream")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const search = searchSchema.safeParse(Object.fromEntries(url.searchParams));

        if (!search.success) {
          return new Response("Missing movieId", { status: 400 });
        }

        return withEdgeCache(request, async () => {
          try {
            const { movieId, quality } = search.data;
            const payload = (await fetchLmscriptJson(
              `/movies/view?expand=streams,subtitles&id=${movieId}`,
            )) as {
              streams?: Record<string, string>;
            };
            const streams = payload.streams ?? {};

            // Specific quality requested — proxy that variant directly
            if (quality && streams[quality]) {
              const upstreamUrl = resolveLmscriptUrl(streams[quality]);
              return fetchAndProxy(upstreamUrl, url.origin);
            }

            // Master playlist — list all variants pointing back to this API
            const playlist = Object.keys(streams)
              .map((streamLabel) => {
                const resolution = Number.parseInt(streamLabel, 10);
                const height = Number.isFinite(resolution) ? resolution : 720;
                const width = Math.round((height * 16) / 9);
                const bandwidth = height * 2000;

                return [
                  `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${width}x${height}`,
                  `/api/stream?movieId=${movieId}&quality=${encodeURIComponent(streamLabel)}`,
                ].join("\n");
              })
              .join("\n");

            if (!playlist) {
              return new Response("Stream not found", { status: 404 });
            }

            return new Response(`#EXTM3U\n${playlist}\n`, {
              headers: {
                "Content-Type": "application/vnd.apple.mpegurl",
                "Cache-Control": LMSCRIPT_CACHE_CONTROL,
                "CDN-Cache-Control": LMSCRIPT_CDN_CACHE_CONTROL,
              },
            });
          } catch {
            return new Response("Failed to proxy stream", { status: 502 });
          }
        });
      },
    },
  },
});

export { decodeToken, fetchAndProxy };
