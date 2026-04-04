import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { withEdgeCache } from "#/lib/edge-cache.server";
import { decodeToken, fetchAndProxy } from "./stream";

const searchSchema = z.object({
  t: z.string().min(1),
});

export const Route = createFileRoute("/api/stream-proxy")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const search = searchSchema.safeParse(Object.fromEntries(url.searchParams));

        if (!search.success) {
          return new Response("Missing token", { status: 400 });
        }

        return withEdgeCache(request, async () => {
          try {
            const upstreamUrl = decodeToken(search.data.t);
            return fetchAndProxy(upstreamUrl, url.origin);
          } catch {
            return new Response("Failed to proxy stream", { status: 502 });
          }
        });
      },
    },
  },
});
