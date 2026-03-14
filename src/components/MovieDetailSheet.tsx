"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ArrowLeft, BookmarkPlus, CheckCircle, Trash } from "lucide-react";
import { MovieContext } from "@/app/context/MovieContext";
import { StarRating } from "@/components/StarRating";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { showToast } from "@/utils/showToast";
import styles from "./MovieDetailSheet.module.css";

export type MovieSummary = {
  tmdbId: number;
  type: "movie" | "tv";
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
};

type MovieDetailApi = {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  overview: string | null;
  runtime: number | null;
  voteAverage: number | null;
  genres: { id: number; name: string }[];
};

type MediaDetailApi = {
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
};

type Detail = {
  tmdbId: number;
  type: "movie" | "tv";
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  overview: string | null;
  runtime: number | null;
  voteAverage: number | null;
  genres: string[];
};

type MovieDetailSheetProps = {
  movie: MovieSummary | null;
  open: boolean;
  onClose: () => void;
};

const POSTER_BASE = "https://image.tmdb.org/t/p/w500";

const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 768px)");
    const handleChange = () => setIsMobile(query.matches);
    handleChange();
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return isMobile;
};

const normalizeDetail = (data: MovieDetailApi | MediaDetailApi): Detail => {
  const genres = Array.isArray(data.genres)
    ? data.genres.map((genre) =>
        typeof genre === "string" ? genre : genre.name
      )
    : [];
  const type = "type" in data ? data.type : "movie";
  return {
    tmdbId: data.tmdbId,
    type,
    title: data.title,
    posterPath: data.posterPath,
    backdropPath: data.backdropPath,
    releaseDate: data.releaseDate,
    overview: data.overview,
    runtime: data.runtime,
    voteAverage: data.voteAverage,
    genres,
  };
};

export const MovieDetailSheet = ({ movie, open, onClose }: MovieDetailSheetProps) => {
  const context = useContext(MovieContext);
  if (!context) throw new Error("MovieContext not found");
  const { state, dispatch } = context;

  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!open || !movie) return;
    let isMounted = true;

    const loadDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const endpoint =
          movie.type === "movie"
            ? `/api/movie/${movie.tmdbId}`
            : `/api/media/${movie.tmdbId}`;
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error("Failed to load detail");
        const data = (await res.json()) as MovieDetailApi | MediaDetailApi;
        if (!isMounted) return;
        setDetail(normalizeDetail(data));
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
  }, [movie, open]);

  useEffect(() => {
    if (!open) {
      setDetail(null);
      setError(null);
      setLoading(false);
    }
  }, [open]);

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
      showToast(status === "watchlist" ? "Added to Watchlist" : "Marked as Watched");
      return;
    }

    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: generateId(),
        tmdbId: detail.tmdbId,
        type: detail.type,
        title: detail.title,
        posterPath: detail.posterPath,
        releaseDate: detail.releaseDate,
        status,
        rating: null,
        addedAt: new Date().toISOString(),
      },
    });
    showToast(status === "watchlist" ? "Added to Watchlist" : "Marked as Watched");
  };

  const handleRating = (rating: number | null) => {
    if (!existing) return;
    dispatch({ type: "UPDATE_ITEM", payload: { ...existing, rating } });
  };

  const year = detail?.releaseDate
    ? new Date(detail.releaseDate).getFullYear()
    : "N/A";

  const posterUrl = detail?.posterPath
    ? `${POSTER_BASE}${detail.posterPath}`
    : "https://via.placeholder.com/500x750?text=No+Poster";

  const content = (
    <div className={styles.content}>
      <div className={styles.header}>
        <button type="button" className={styles.backButton} onClick={onClose}>
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <div className={styles.titleBlock}>
          <h2 className={styles.title}>{detail?.title ?? movie?.title}</h2>
          <div className={styles.meta}>
            <span>{year}</span>
            {detail?.runtime ? <span>• {detail.runtime} min</span> : null}
            {detail?.voteAverage ? (
              <span>• {detail.voteAverage.toFixed(1)}</span>
            ) : null}
          </div>
        </div>
      </div>

      {loading && <div className={styles.state}>Loading...</div>}
      {error && <div className={styles.state}>{error}</div>}

      {!loading && !error && detail && (
        <div className={styles.body}>
          <div className={styles.poster}>
            <Image
              src={posterUrl}
              alt={detail.title}
              fill
              sizes="(max-width: 768px) 50vw, 240px"
              className={styles.posterImage}
            />
          </div>

          <div>
            {detail.overview && (
              <p className={styles.overview}>{detail.overview}</p>
            )}

            {detail.genres.length > 0 && (
              <div className={styles.genres}>
                {detail.genres.map((genre) => (
                  <span key={genre} className={styles.genrePill}>
                    {genre}
                  </span>
                ))}
              </div>
            )}

            <div className={styles.actions}>
              <Button
                type="button"
                unstyled
                className={`${styles.actionButton} ${
                  existing?.status === "watchlist" ? styles.active : ""
                }`}
                onClick={() => handleAdd("watchlist")}
              >
                {existing?.status === "watchlist" ? (
                  <>
                    <Trash className="mr-2 h-4 w-4" />
                    Remove from Watchlist
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="mr-2 h-4 w-4" />
                    Save to Watchlist
                  </>
                )}
              </Button>
              <Button
                type="button"
                unstyled
                className={`${styles.actionButton} ${
                  existing?.status === "watched" ? styles.active : ""
                }`}
                onClick={() => handleAdd("watched")}
              >
                {existing?.status === "watched" ? (
                  <>
                    <Trash className="mr-2 h-4 w-4" />
                    Remove from Watched
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Watched
                  </>
                )}
              </Button>
            </div>

            <div className={styles.ratingBlock}>
              <p className={styles.ratingLabel}>Your Rating</p>
              {existing ? (
                <StarRating value={existing.rating} onChange={handleRating} />
              ) : (
                <p className={styles.hint}>Save this item to rate it.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
        <DrawerContent>{content}</DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent>{content}</DialogContent>
    </Dialog>
  );
};
