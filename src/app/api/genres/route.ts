import { NextResponse } from "next/server";

const BASE_URL = "https://api.themoviedb.org/3";

type TmdbGenre = { id: number; name: string };

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
      `${BASE_URL}/genre/movie/list?api_key=${apiKey}&language=en-US`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: `TMDB API error: ${res.status} ${errorText}`.trim() },
        { status: 502 }
      );
    }

    const data = (await res.json()) as { genres?: TmdbGenre[] };
    return NextResponse.json({ genres: data.genres || [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch genres: ${message}` },
      { status: 500 }
    );
  }
}
