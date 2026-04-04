import { useRef } from "react";
import { Loader2, Search, X } from "lucide-react";

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  isLoading?: boolean;
}

export function SearchBar({ query, onQueryChange, isLoading }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div className="relative">
        {isLoading ? (
          <Loader2
            aria-hidden="true"
            className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 animate-spin text-[#f6821f]"
          />
        ) : (
          <Search
            aria-hidden="true"
            className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#71717a]"
          />
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search movies"
          className="w-full rounded border border-[#2a2a2a] bg-[#111111] py-3.5 pr-10 pl-12 text-base text-white placeholder:text-[#71717a] transition-colors focus:border-[#3a3a3a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f6821f]/50"
        />
        {query ? (
          <button
            onClick={() => {
              onQueryChange("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="absolute top-1/2 right-4 -translate-y-1/2 rounded text-[#71717a] transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[#f6821f]/50"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
