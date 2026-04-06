import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import type { MovieCard } from "../lib/lmscript";

export function TitleCard({ movie }: { movie: MovieCard }) {
  return (
    <Link to="/movie/$movieId" params={{ movieId: String(movie.id) }} className="group block">
      <div className="relative aspect-[2/3] overflow-hidden rounded">
        {movie.posterUrl && (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            width={200}
            height={300}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 opacity-0 transition-opacity group-hover:opacity-100">
            <Play aria-hidden="true" className="ml-0.5 h-5 w-5 fill-black text-black" />
          </div>
        </div>
      </div>
      <div className="mt-2">
        <p className="truncate text-sm font-medium text-white transition-colors group-hover:text-[#f6821f]">
          {movie.title}
        </p>
        <p className="mt-0.5 text-xs text-[#71717a]">{movie.year ?? "Unknown year"}</p>
      </div>
    </Link>
  );
}
