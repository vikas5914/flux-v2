import { createServerFn } from "@tanstack/react-start";
import { setResponseHeaders } from "@tanstack/react-start/server";
import { z } from "zod";
import {
  fetchLmscriptJson,
  LMSCRIPT_CACHE_CONTROL,
  LMSCRIPT_CDN_CACHE_CONTROL,
  resolveLmscriptUrl,
} from "./lmscript.server";
const numberValueSchema = z
  .union([z.number(), z.string().trim().min(1).transform(Number)])
  .refine(Number.isFinite);
const stringValueSchema = z.string();
const booleanValueSchema = z
  .union([z.boolean(), z.number(), z.string().trim()])
  .transform((value) => {
    if (value === true) return true;
    if (value === false) return false;
    if (value === 1) return true;
    if (value === 0) return false;
    return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
  });

export interface MovieCastMember {
  id: number | null;
  name: string;
  role: string;
  character: string;
  avatarUrl: string;
}

export interface MovieStreamVariant {
  label: string;
  url: string;
  resolution: number;
}

export interface MovieSubtitleTrack {
  id: string;
  movieId: number;
  language: string;
  proxyUrl: string;
  format: string;
  score: number | null;
  source: string;
  sourceId: string | null;
  approved: boolean;
  moderated: boolean;
  hash: string;
  shard: string;
  releaseTitle: string;
}

export interface MovieCard {
  id: number;
  slug: string;
  title: string;
  year: number | null;
  durationMinutes: number | null;
  imdbRating: number | null;
  country: string | null;
  description: string;
  backdropUrl: string;
  homepageUrl: string | null;
  budget: number | null;
  tagline: string | null;
  posterUrl: string;
  views: number | null;
  dateAdded: string | null;
  tmdbPrefix: number | null;
  hasMetadata: boolean;
  hasSubtitles: boolean;
  relTitle: string | null;
  relOsHash: string | null;
  relSizeBytes: number | null;
  youtubeId: string | null;
  hasHash: boolean;
  priority: number | null;
  storageSlug: string | null;
  cast: MovieCastMember[];
  genres: string[];
  flagQuality: number | null;
  releaseDate: string | null;
  imdbId: string | null;
  isWatching: boolean;
  isFavorite: boolean;
}

interface MovieHomeSection {
  id: number;
  title: string;
  code: string;
  viewType: string;
  sectionBackground: string | null;
  position: number;
  url: string | null;
  items: MovieCard[];
}

interface MovieSearchResponse {
  items: MovieCard[];
  pageInfo: {
    totalCount: number | null;
    pageCount: number | null;
    currentPage: number | null;
    perPage: number | null;
  } | null;
  links: {
    self: string | null;
    first: string | null;
    last: string | null;
    next: string | null;
    prev: string | null;
  };
}

export interface MovieDetail extends MovieCard {
  streams: MovieStreamVariant[];
  subtitles: MovieSubtitleTrack[];
}

interface LmscriptMovieApiResponse extends Record<string, unknown> {
  items?: unknown[];
  _links?: Record<string, { href?: string } | undefined>;
  _meta?: {
    totalCount?: number;
    pageCount?: number;
    currentPage?: number;
    perPage?: number;
  };
}

function toNumber(value: unknown): number | null {
  const result = numberValueSchema.safeParse(value);
  return result.success ? result.data : null;
}

function toStringValue(value: unknown): string {
  const result = stringValueSchema.safeParse(value);
  return result.success ? result.data : "";
}

function toNullableString(value: unknown): string | null {
  const text = toStringValue(value).trim();
  return text.length > 0 ? text : null;
}

function toBoolean(value: unknown): boolean {
  const result = booleanValueSchema.safeParse(value);
  return result.success ? result.data : false;
}

function toYear(value: unknown): number | null {
  const numericYear = toNumber(value);
  if (numericYear && numericYear > 1800) return numericYear;

  const text = toStringValue(value);
  if (!text) return null;

  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) return parsed.getFullYear();

  const yearMatch = text.match(/(?:19|20)\d{2}/);
  return yearMatch ? Number(yearMatch[0]) : null;
}

function toMovieId(value: unknown): number {
  const numeric = toNumber(value);
  return numeric && numeric > 0 ? numeric : 0;
}

function toMovieIdOrNull(value: unknown): number | null {
  const numeric = toNumber(value);
  return numeric && numeric > 0 ? numeric : null;
}

function getGenres(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((genre) => {
      if (typeof genre === "string") return genre.trim();
      if (genre && typeof genre === "object") {
        const item = genre as Record<string, unknown>;
        return toStringValue(item.title ?? item.name ?? item.label).trim();
      }
      return "";
    })
    .filter(Boolean);
}

