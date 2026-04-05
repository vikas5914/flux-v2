import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, useState } from "react";
import { ContentGrid } from "../components/ContentGrid";
import Header from "../components/Header";
import { HeroSection } from "../components/HeroSection";
import { SectionHeading } from "../components/SectionHeading";
import { SearchResultsSection } from "../components/SearchResultsSection";
import { getHomeSections, searchMovies } from "../lib/lmscript";
import { useDebouncedValue } from "../lib/use-debounced-value";

export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    // Fire-and-forget: don't await so the shell streams immediately
    void context.queryClient.prefetchQuery({
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

function ContentSkeleton() {
  return (
    <div className="mt-16 animate-pulse">
      <div className="mb-4 h-6 w-40 rounded bg-white/10" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[2/3] rounded bg-white/10" />
            <div className="mt-2 h-4 w-3/4 rounded bg-white/10" />
            <div className="mt-1 h-3 w-1/3 rounded bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

function HomePage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const trimmedQuery = debouncedQuery.trim();

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
            <Suspense fallback={<ContentSkeleton />}>
              <FeaturedSections />
            </Suspense>
          )}
        </div>
      </main>
    </div>
  );
}

function FeaturedSections() {
  const { data: sections } = useSuspenseQuery({
    queryKey: ["lmscript", "home"],
    queryFn: () => getHomeSections(),
  });

  return (
    <>
      {sections
        .filter((section) => section.code === "featured_movies")
        .map((section) => (
          <section key={section.id} className="mt-16">
            <SectionHeading title={section.title} />
            <ContentGrid items={section.items} />
          </section>
        ))}
    </>
  );
}
