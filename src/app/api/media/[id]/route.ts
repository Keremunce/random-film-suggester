import { NextResponse } from "next/server";

const BASE_URL = "https://api.themoviedb.org/3";

type TmdbGenre = { id: number; name: string };

type TmdbMovieDetail = {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string | null;
  overview: string | null;
  runtime: number | null;
  vote_average: number | null;
  genres: TmdbGenre[];
  credits?: {
    crew?: { job: string; name: string }[];
  };
};

type TmdbTvDetail = {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string | null;
  overview: string | null;
  episode_run_time?: number[];
  vote_average: number | null;
  genres: TmdbGenre[];
  created_by?: { name: string }[];
};

type NormalizedDetail = {
  tmdbId: number;
  type: "movie" | "tv";
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  overview: string | null;
  runtime: number | null;
  genres: string[];
  voteAverage: number | null;
  creators: string[];
};

const getApiKey = () => {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error("TMDB API key is missing. Set TMDB_API_KEY in env.");
  }
  return apiKey;
};

const fetchJson = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const errorText = await res.text();
    const err = new Error(`TMDB API error: ${res.status} - ${errorText}`);
    // @ts-expect-error attach status
    err.status = res.status;
    throw err;
  }
  return res.json();
};

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const apiKey = getApiKey();
    const id = params.id;

    try {
      const data = (await fetchJson(
        `${BASE_URL}/movie/${id}?api_key=${apiKey}&append_to_response=credits`
      )) as TmdbMovieDetail;

      const directors =
        data.credits?.crew
          ?.filter((c) => c.job === "Director")
          .map((c) => c.name) ?? [];

      const normalized: NormalizedDetail = {
        tmdbId: data.id,
        type: "movie",
        title: data.title,
        posterPath: data.poster_path,
        backdropPath: data.backdrop_path,
        releaseDate: data.release_date ?? null,
        overview: data.overview ?? null,
        runtime: data.runtime ?? null,
        genres: (data.genres || []).map((g) => g.name),
        voteAverage:
          typeof data.vote_average === "number" ? data.vote_average : null,
        creators: directors,
      };

      return NextResponse.json(normalized);
    } catch (err) {
      // @ts-expect-error read status
      const status = err?.status;
      if (status && status !== 404) {
        throw err;
      }
    }

    const tvData = (await fetchJson(
      `${BASE_URL}/tv/${id}?api_key=${apiKey}`
    )) as TmdbTvDetail;

    const normalizedTv: NormalizedDetail = {
      tmdbId: tvData.id,
      type: "tv",
      title: tvData.name,
      posterPath: tvData.poster_path,
      backdropPath: tvData.backdrop_path,
      releaseDate: tvData.first_air_date ?? null,
      overview: tvData.overview ?? null,
      runtime:
        Array.isArray(tvData.episode_run_time) &&
        tvData.episode_run_time.length > 0
          ? tvData.episode_run_time[0]
          : null,
      genres: (tvData.genres || []).map((g) => g.name),
      voteAverage:
        typeof tvData.vote_average === "number" ? tvData.vote_average : null,
      creators: (tvData.created_by || []).map((c) => c.name),
    };

    return NextResponse.json(normalizedTv);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch media detail: ${message}` },
      { status: 500 }
    );
  }
}