function getCast(value: unknown): MovieCastMember[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((member) => {
      if (!member || typeof member !== "object") return null;
      const item = member as Record<string, unknown>;
      const name = toStringValue(item.name ?? item.title ?? item.hero).trim();
      if (!name) return null;

      const character = toStringValue(item.hero ?? item.character ?? item.role).trim();
      const avatarUrl = toStringValue(
        item.picture_url ?? item.avatar_url ?? item.profile_path,
      ).trim();

      return {
        id: toMovieIdOrNull(item.id),
        name,
        role: toStringValue(item.role).trim(),
        character,
        avatarUrl,
      } satisfies MovieCastMember;
    })
    .filter((member): member is MovieCastMember => member !== null);
}

export function getSubtitleProxyUrl(movieId: number, subtitleId: string) {
  return `/api/subtitles?movieId=${movieId}&subtitleId=${encodeURIComponent(subtitleId)}`;
}

function getImagePath(rawUrl: string) {
  if (!rawUrl) return "";
  const url = new URL(rawUrl, "https://lmscript.xyz");
  return `${url.pathname}${url.search}`;
}

function normalizeMovieCard(raw: unknown): MovieCard {
  const item = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  return {
    id: toMovieId(item.id_movie ?? item.id),
    slug: toStringValue(item.slug),
    title: toStringValue(item.title) || "Untitled Movie",
    year: toYear(item.year ?? item.release_date),
    durationMinutes: toNumber(item.duration),
    imdbRating: toNumber(item.imdb_rating),
    country: toNullableString(item.country),
    description: toStringValue(item.description),
    backdropUrl: getImagePath(toStringValue(item.backdrop).replace("/w780/", "/w1280/")),
    homepageUrl: toNullableString(item.homepage),
    budget: toNumber(item.budget),
    tagline: toNullableString(item.tagline),
    posterUrl: getImagePath(toStringValue(item.poster)),
    views: toNumber(item.views),
    dateAdded: toNullableString(item.date_added),
    tmdbPrefix: toMovieIdOrNull(item.tmdb_prefix),
    hasMetadata: toBoolean(item.has_metadata),
    hasSubtitles: toBoolean(item.has_subtitles),
    relTitle: toNullableString(item.rel_title),
    relOsHash: toNullableString(item.rel_os_hash),
    relSizeBytes: toNumber(item.rel_size_bytes),
    youtubeId: toNullableString(item.youtube),
    hasHash: toBoolean(item.has_hash),
    priority: toNumber(item.priority),
    storageSlug: toNullableString(item.storage_slug),
    cast: getCast(item.cast),
    genres: getGenres(item.genres),
    flagQuality: toNumber(item.flag_quality),
    releaseDate: toNullableString(item.release_date),
    imdbId: toNullableString(item.imdb_id),
    isWatching: toBoolean(item.is_watching),
    isFavorite: toBoolean(item.is_favorite),
  };
}

export function normalizeMovieDetail(raw: unknown): MovieDetail {
  const item = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const movieId = toMovieId(item.id_movie ?? item.id);
  const streams = normalizeStreams(item.streams);
  const subtitles = normalizeSubtitles(item.subtitles, movieId);

  return {
    ...normalizeMovieCard(item),
    streams,
    subtitles,
  };
}

export function normalizeHomeSections(raw: unknown): MovieHomeSection[] {
  if (!Array.isArray(raw)) return [];

  return raw.map((section, index) => {
    const item = section && typeof section === "object" ? (section as Record<string, unknown>) : {};

    return {
      id: toMovieIdOrNull(item.id) ?? index,
      title: toStringValue(item.title) || "Featured Movies",
      code: toStringValue(item.code),
      viewType: toStringValue(item.view_type),
      sectionBackground: toNullableString(item.section_background),
      position: toNumber(item.position) ?? index,
      url: toNullableString(item.url),
      items: Array.isArray(item.items) ? item.items.map((movie) => normalizeMovieCard(movie)) : [],
    } satisfies MovieHomeSection;
  });
}

function normalizeSearchResponse(raw: unknown): MovieSearchResponse {
  const item = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const response = item as LmscriptMovieApiResponse;
  const links = response._links ?? {};

  return {
    items: Array.isArray(response.items)
      ? response.items.map((movie) => normalizeMovieCard(movie))
      : [],
    pageInfo: response._meta
      ? {
          totalCount: toNumber(response._meta.totalCount),
          pageCount: toNumber(response._meta.pageCount),
          currentPage: toNumber(response._meta.currentPage),
          perPage: toNumber(response._meta.perPage),
        }
      : null,
    links: {
      self: links.self?.href ?? null,
      first: links.first?.href ?? null,
      last: links.last?.href ?? null,
      next: links.next?.href ?? null,
      prev: links.prev?.href ?? null,
    },
  };
}

