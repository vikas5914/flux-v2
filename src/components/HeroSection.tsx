import { SearchBar } from "./SearchBar";

interface HeroSectionProps {
  query: string;
  onQueryChange: (query: string) => void;
  isSearchLoading: boolean;
}

export function HeroSection({ query, onQueryChange, isSearchLoading }: HeroSectionProps) {
  return (
    <section className="flex min-h-[40vh] flex-col items-center justify-center px-6 py-12 sm:py-24">
      <h1 className="mb-4 text-center text-5xl font-semibold tracking-tight text-white text-balance sm:text-6xl md:text-7xl">
        Watch something
      </h1>
      <p className="mb-8 max-w-md text-center text-lg text-[#a1a1aa] sm:mb-12">
        Search for movies and start watching instantly.
      </p>

      <SearchBar query={query} onQueryChange={onQueryChange} isLoading={isSearchLoading} />
    </section>
  );
}
