import type { MovieCard } from "../lib/lmscript";
import { ContentGrid } from "./ContentGrid";
import { EmptyState } from "./EmptyState";
import { SectionHeading } from "./SectionHeading";
import { Spinner } from "./Spinner";

interface SearchResultsSectionProps {
  results: MovieCard[];
  isLoading: boolean;
}

export function SearchResultsSection({ results, isLoading }: SearchResultsSectionProps) {
  return (
    <section className="mt-16">
      <SectionHeading title="Search Results">
        <span className="text-xs text-[#71717a]">{results.length} results</span>
      </SectionHeading>

      {isLoading ? <Spinner /> : null}

      {!isLoading && results.length === 0 ? (
        <EmptyState
          message="No movies found"
          hint="Try another title or a shorter search phrase."
        />
      ) : null}

      {!isLoading && results.length > 0 ? <ContentGrid items={results} /> : null}
    </section>
  );
}