function normalizeStreams(raw: unknown): MovieStreamVariant[] {
  if (!raw) return [];

  const entries = Array.isArray(raw)
    ? raw
    : typeof raw === "object"
      ? Object.entries(raw as Record<string, unknown>).map(([label, value]) => ({ label, value }))
      : [];

  return entries
    .map((entry) => {
      if (typeof entry === "string") {
        return {
          label: "source",
          url: entry,
          resolution: 0,
        } satisfies MovieStreamVariant;
      }

      const item = entry && typeof entry === "object" ? (entry as Record<string, unknown>) : {};
      const label = toStringValue(item.label ?? item.quality ?? item.name ?? item.key);
      const rawUrl = toStringValue(item.url ?? item.href ?? item.src ?? item.value);
      if (!rawUrl) return null;

      const resolutionMatch = label.match(/(\d{3,4})/);
      const resolution = resolutionMatch
        ? Number(resolutionMatch[1])
        : (toNumber(item.resolution) ?? 0);

      return {
        label: label || "source",
        url: rawUrl,
        resolution,
      } satisfies MovieStreamVariant;
    })
    .filter((variant): variant is MovieStreamVariant => variant !== null)
    .sort(
      (left, right) => right.resolution - left.resolution || left.label.localeCompare(right.label),
    );
}

function normalizeSubtitles(raw: unknown, movieId: number): MovieSubtitleTrack[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((subtitle, index) => {
      if (!subtitle || typeof subtitle !== "object") return null;
      const item = subtitle as Record<string, unknown>;
      const rawUrl = toStringValue(item.url);
      if (!rawUrl) return null;

      const subtitleId = toStringValue(item.id) || `${movieId}:${index}`;
      const proxyUrl = getSubtitleProxyUrl(movieId, subtitleId);

      return {
        id: subtitleId,
        movieId,
        language: toStringValue(item.language) || "Unknown",
        proxyUrl,
        format: toStringValue(item.format) || "vtt",
        score: toNumber(item.score),
        source: toStringValue(item.source),
        sourceId: toNullableString(item.source_id),
        approved: toBoolean(item.is_approved),
        moderated: toBoolean(item.is_moderated),
        hash: toStringValue(item.hash),
        shard: toStringValue(item.shard),
        releaseTitle: toStringValue(item.release_title),
      } satisfies MovieSubtitleTrack;
    })
    .filter((subtitle): subtitle is MovieSubtitleTrack => subtitle !== null)
    .sort((left, right) => {
      if (left.language === right.language) return (right.score ?? 0) - (left.score ?? 0);
      return left.language.localeCompare(right.language);
    });
}

async function encryptImageUrls<T extends MovieCard>(movie: T): Promise<T> {
  const { buildImageProxyUrl } = await import("./crypto.server");
  const posterUrl = movie.posterUrl ? buildImageProxyUrl(resolveLmscriptUrl(movie.posterUrl)) : "";
  const backdropUrl = movie.backdropUrl
    ? buildImageProxyUrl(resolveLmscriptUrl(movie.backdropUrl))
    : "";
  return { ...movie, posterUrl, backdropUrl };
}

export const getHomeSections = createServerFn({ method: "GET" }).handler(async () => {
  setResponseHeaders({
    "Cache-Control": LMSCRIPT_CACHE_CONTROL,
    "CDN-Cache-Control": LMSCRIPT_CDN_CACHE_CONTROL,
  });
  const data = await fetchLmscriptJson("/home/");
  const sections = normalizeHomeSections(data);
  return Promise.all(
    sections.map(async (section) => ({
      ...section,
      items: await Promise.all(section.items.map(encryptImageUrls)),
    })),
  );
});

export const searchMovies = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      query: z.string().trim().min(1),
      sort: z.string().trim().optional(),
      page: z.coerce.number().int().positive().optional(),
    }),
  )
  .handler(async ({ data }) => {
    setResponseHeaders({
      "Cache-Control": LMSCRIPT_CACHE_CONTROL,
      "CDN-Cache-Control": LMSCRIPT_CDN_CACHE_CONTROL,
    });
    const params = new URLSearchParams();
    params.set("filters[q]", data.query);
    params.set("sort", data.sort ?? "-year");
    if (data.page) {
      params.set("page", String(data.page));
    }

    const payload = await fetchLmscriptJson(`/movies?${params.toString()}`);
    const response = normalizeSearchResponse(payload);
    response.items = await Promise.all(response.items.map(encryptImageUrls));
    return response;
  });

export const getMovieDetails = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      movieId: z.coerce.number().int().positive(),
    }),
  )
  .handler(async ({ data }) => {
    setResponseHeaders({
      "Cache-Control": LMSCRIPT_CACHE_CONTROL,
      "CDN-Cache-Control": LMSCRIPT_CDN_CACHE_CONTROL,
    });
    const payload = await fetchLmscriptJson(
      `/movies/view?expand=streams,subtitles&id=${data.movieId}`,
    );
    const movie = normalizeMovieDetail(payload);

    const { buildStreamProxyUrl } = await import("./crypto.server");

    // Encrypt stream URLs and image URLs into proxy URLs
    const encryptedMovie = await encryptImageUrls(movie);
    encryptedMovie.streams = encryptedMovie.streams.map((stream) => ({
      ...stream,
      url: buildStreamProxyUrl(resolveLmscriptUrl(stream.url)),
    }));

    return encryptedMovie;
  });
