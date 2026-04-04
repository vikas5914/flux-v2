import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { withEdgeCache } from "#/lib/edge-cache.server";
import {
  fetchLmscript,
  LMSCRIPT_IMAGE_CACHE_CONTROL,
  LMSCRIPT_IMAGE_CDN_CACHE_CONTROL,
} from "#/lib/lmscript.server";

const searchSchema = z.object({
  path: z.string().min(1),
});

export const Route = createFileRoute("/api/image")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const search = searchSchema.safeParse(Object.fromEntries(url.searchParams));

        if (!search.success) {
          return new Response("Missing image path", { status: 400 });
        }

        return withEdgeCache(request, async () => {
          try {
            const upstream = await fetchLmscript(search.data.path);

            if (!upstream.ok) {
              return new Response(
                `Failed to fetch image: ${upstream.status} ${upstream.statusText}`,
                { status: 502 },
              );
            }

            const headers = new Headers();
            const contentType = upstream.headers.get("Content-Type");

            if (contentType) {
              headers.set("Content-Type", contentType);
            }

            headers.set("Cache-Control", LMSCRIPT_IMAGE_CACHE_CONTROL);
            headers.set("CDN-Cache-Control", LMSCRIPT_IMAGE_CDN_CACHE_CONTROL);

            return new Response(upstream.body, { headers });
          } catch {
            return new Response("Failed to proxy image", { status: 502 });
          }
        });
      },
    },
  },
});
