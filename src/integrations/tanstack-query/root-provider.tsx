import { QueryClient } from "@tanstack/react-query";

export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 86400000,
        gcTime: 86400000,
      },
    },
  });

  return {
    queryClient,
  };
}
