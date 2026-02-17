import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://api.themoviedb.org/3";

type TmdbMovie = {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string | null;
  vote_average?: number | null;
};

type NormalizedItem = {
  tmdbId: number;
  type: "movie";
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  voteAverage: number | null;
};

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "TMDB API key is missing. Set TMDB_API_KEY in env." },
        { status: 500 }
      );
    }

    const params = request.nextUrl.searchParams;
    const withGenres = params.get("with_genres");
    const releaseYear = params.get("primary_release_year");
    const minVote = params.get("vote_average_gte");
    const sortBy = params.get("sort_by") || "popularity.desc";

    const query = new URLSearchParams({
      api_key: apiKey,
      language: "en-US",
      sort_by: sortBy,
      page: "1",
      include_adult: "false",
      include_video: "false",
    });

    if (withGenres) query.set("with_genres", withGenres);
    if (releaseYear) query.set("primary_release_year", releaseYear);
    if (minVote) query.set("vote_average.gte", minVote);

    const res = await fetch(`${BASE_URL}/discover/movie?${query.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: `TMDB API error: ${res.status} ${errorText}`.trim() },
        { status: 502 }
      );
    }

    const data = (await res.json()) as { results?: TmdbMovie[] };
    const results: NormalizedItem[] = (data.results || []).map((item) => ({
      tmdbId: item.id,
      type: "movie",
      title: item.title,
      posterPath: item.poster_path,
      releaseDate: item.release_date ?? null,
      voteAverage: typeof item.vote_average === "number" ? item.vote_average : null,
    }));

    return NextResponse.json({ results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to discover movies: ${message}` },
      { status: 500 }
    );
  }
}
