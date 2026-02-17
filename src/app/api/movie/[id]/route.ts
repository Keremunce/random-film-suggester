import { NextRequest, NextResponse } from "next/server";

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
};

type TmdbCredits = {
  cast?: { id: number; name: string; character: string; profile_path: string | null }[];
};

type TmdbRecommendations = {
  results?: {
    id: number;
    title: string;
    poster_path: string | null;
    release_date: string | null;
    vote_average?: number | null;
  }[];
};

type TmdbWatchProviders = {
  results?: Record<
    string,
    {
      flatrate?: { provider_name: string; logo_path: string | null }[];
    }
  >;
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
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const apiKey = getApiKey();
    const { id } = await params;

    const [detail, credits, recommendations, providers] = await Promise.all([
      fetchJson(`${BASE_URL}/movie/${id}?api_key=${apiKey}&language=en-US`) as Promise<TmdbMovieDetail>,
      fetchJson(`${BASE_URL}/movie/${id}/credits?api_key=${apiKey}&language=en-US`) as Promise<TmdbCredits>,
      fetchJson(`${BASE_URL}/movie/${id}/recommendations?api_key=${apiKey}&language=en-US&page=1`) as Promise<TmdbRecommendations>,
      fetchJson(`${BASE_URL}/movie/${id}/watch/providers?api_key=${apiKey}`) as Promise<TmdbWatchProviders>,
    ]);

    const cast = (credits.cast || []).slice(0, 5).map((member) => ({
      id: member.id,
      name: member.name,
      character: member.character,
      profilePath: member.profile_path,
    }));

    const usProviders = providers.results?.US?.flatrate || [];
    const normalizedProviders = usProviders.map((provider) => ({
      name: provider.provider_name,
      logoPath: provider.logo_path,
    }));

    const normalizedRecommendations = (recommendations.results || []).map((item) => ({
      tmdbId: item.id,
      title: item.title,
      posterPath: item.poster_path,
      releaseDate: item.release_date ?? null,
      voteAverage: typeof item.vote_average === "number" ? item.vote_average : null,
    }));

    return NextResponse.json({
      tmdbId: detail.id,
      title: detail.title,
      posterPath: detail.poster_path,
      backdropPath: detail.backdrop_path,
      releaseDate: detail.release_date ?? null,
      overview: detail.overview ?? null,
      runtime: detail.runtime ?? null,
      voteAverage: typeof detail.vote_average === "number" ? detail.vote_average : null,
      genres: detail.genres || [],
      cast,
      providers: normalizedProviders,
      recommendations: normalizedRecommendations,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch movie detail: ${message}` },
      { status: 500 }
    );
  }
}
