"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MovieContext } from "@/app/context/MovieContext";
import { StarRating } from "@/components/StarRating";
import styles from "./style.module.css";

type MovieDetail = {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  overview: string | null;
  runtime: number | null;
  voteAverage: number | null;
  genres: { id: number; name: string }[];
  cast: { id: number; name: string; character: string; profilePath: string | null }[];
  providers: { name: string; logoPath: string | null }[];
  recommendations: {
    tmdbId: number;
    title: string;
    posterPath: string | null;
    releaseDate: string | null;
    voteAverage: number | null;
  }[];
};

const POSTER_BASE = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";
const PROFILE_BASE = "https://image.tmdb.org/t/p/w185";
const PROVIDER_BASE = "https://image.tmdb.org/t/p/w92";

const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export default function MovieDetailPage() {
  const params = useParams<{ id: string }>();
  const context = useContext(MovieContext);
  if (!context) throw new Error("MovieContext not found");

  const { state, dispatch } = context;
  const [detail, setDetail] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/movie/${params.id}`);
        if (!res.ok) throw new Error("Failed to load detail");
        const data = (await res.json()) as MovieDetail;
        if (!isMounted) return;
        setDetail(data);
      } catch {
        if (!isMounted) return;
        setError("Failed to load details. Please try again.");
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    loadDetail();
    return () => {
      isMounted = false;
    };
  }, [params.id]);

  const existing = useMemo(() => {
    if (!detail) return undefined;
    return state.items.find((item) => item.tmdbId === detail.tmdbId);
  }, [detail, state.items]);

  const handleAdd = (status: "watchlist" | "watched") => {
    if (!detail) return;
    if (existing) {
      if (existing.status === status) {
        dispatch({ type: "REMOVE_ITEM", payload: { id: existing.id } });
        return;
      }
      dispatch({ type: "UPDATE_ITEM", payload: { ...existing, status } });
      return;
    }

    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: generateId(),
        tmdbId: detail.tmdbId,
        type: "movie",
        title: detail.title,
        posterPath: detail.posterPath,
        releaseDate: detail.releaseDate,
        status,
        rating: null,
        addedAt: new Date().toISOString(),
      },
    });
  };

  const handleRating = (rating: number | null) => {
    if (!existing) return;
    dispatch({ type: "UPDATE_ITEM", payload: { ...existing, rating } });
  };

  if (loading) {
    return <div className={styles.state}>Loading...</div>;
  }

  if (error || !detail) {
    return <div className={styles.state}>{error ?? "Not found."}</div>;
  }

  const posterUrl = detail.posterPath
    ? `${POSTER_BASE}${detail.posterPath}`
    : "https://via.placeholder.com/500x750?text=No+Poster";
  const backdropUrl = detail.backdropPath
    ? `${BACKDROP_BASE}${detail.backdropPath}`
    : null;

  const year = detail.releaseDate
    ? new Date(detail.releaseDate).getFullYear()
    : "N/A";

  const isWatchlist = existing?.status === "watchlist";
  const isWatched = existing?.status === "watched";

  return (
    <div className={styles.page}>
      {backdropUrl && (
        <div
          className={styles.backdrop}
          style={{ backgroundImage: `url(${backdropUrl})` }}
          aria-hidden="true"
        />
      )}

      <div className={styles.content}>
        <div className={styles.poster}>
          <Image
            src={posterUrl}
            alt={detail.title}
            width={500}
            height={750}
            className={styles.posterImage}
          />
        </div>

        <div className={styles.info}>
          <div className={styles.header}>
            <div>
              <p className={styles.kicker}>Movie</p>
              <h1 className={styles.title}>{detail.title}</h1>
              <p className={styles.meta}>
                <span>{year}</span>
                {detail.runtime ? <span>• {detail.runtime} min</span> : null}
                {detail.voteAverage ? (
                  <span>• {detail.voteAverage.toFixed(1)}</span>
                ) : null}
              </p>
            </div>
            <div className={styles.actions}>
              <button
                type="button"
                className={`${styles.actionButton} ${
                  isWatchlist ? styles.active : ""
                }`}
                onClick={() => handleAdd("watchlist")}
              >
                {isWatchlist ? "Remove from Watchlist" : "Save to Watchlist"}
              </button>
              <button
                type="button"
                className={`${styles.actionButton} ${styles.secondary} ${
                  isWatched ? styles.active : ""
                }`}
                onClick={() => handleAdd("watched")}
              >
                {isWatched ? "Remove from Watched" : "Mark as Watched"}
              </button>
            </div>
          </div>

          {detail.overview && (
            <p className={styles.overview}>{detail.overview}</p>
          )}

          {detail.genres.length > 0 && (
            <div className={styles.genres}>
              {detail.genres.map((genre) => (
                <span key={genre.id} className={styles.genrePill}>
                  {genre.name}
                </span>
              ))}
            </div>
          )}

          <div className={styles.ratingBlock}>
            <p className={styles.label}>Your Rating</p>
            {existing ? (
              <StarRating value={existing.rating} onChange={handleRating} />
            ) : (
              <p className={styles.hint}>Save this item to rate it.</p>
            )}
          </div>
        </div>
      </div>

      <section className={styles.section}>
        <h2>Top Cast</h2>
        {detail.cast.length === 0 ? (
          <p className={styles.empty}>No cast data available.</p>
        ) : (
          <div className={styles.castGrid}>
            {detail.cast.map((member) => {
              const profileUrl = member.profilePath
                ? `${PROFILE_BASE}${member.profilePath}`
                : "https://via.placeholder.com/185x278?text=No+Photo";

              return (
                <div key={member.id} className={styles.castCard}>
                  <Image
                    src={profileUrl}
                    alt={member.name}
                    width={120}
                    height={180}
                    className={styles.castImage}
                  />
                  <div>
                    <p className={styles.castName}>{member.name}</p>
                    <p className={styles.castRole}>{member.character}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2>Streaming Providers</h2>
        {detail.providers.length === 0 ? (
          <p className={styles.empty}>No streaming providers listed in the US.</p>
        ) : (
          <div className={styles.providerRow}>
            {detail.providers.map((provider) => {
              const logoUrl = provider.logoPath
                ? `${PROVIDER_BASE}${provider.logoPath}`
                : "https://via.placeholder.com/92x92?text=Logo";
              return (
                <div key={provider.name} className={styles.providerCard}>
                  <Image
                    src={logoUrl}
                    alt={provider.name}
                    width={44}
                    height={44}
                    className={styles.providerLogo}
                  />
                  <span>{provider.name}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Recommended Movies</h2>
          <Link href="/" className={styles.sectionLink}>
            Back to discovery
          </Link>
        </div>
        {detail.recommendations.length === 0 ? (
          <p className={styles.empty}>No recommendations available.</p>
        ) : (
          <div className={styles.recommendationsGrid}>
            {detail.recommendations.slice(0, 12).map((item) => {
              const posterUrl = item.posterPath
                ? `${POSTER_BASE}${item.posterPath}`
                : "https://via.placeholder.com/342x513?text=No+Poster";
              const recYear = item.releaseDate
                ? new Date(item.releaseDate).getFullYear()
                : "N/A";

              return (
                <Link
                  key={item.tmdbId}
                  href={`/movie/${item.tmdbId}`}
                  className={styles.recommendationCard}
                >
                  <div className={styles.recommendationPoster}>
                    <Image
                      src={posterUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 180px"
                      className={styles.recommendationImage}
                    />
                  </div>
                  <div className={styles.recommendationInfo}>
                    <p>{item.title}</p>
                    <span>
                      {recYear}
                      {item.voteAverage ? ` • ${item.voteAverage.toFixed(1)}` : ""}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
