import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ContentGrid } from "../components/ContentGrid";
import Header from "../components/Header";
import { HeroSection } from "../components/HeroSection";
import { SectionHeading } from "../components/SectionHeading";
import { SearchResultsSection } from "../components/SearchResultsSection";
import { getHomeSections, searchMovies } from "../lib/lmscript";
import { useDebouncedValue } from "../lib/use-debounced-value";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["lmscript", "home"],
      queryFn: () => getHomeSections(),
    });
  },
  component: HomePage,
  errorComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
      <Header />
      <p className="text-sm text-[#a1a1aa]">Failed to load content. Please try again later.</p>
    </div>
  ),
});

function HomePage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const trimmedQuery = debouncedQuery.trim();

  const { data: sections } = useSuspenseQuery({
    queryKey: ["lmscript", "home"],
    queryFn: () => getHomeSections(),
  });

  const { data: searchResponse, isFetching: isSearchLoading } = useQuery({
    queryKey: ["lmscript", "search", trimmedQuery],
    queryFn: () => searchMovies({ data: { query: trimmedQuery, sort: "-year" } }),
    enabled: trimmedQuery.length > 0,
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />

      <main className="pt-14">
        <HeroSection query={query} onQueryChange={setQuery} isSearchLoading={isSearchLoading} />

        <div className="mx-auto max-w-6xl px-6 pb-16 sm:pb-32">
          {trimmedQuery ? (
            <SearchResultsSection
              results={searchResponse?.items ?? []}
              isLoading={isSearchLoading}
            />
          ) : (
            sections
              .filter((section) => section.code === "featured_movies")
              .map((section) => (
                <section key={section.id} className="mt-16">
                  <SectionHeading title={section.title} />
                  <ContentGrid items={section.items} />
                </section>
              ))
          )}
        </div>
      </main>
    </div>
  );
}
