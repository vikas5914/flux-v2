import type { MovieCard } from "../lib/lmscript";
import { TitleCard } from "./TitleCard";

export function ContentGrid({ items }: { items: MovieCard[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((item, index) => (
        <TitleCard key={item.id || index} movie={item} />
      ))}
    </div>
  );
}
