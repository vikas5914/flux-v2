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
});

export const Route = createFileRoute("/api/stream")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const search = searchSchema.safeParse(Object.fromEntries(url.searchParams));

        if (!search.success) {
          return new Response("Missing stream id", { status: 400 });
        }

        return withEdgeCache(request, async () => {
          try {
            const { movieId } = search.data;
            const payload = (await fetchLmscriptJson(
              `/movies/view?expand=streams,subtitles&id=${movieId}`,
            )) as {
              streams?: Record<string, string>;
            };
            const streams = payload.streams ?? {};

            const playlist = Object.keys(streams)
              .map((streamLabel) => {
                const resolution = Number.parseInt(streamLabel, 10);
                const height = Number.isFinite(resolution) ? resolution : 720;
                const width = Math.round((height * 16) / 9);
                const bandwidth = height * 2000;

                return [
                  `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${width}x${height}`,
                  resolveLmscriptUrl(streams[streamLabel]),
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
