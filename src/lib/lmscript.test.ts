import { describe, expect, test } from "vitest";
import { getSubtitleProxyUrl, normalizeHomeSections, normalizeMovieDetail } from "./lmscript";

describe("lmscript normalizers", () => {
  test("normalizes featured home sections into movie cards", () => {
    const sections = normalizeHomeSections([
      {
        id: 1,
        title: "Featured Movies",
        code: "featured_movies",
        items: [
          {
            id_movie: 42,
            title: "Flux Movie",
            year: 2026,
            poster: "https://example.com/poster.webp",
            backdrop: "https://example.com/backdrop.webp",
          },
        ],
      },
    ]);

    expect(sections).toHaveLength(1);
    expect(sections[0]?.items[0]).toMatchObject({
      id: 42,
      title: "Flux Movie",
      year: 2026,
      posterUrl: "/api/image?path=%2Fposter.webp",
      backdropUrl: "/api/image?path=%2Fbackdrop.webp",
    });
  });

  test("normalizes detail streams and subtitle proxy urls", () => {
    const movie = normalizeMovieDetail({
      id_movie: 99,
      title: "Playback Test",
      streams: {
        "1080p": "https://cdn.example.com/video-1080.m3u8",
        "720p": "https://cdn.example.com/video-720.m3u8",
      },
      subtitles: [
        {
          id: "sub-en",
          language: "English",
          score: 2,
          url: "/storage8/example/subs/en.vtt",
        },
        {
          id: "sub-en-2",
          language: "English",
          score: 1,
          url: "/storage8/example/subs/en-2.vtt",
        },
      ],
    });

    expect(movie.streams[0]?.label).toBe("1080p");
    expect(movie.streams[0]?.url).toBe("https://cdn.example.com/video-1080.m3u8");
    expect(movie.subtitles).toHaveLength(2);
    expect(movie.subtitles[0]?.proxyUrl).toBe("/api/subtitles?movieId=99&subtitleId=sub-en");
  });

  test("builds same-origin subtitle proxy urls", () => {
    expect(getSubtitleProxyUrl(99, "sub-en")).toBe("/api/subtitles?movieId=99&subtitleId=sub-en");
  });
});
