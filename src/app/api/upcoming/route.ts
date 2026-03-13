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

    const pageParam = request.nextUrl.searchParams.get("page");
    const page = Number.isFinite(Number(pageParam)) && Number(pageParam) > 0
      ? String(Math.floor(Number(pageParam)))
      : "1";

    const res = await fetch(
      `${BASE_URL}/movie/upcoming?api_key=${apiKey}&language=en-US&page=${page}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: `TMDB API error: ${res.status} ${errorText}`.trim() },
        { status: 502 }
      );
    }

    const data = (await res.json()) as { results?: TmdbMovie[]; total_pages?: number };
    const results: NormalizedItem[] = (data.results || []).map((item) => ({
      tmdbId: item.id,
      type: "movie",
      title: item.title,
      posterPath: item.poster_path,
      releaseDate: item.release_date ?? null,
      voteAverage: typeof item.vote_average === "number" ? item.vote_average : null,
    }));

    return NextResponse.json({ results, total_pages: data.total_pages });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch upcoming: ${message}` },
      { status: 500 }
    );
  }
}
