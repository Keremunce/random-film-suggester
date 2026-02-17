import { NextResponse } from "next/server";

const BASE_URL = "https://api.themoviedb.org/3";

type TmdbTrendingItem = {
  id: number;
  media_type: "movie" | "tv" | "person";
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string | null;
  first_air_date?: string | null;
  vote_average?: number | null;
};

type NormalizedItem = {
  tmdbId: number;
  type: "movie" | "tv";
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  voteAverage: number | null;
};

export async function GET() {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "TMDB API key is missing. Set TMDB_API_KEY in env." },
        { status: 500 }
      );
    }

    const res = await fetch(
      `${BASE_URL}/trending/all/week?api_key=${apiKey}&language=en-US`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: `TMDB API error: ${res.status} ${errorText}`.trim() },
        { status: 502 }
      );
    }

    const data = (await res.json()) as { results?: TmdbTrendingItem[] };
    const results = (data.results || [])
      .filter((item) => item.media_type !== "person")
      .map<NormalizedItem>((item) => ({
        tmdbId: item.id,
        type: item.media_type as "movie" | "tv",
        title: item.media_type === "movie" ? item.title ?? "Untitled" : item.name ?? "Untitled",
        posterPath: item.poster_path,
        releaseDate:
          item.media_type === "movie" ? item.release_date ?? null : item.first_air_date ?? null,
        voteAverage: typeof item.vote_average === "number" ? item.vote_average : null,
      }));

    return NextResponse.json({ results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch trending: ${message}` },
      { status: 500 }
    );
  }
}
