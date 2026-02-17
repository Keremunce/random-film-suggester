import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://api.themoviedb.org/3";

type TmdbGenre = { id: number; name: string };

type TmdbMovieDetail = {
  id: number;
  genres: TmdbGenre[];
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

    const idsParam = request.nextUrl.searchParams.get("ids");
    if (!idsParam) {
      return NextResponse.json({ results: [] });
    }

    const ids = idsParam
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
      .slice(0, 12);

    if (ids.length === 0) {
      return NextResponse.json({ results: [] });
    }

    const results = await Promise.all(
      ids.map(async (id) => {
        const res = await fetch(
          `${BASE_URL}/movie/${id}?api_key=${apiKey}&language=en-US`,
          { cache: "no-store" }
        );
        if (!res.ok) {
          return null;
        }
        const data = (await res.json()) as TmdbMovieDetail;
        return {
          tmdbId: data.id,
          genres: data.genres || [],
        };
      })
    );

    return NextResponse.json({
      results: results.filter(Boolean),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch movie genres: ${message}` },
      { status: 500 }
    );
  }
}
