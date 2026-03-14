"use client";

import React, { useContext, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MovieContext } from "@/app/context/MovieContext";
import styles from "../shared.module.css";
import homeStyles from "@/app/page.module.css";
import { showToast } from "@/utils/showToast";
import { Button } from "@/components/ui/button";
import { BookmarkPlus } from "lucide-react";

type ApiItem = {
  tmdbId: number;
  type: "movie";
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  voteAverage: number | null;
};

type ApiResponse = {
  results?: ApiItem[];
  total_pages?: number;
};

const POSTER_BASE = "https://image.tmdb.org/t/p/w342";

const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const formatYear = (date: string | null) =>
  date ? new Date(date).getFullYear() : "N/A";

export default function MoviesThisYearPage() {
  const context = useContext(MovieContext);
  if (!context) throw new Error("MovieContext not found");
  const { state, dispatch } = context;

  const [items, setItems] = useState<ApiItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pressedId, setPressedId] = useState<number | null>(null);

  const hasMore = totalPages === null ? true : page < totalPages;
  const currentYear = new Date().getFullYear();

  const fetchPage = async (pageToLoad: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/discover?primary_release_year=${currentYear}&page=${pageToLoad}`
      );
      if (!res.ok) throw new Error("Failed to load movies this year.");
      const data = (await res.json()) as ApiResponse;
      const normalized = data.results || [];
      setItems((prev) => {
        if (pageToLoad === 1) return normalized;
        const seen = new Set(prev.map((entry) => entry.tmdbId));
        const merged = [...prev];
        normalized.forEach((entry) => {
          if (!seen.has(entry.tmdbId)) merged.push(entry);
        });
        return merged;
      });
      if (typeof data.total_pages === "number") {
        setTotalPages(data.total_pages);
      } else if ((data.results || []).length === 0) {
        setTotalPages(pageToLoad);
      }
      setPage(pageToLoad);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load movies this year.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(1);
  }, []);

  const getExistingItem = (tmdbId: number) =>
    state.items.find((item) => item.tmdbId === tmdbId);

  const handleSave = (item: ApiItem) => {
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
    showToast("Added to Watchlist");
  };

  const renderCard = (item: ApiItem) => {
    const existing = getExistingItem(item.tmdbId);
    const isSaved = Boolean(existing);
    const posterUrl = item.posterPath
      ? `${POSTER_BASE}${item.posterPath}`
      : "https://via.placeholder.com/342x513?text=No+Poster";

    const isPressed = pressedId === item.tmdbId;
    return (
      <div
        key={`movie-${item.tmdbId}`}
        className={`${homeStyles.card} transition-transform duration-150 ${
          isPressed ? "scale-95" : ""
        }`}
      >
        <Link href={`/movie/${item.tmdbId}`} className={homeStyles.cardLink}>
          <div className={homeStyles.cardPoster}>
            <Image
              src={posterUrl}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 180px"
              className={homeStyles.cardPosterImage}
            />
          </div>
          <div className={homeStyles.cardInfo}>
            <div className={homeStyles.cardTitle}>{item.title}</div>
            <div className={homeStyles.cardMeta}>
              <span>{formatYear(item.releaseDate)}</span>
            </div>
          </div>
        </Link>
        <div className={homeStyles.cardActions}>
          <Button
            type="button"
            unstyled
            className={`${homeStyles.saveButton} ${isSaved ? homeStyles.saved : ""}`}
            onClick={() => {
              setPressedId(item.tmdbId);
              window.setTimeout(() => setPressedId(null), 120);
              handleSave(item);
            }}
          >
            <BookmarkPlus className="mr-2 h-4 w-4" />
            {isSaved ? "Saved" : "Watchlist"}
          </Button>
          <span className={homeStyles.typeBadge}>Movie</span>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Movies This Year</h1>
        <p className={styles.subtitle}>Fresh releases from {currentYear}.</p>
      </header>

      {error && <div className={styles.status}>{error}</div>}
      {loading && items.length === 0 && (
        <div className={styles.status}>Loading...</div>
      )}

      {items.length > 0 && (
        <div className={styles.grid}>
          {items.map(renderCard)}
        </div>
      )}

      <div className={styles.loadMoreRow}>
        <button
          type="button"
          className={styles.loadMoreButton}
          onClick={() => fetchPage(page + 1)}
          disabled={loading || !hasMore}
        >
          {loading ? "Loading..." : hasMore ? "Load More" : "No more results"}
        </button>
      </div>
    </div>
  );
}
