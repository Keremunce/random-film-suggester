import { NextResponse } from "next/server";

const BASE_URL = "https://api.themoviedb.org/3";

type TmdbMovie = {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string | null;
  vote_average?: number | null;
};

type TmdbTv = {
  id: number;
  name: string;
  poster_path: string | null;
  first_air_date: string | null;
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

    const [moviesRes, tvRes] = await Promise.all([
      fetch(`${BASE_URL}/movie/now_playing?api_key=${apiKey}&language=en-US&page=1`, {
        cache: "no-store",
      }),
      fetch(`${BASE_URL}/tv/on_the_air?api_key=${apiKey}&language=en-US&page=1`, {
        cache: "no-store",
      }),
    ]);

    if (!moviesRes.ok || !tvRes.ok) {
      const movieError = moviesRes.ok ? "" : await moviesRes.text();
      const tvError = tvRes.ok ? "" : await tvRes.text();
      return NextResponse.json(
        {
          error: `TMDB API error: ${moviesRes.status}/${tvRes.status} ${movieError} ${tvError}`.trim(),
        },
        { status: 502 }
      );
    }

    const movieData = (await moviesRes.json()) as { results?: TmdbMovie[] };
    const tvData = (await tvRes.json()) as { results?: TmdbTv[] };

    const movies: NormalizedItem[] = (movieData.results || []).map((item) => ({
      tmdbId: item.id,
      type: "movie",
      title: item.title,
      posterPath: item.poster_path,
      releaseDate: item.release_date ?? null,
      voteAverage: typeof item.vote_average === "number" ? item.vote_average : null,
    }));

    const series: NormalizedItem[] = (tvData.results || []).map((item) => ({
      tmdbId: item.id,
      type: "tv",
      title: item.name,
      posterPath: item.poster_path,
      releaseDate: item.first_air_date ?? null,
      voteAverage: typeof item.vote_average === "number" ? item.vote_average : null,
    }));

    const combined = [...movies, ...series].sort((a, b) => {
      const aDate = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
      const bDate = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
      return bDate - aDate;
    });

    return NextResponse.json({ results: combined });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Unexpected server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
