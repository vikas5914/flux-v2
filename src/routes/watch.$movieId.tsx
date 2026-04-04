import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import Header from "../components/Header";
import { WatchPlayer } from "../components/WatchPlayer";
import { getMovieDetails } from "../lib/lmscript";

export const Route = createFileRoute("/watch/$movieId")({
  loader: async ({ params, context }) => {
    const movieId = Number(params.movieId);
    if (!Number.isFinite(movieId) || movieId <= 0) {
      throw notFound();
    }
    await context.queryClient.ensureQueryData({
      queryKey: ["lmscript", "movie", movieId],
      queryFn: () => getMovieDetails({ data: { movieId } }),
    });
  },
  component: WatchPage,
  errorComponent: () => (
    <div className="h-screen overflow-hidden bg-[#0a0a0a]">
      <Header />
      <div className="flex h-full items-center justify-center pt-14">
        <p className="text-sm text-[#a1a1aa]">Failed to load movie. Please try again later.</p>
      </div>
    </div>
  ),
});

function WatchPage() {
  const { movieId } = Route.useParams();

  const { data: movie } = useSuspenseQuery({
    queryKey: ["lmscript", "movie", Number(movieId)],
    queryFn: () => getMovieDetails({ data: { movieId: Number(movieId) } }),
  });

  return (
    <div className="h-screen overflow-hidden bg-[#0a0a0a]">
      <Header title={movie.title} subtitle={movie.year ? String(movie.year) : undefined} />

      <main className="flex h-full flex-col pt-14">
        <div className="hidden shrink-0 border-b border-[#1f1f1f] bg-[#111111] sm:block">
          <div className="mx-auto grid max-w-6xl grid-cols-[auto_1fr] items-center gap-4 px-6 py-3">
            <Link
              to="/movie/$movieId"
              params={{ movieId }}
              className="flex items-center gap-2 text-[#a1a1aa] transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back</span>
            </Link>
          </div>
        </div>

        <div className="min-h-0 flex-1">
          <WatchPlayer movie={movie} />
        </div>
      </main>
    </div>
  );
}
