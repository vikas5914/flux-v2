import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { withEdgeCache } from "#/lib/edge-cache.server";
import {
  LMSCRIPT_CDN_CACHE_CONTROL,
  fetchLmscriptJson,
  fetchLmscriptText,
  LMSCRIPT_CACHE_CONTROL,
} from "#/lib/lmscript.server";

const searchSchema = z.object({
  movieId: z.coerce.number().int().positive(),
  subtitleId: z.string().min(1),
});

export const Route = createFileRoute("/api/subtitles")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const search = searchSchema.safeParse(Object.fromEntries(url.searchParams));

        if (!search.success) {
          return new Response("Missing subtitle id", { status: 400 });
        }

        return withEdgeCache(request, async () => {
          try {
            const { movieId, subtitleId } = search.data;
            const payload = (await fetchLmscriptJson(
              `/movies/view?expand=streams,subtitles&id=${movieId}`,
            )) as {
              subtitles?: Array<{
                id?: string;
                url?: string;
              }>;
            };

            let subtitleUrl = "";
            const subtitles = payload.subtitles ?? [];

            for (let index = 0; index < subtitles.length; index++) {
              const subtitle = subtitles[index];
              if (!subtitle) {
                continue;
              }

              const currentSubtitleId = String(subtitle.id ?? `${movieId}:${index}`);
              if (currentSubtitleId !== subtitleId) {
                continue;
              }

              subtitleUrl = subtitle.url ?? "";
              break;
            }

            if (!subtitleUrl) {
              return new Response("Subtitle not found", { status: 404 });
            }

            const text = await fetchLmscriptText(subtitleUrl);
            return new Response(text, {
              headers: {
                "Content-Type": "text/vtt; charset=utf-8",
                "Cache-Control": LMSCRIPT_CACHE_CONTROL,
                "CDN-Cache-Control": LMSCRIPT_CDN_CACHE_CONTROL,
              },
            });
          } catch {
            return new Response("Failed to proxy subtitle track", { status: 502 });
          }
        });
      },
    },
  },
});
