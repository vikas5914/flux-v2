import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Clock, Play, Star } from "lucide-react";
import Header from "../components/Header";
import { getMovieDetails } from "../lib/lmscript";

export const Route = createFileRoute("/movie/$movieId")({
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
  component: MovieDetailsPage,
  errorComponent: () => (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />
      <div className="flex min-h-[50vh] items-center justify-center pt-14">
        <p className="text-sm text-[#a1a1aa]">
          Failed to load movie details. Please try again later.
        </p>
      </div>
    </div>
  ),
});

function formatDuration(minutes: number | null) {
  if (!minutes || minutes <= 0) return null;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (!hours) return `${remainder}m`;
  if (!remainder) return `${hours}h`;
  return `${hours}h ${remainder}m`;
}

function MovieDetailsPage() {
  const { movieId } = Route.useParams();
  const navigate = useNavigate();

  const { data: movie } = useSuspenseQuery({
    queryKey: ["lmscript", "movie", Number(movieId)],
    queryFn: () => getMovieDetails({ data: { movieId: Number(movieId) } }),
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />

      <main className="pt-14">
        <div className="relative h-[50vh] min-h-[280px] sm:min-h-[400px]">
          <img src={movie.backdropUrl} alt={movie.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />

          <div className="absolute top-6 inset-x-0 z-10">
            <div className="mx-auto max-w-6xl px-6">
              <button
                onClick={() => navigate({ to: "/" })}
                className="flex items-center gap-2 text-white/80 transition-colors hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm">Back</span>
              </button>
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto -mt-32 max-w-6xl px-6">
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="hidden shrink-0 md:block">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="h-72 w-48 rounded object-cover"
              />
            </div>

            <div className="flex-1">
              <div className="mb-3 flex items-center gap-3">
                <span className="rounded border border-[#2a2a2a] bg-[#151515] px-1.5 py-0.5 text-[10px] tracking-wider text-[#f6821f] uppercase">
                  Movie
                </span>
                {movie.year ? <span className="text-xs text-[#a1a1aa]">{movie.year}</span> : null}
                {movie.imdbRating ? (
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-[#f6821f] text-[#f6821f]" />
                    <span className="text-xs text-[#a1a1aa]">{movie.imdbRating.toFixed(1)}</span>
                  </div>
                ) : null}
              </div>

              <h1 className="mb-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
                {movie.title}
              </h1>

              <div className="mb-6 flex flex-wrap items-center gap-4">
                {movie.durationMinutes ? (
                  <div className="flex items-center gap-1.5 text-[#a1a1aa]">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{formatDuration(movie.durationMinutes)}</span>
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre}
                      className="rounded border border-[#1f1f1f] bg-[#111111] px-2 py-1 text-xs text-[#a1a1aa]"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              {movie.tagline ? (
                <p className="mb-3 text-sm text-[#f6821f]">{movie.tagline}</p>
              ) : null}
              <p className="mb-8 max-w-2xl text-base leading-relaxed text-[#a1a1aa]">
                {movie.description}
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/watch/$movieId"
                  params={{ movieId }}
                  className="inline-flex items-center gap-2 rounded bg-white px-6 py-2.5 text-sm font-medium !text-black transition-colors hover:bg-[#e5e5e5]"
                >
                  <Play className="h-4 w-4 fill-black" />
                  Play Now
                </Link>
                {movie.homepageUrl ? (
                  <a
                    href={movie.homepageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded border border-[#2a2a2a] bg-[#151515] px-6 py-2.5 text-sm font-medium text-[#a1a1aa] transition-colors hover:border-[#3a3a3a] hover:text-white"
                  >
                    Visit Homepage
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          {movie.cast.length > 0 ? (
            <section className="mt-12 pb-24">
              <div className="mb-4 flex items-center gap-3">
                <div className="h-px w-6 bg-[#f6821f]" />
                <h2 className="font-mono text-xs tracking-widest text-[#f6821f] uppercase">Cast</h2>
              </div>
              <div className="flex flex-wrap gap-6">
                {movie.cast.slice(0, 9).map((member) => (
                  <div key={`${member.name}-${member.character}`}>
                    <p className="text-sm font-medium text-white">{member.name}</p>
                    {member.character ? (
                      <p className="mt-0.5 text-xs text-[#71717a]">{member.character}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>
    </div>
  );
}
