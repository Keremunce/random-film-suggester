"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MovieContext } from "@/app/context/MovieContext";
import styles from "./page.module.css";

type MediaItem = {
  tmdbId: number;
  type: "movie" | "tv";
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  voteAverage: number | null;
};

type GenreCount = {
  id: number;
  name: string;
  count: number;
};

const POSTER_BASE = "https://image.tmdb.org/t/p/w342";

const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const formatYear = (date: string | null) =>
  date ? new Date(date).getFullYear() : "N/A";

export default function HomePage() {
  const context = useContext(MovieContext);
  if (!context) throw new Error("MovieContext not found");

  const { state, dispatch } = context;

  const [trending, setTrending] = useState<MediaItem[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [trendingError, setTrendingError] = useState<string | null>(null);

  const [newReleases, setNewReleases] = useState<MediaItem[]>([]);
  const [newReleasesLoading, setNewReleasesLoading] = useState(true);
  const [newReleasesError, setNewReleasesError] = useState<string | null>(null);

  const [topRated, setTopRated] = useState<MediaItem[]>([]);
  const [topRatedLoading, setTopRatedLoading] = useState(true);
  const [topRatedError, setTopRatedError] = useState<string | null>(null);

  const [tasteRecommendations, setTasteRecommendations] = useState<MediaItem[]>([]);
  const [tasteGenres, setTasteGenres] = useState<GenreCount[]>([]);
  const [tasteLoading, setTasteLoading] = useState(false);
  const [tasteError, setTasteError] = useState<string | null>(null);

  const watchlistMovieIds = useMemo(
    () =>
      state.items
        .filter((item) => item.status === "watchlist" && item.type === "movie")
        .map((item) => item.tmdbId),
    [state.items]
  );

  useEffect(() => {
    let isMounted = true;

    const loadTrending = async () => {
      try {
        setTrendingLoading(true);
        setTrendingError(null);
        const res = await fetch("/api/trending");
        if (!res.ok) throw new Error("Failed to load trending");
        const data = await res.json();
        if (!isMounted) return;
        setTrending(data.results || []);
      } catch {
        if (!isMounted) return;
        setTrendingError("Failed to load trending picks.");
      } finally {
        if (!isMounted) return;
        setTrendingLoading(false);
      }
    };

    const loadNewReleases = async () => {
      try {
        setNewReleasesLoading(true);
        setNewReleasesError(null);
        const res = await fetch("/api/new-releases");
        if (!res.ok) throw new Error("Failed to load new releases");
        const data = await res.json();
        if (!isMounted) return;
        setNewReleases(data.results || []);
      } catch {
        if (!isMounted) return;
        setNewReleasesError("Failed to load new releases.");
      } finally {
        if (!isMounted) return;
        setNewReleasesLoading(false);
      }
    };

    const loadTopRated = async () => {
      try {
        setTopRatedLoading(true);
        setTopRatedError(null);
        const res = await fetch("/api/top-rated");
        if (!res.ok) throw new Error("Failed to load top rated");
        const data = await res.json();
        if (!isMounted) return;
        setTopRated(data.results || []);
      } catch {
        if (!isMounted) return;
        setTopRatedError("Failed to load top rated movies.");
      } finally {
        if (!isMounted) return;
        setTopRatedLoading(false);
      }
    };

    loadTrending();
    loadNewReleases();
    loadTopRated();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadTaste = async () => {
      if (watchlistMovieIds.length === 0) {
        setTasteGenres([]);
        setTasteRecommendations([]);
        setTasteError(null);
        setTasteLoading(false);
        return;
      }

      try {
        setTasteLoading(true);
        setTasteError(null);
        const idsParam = watchlistMovieIds.slice(0, 12).join(",");
        const res = await fetch(`/api/movie-genres?ids=${encodeURIComponent(idsParam)}`);
        if (!res.ok) throw new Error("Failed to load watchlist genres");
        const data = await res.json();
        const counts = new Map<number, GenreCount>();

        (data.results || []).forEach((entry: { genres: { id: number; name: string }[] }) => {
          entry.genres.forEach((genre) => {
            const current = counts.get(genre.id);
            if (current) {
              counts.set(genre.id, { ...current, count: current.count + 1 });
            } else {
              counts.set(genre.id, { id: genre.id, name: genre.name, count: 1 });
            }
          });
        });

        const sortedGenres = Array.from(counts.values()).sort((a, b) => b.count - a.count);
        const topGenres = sortedGenres.slice(0, 3);
        if (!isMounted) return;
        setTasteGenres(topGenres);

        if (topGenres.length === 0) {
          setTasteRecommendations([]);
          return;
        }

        const genreIds = topGenres.map((genre) => genre.id).join(",");
        const discoverRes = await fetch(`/api/discover?with_genres=${genreIds}`);
        if (!discoverRes.ok) throw new Error("Failed to load personalized picks");
        const discoverData = await discoverRes.json();
        if (!isMounted) return;
        setTasteRecommendations(discoverData.results || []);
      } catch {
        if (!isMounted) return;
        setTasteError("Failed to build personalized picks.");
        setTasteRecommendations([]);
      } finally {
        if (!isMounted) return;
        setTasteLoading(false);
      }
    };

    loadTaste();
    return () => {
      isMounted = false;
    };
  }, [watchlistMovieIds]);

  const getExistingItem = (tmdbId: number) =>
    state.items.find((item) => item.tmdbId === tmdbId);

  const handleSave = (item: MediaItem) => {
    const existing = getExistingItem(item.tmdbId);
    if (existing) {
      dispatch({ type: "REMOVE_ITEM", payload: { id: existing.id } });
      return;
    }

    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: generateId(),
        tmdbId: item.tmdbId,
        type: item.type,
        title: item.title,
        posterPath: item.posterPath,
        releaseDate: item.releaseDate,
        status: "watchlist",
        rating: null,
        addedAt: new Date().toISOString(),
      },
    });
  };

  const renderCard = (item: MediaItem) => {
    const existing = getExistingItem(item.tmdbId);
    const isSaved = Boolean(existing);
    const posterUrl = item.posterPath
      ? `${POSTER_BASE}${item.posterPath}`
      : "https://via.placeholder.com/342x513?text=No+Poster";

    const content = (
      <>
        <div className={styles.cardPoster}>
          <Image
            src={posterUrl}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 180px"
            className={styles.cardPosterImage}
          />
        </div>
        <div className={styles.cardInfo}>
          <div className={styles.cardTitle}>{item.title}</div>
          <div className={styles.cardMeta}>
            <span>{formatYear(item.releaseDate)}</span>
            {item.voteAverage ? <span>• {item.voteAverage.toFixed(1)}</span> : null}
          </div>
        </div>
      </>
    );

    return (
      <div key={`${item.type}-${item.tmdbId}`} className={styles.card}>
        {item.type === "movie" ? (
          <Link href={`/movie/${item.tmdbId}`} className={styles.cardLink}>
            {content}
          </Link>
        ) : (
          <div className={styles.cardLink} aria-label={`${item.title} is a series`}>
            {content}
          </div>
        )}
        <div className={styles.cardActions}>
          <button
            type="button"
            className={`${styles.saveButton} ${isSaved ? styles.saved : ""}`}
            onClick={() => handleSave(item)}
          >
            {isSaved ? "Saved" : "Watchlist"}
          </button>
          <span className={styles.typeBadge}>
            {item.type === "movie" ? "Movie" : "Series"}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Discovery Hub</p>
          <h1 className={styles.title}>Find your next watch</h1>
          <p className={styles.subtitle}>
            Browse what’s trending, new in theaters and on TV, and top-rated films.
          </p>
        </div>
        <Link href="/explore" className={styles.exploreLink}>
          Explore filters
        </Link>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Trending This Week</h2>
          <p>Across movies and series</p>
        </div>
        {trendingError && <div className={styles.error}>{trendingError}</div>}
        {trendingLoading && <div className={styles.loading}>Loading...</div>}
        {!trendingLoading && (
          <div className={styles.grid}>{trending.slice(0, 12).map(renderCard)}</div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>New Releases</h2>
          <p>Fresh in theaters and on the air</p>
        </div>
        {newReleasesError && <div className={styles.error}>{newReleasesError}</div>}
        {newReleasesLoading && <div className={styles.loading}>Loading...</div>}
        {!newReleasesLoading && (
          <div className={styles.grid}>{newReleases.slice(0, 12).map(renderCard)}</div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Top Rated Movies</h2>
          <p>The crowd favorites</p>
        </div>
        {topRatedError && <div className={styles.error}>{topRatedError}</div>}
        {topRatedLoading && <div className={styles.loading}>Loading...</div>}
        {!topRatedLoading && (
          <div className={styles.grid}>{topRated.slice(0, 12).map(renderCard)}</div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Based on Your Taste</h2>
          <p>
            {watchlistMovieIds.length === 0
              ? "Add movies to your watchlist to personalize this section."
              : "Pulled from your watchlist genres."}
          </p>
        </div>
        {tasteError && <div className={styles.error}>{tasteError}</div>}
        {tasteLoading && <div className={styles.loading}>Personalizing...</div>}
        {!tasteLoading && watchlistMovieIds.length > 0 && (
          <>
            {tasteGenres.length > 0 && (
              <div className={styles.genreRow}>
                {tasteGenres.map((genre) => (
                  <span key={genre.id} className={styles.genrePill}>
                    {genre.name}
                  </span>
                ))}
              </div>
            )}
            <div className={styles.grid}>
              {tasteRecommendations.slice(0, 12).map(renderCard)}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
