import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://api.themoviedb.org/3";

type MediaType = "movie" | "tv";
type TmdbGenre = { id: number; name: string };
type TmdbMediaDetail = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string | null;
  first_air_date?: string | null;
  overview: string | null;
  runtime?: number | null;
  episode_run_time?: number[];
  vote_average: number | null;
  genres: TmdbGenre[];
};
type TmdbCredits = {
  cast?: {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
  }[];
};
type TmdbRecommendations = {
  results?: {
    id: number;
    title?: string;
    name?: string;
    poster_path: string | null;
    release_date?: string | null;
    first_air_date?: string | null;
    vote_average?: number | null;
  }[];
};
type TmdbWatchProviders = {
  results?: Record<
    string,
    { flatrate?: { provider_name: string; logo_path: string | null }[] }
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
    throw new Error(`TMDB API error: ${res.status} - ${errorText}`);
  }
  return res.json();
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ media_type: string; id: string }> },
) {
  try {
    const { media_type, id } = await params;
    if (media_type !== "movie" && media_type !== "tv") {
      return NextResponse.json({ error: "Invalid media type" }, { status: 400 });
    }

    const mediaType: MediaType = media_type;
    const apiKey = getApiKey();
    const endpoint = `${BASE_URL}/${mediaType}/${id}`;
    const [detail, credits, recommendations, providers] = await Promise.all([
      fetchJson(`${endpoint}?api_key=${apiKey}&language=en-US`) as Promise<TmdbMediaDetail>,
      fetchJson(`${endpoint}/credits?api_key=${apiKey}&language=en-US`) as Promise<TmdbCredits>,
      fetchJson(`${endpoint}/recommendations?api_key=${apiKey}&language=en-US&page=1`) as Promise<TmdbRecommendations>,
      fetchJson(`${endpoint}/watch/providers?api_key=${apiKey}`) as Promise<TmdbWatchProviders>,
    ]);

    const cast = (credits.cast || []).slice(0, 5).map((member) => ({
      id: member.id,
      name: member.name,
      character: member.character,
      profilePath: member.profile_path,
    }));
    const normalizedRecommendations = (recommendations.results || []).map((item) => ({
      tmdbId: item.id,
      type: mediaType,
      title: mediaType === "movie" ? item.title ?? "Untitled" : item.name ?? "Untitled",
      posterPath: item.poster_path,
      releaseDate:
        mediaType === "movie" ? item.release_date ?? null : item.first_air_date ?? null,
      voteAverage: typeof item.vote_average === "number" ? item.vote_average : null,
    }));

    return NextResponse.json({
      tmdbId: detail.id,
      type: mediaType,
      title: mediaType === "movie" ? detail.title ?? "Untitled" : detail.name ?? "Untitled",
      posterPath: detail.poster_path,
      backdropPath: detail.backdrop_path,
      releaseDate:
        mediaType === "movie" ? detail.release_date ?? null : detail.first_air_date ?? null,
      overview: detail.overview ?? null,
      runtime:
        mediaType === "movie"
          ? detail.runtime ?? null
          : detail.episode_run_time?.[0] ?? null,
      voteAverage: typeof detail.vote_average === "number" ? detail.vote_average : null,
      genres: detail.genres || [],
      cast,
      providers: (providers.results?.US?.flatrate || []).map((provider) => ({
        name: provider.provider_name,
        logoPath: provider.logo_path,
      })),
      recommendations: normalizedRecommendations,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch media detail: ${message}` },
      { status: 500 },
    );
  }
}
