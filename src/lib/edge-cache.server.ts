export async function withEdgeCache(
  request: Request,
  handler: () => Promise<Response>,
): Promise<Response> {
  if (typeof caches === "undefined") {
    return handler();
  }

  const cache = caches.default;

  try {
    const cached = await cache.match(request);
    if (cached) return cached;
  } catch {
    // Cache read failed — fall through to handler
  }

  const response = await handler();

  if (response.status === 200) {
    try {
      cache.put(request, response.clone());
    } catch {
      // Cache write failed — ignore
    }
  }

  return response;
}
