import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://api.themoviedb.org/3";

interface TMDBResult {
  id: number;
  media_type: "movie" | "tv" | "person";
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
}

interface NormalizedMedia {
  tmdbId: number;
  type: "movie" | "tv";
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "TMDB API key is missing" },
        { status: 500 }
      );
    }

    const query = request.nextUrl.searchParams.get("q");
    if (!query || query.trim().length === 0) {
      return NextResponse.json({ results: [] });
    }

    const res = await fetch(
      `${BASE_URL}/search/multi?api_key=${apiKey}&query=${encodeURIComponent(
        query
      )}&page=1`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      throw new Error(`TMDB API error: ${res.status}`);
    }

    const data = await res.json();

    // Filter out "person" results and normalize
    const results: NormalizedMedia[] = (data.results as TMDBResult[])
      .filter((item) => item.media_type !== "person")
      .map((item) => ({
        tmdbId: item.id,
        type: item.media_type as "movie" | "tv",
        title: item.media_type === "movie" ? item.title! : item.name!,
        posterPath: item.poster_path,
        releaseDate:
          item.media_type === "movie"
            ? item.release_date || null
            : item.first_air_date || null,
      }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search" },
      { status: 500 }
    );
  }
}
