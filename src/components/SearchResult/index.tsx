"use client";

import React from "react";
import { StarRating } from "@/components/StarRating";
import styles from "./style.module.css";

interface SearchResultProps {
  tmdbId: number;
  title: string;
  type: "movie" | "tv";
  posterPath: string | null;
  releaseDate: string | null;
  overview: string | null;
  voteAverage: number | null;
  onAdd: () => void;
  isAdded?: boolean;
}

const POSTER_BASE = "https://image.tmdb.org/t/p/w154";

export const SearchResult: React.FC<SearchResultProps> = ({
  title,
  type,
  posterPath,
  releaseDate,
  overview,
  voteAverage,
  onAdd,
  isAdded = false,
}) => {
  const posterUrl = posterPath
    ? `${POSTER_BASE}${posterPath}`
    : "https://via.placeholder.com/154x231?text=No+Poster";

  const year = releaseDate ? new Date(releaseDate).getFullYear() : "N/A";
  const starValue =
    typeof voteAverage === "number" &&
    !Number.isNaN(voteAverage) &&
    voteAverage > 0
      ? Math.max(1, Math.min(10, Math.round(voteAverage)))
      : null;

  return (
    <div className={styles.result}>
      <div className={styles.poster}>
        <img src={posterUrl} alt={title} loading="lazy" />
      </div>

      <div className={styles.info}>
        <div className={styles.titleRow}>
          <h4 className={styles.title}>{title}</h4>
          <div className={styles.rating}>
            <StarRating value={starValue} onChange={() => {}} size="sm" interactive={false} />
          </div>
        </div>
        {overview && <p className={styles.description}>{overview}</p>}
        <p className={styles.meta}>
          <span className={styles.badge}>{type === "movie" ? "🎬 Movie" : "📺 Series"}</span>
          <span className={styles.year}>{year}</span>
        </p>
      </div>

      <button
        className={`${styles.addBtn} ${isAdded ? styles.added : ""}`}
        onClick={onAdd}
        disabled={isAdded}
      >
        {isAdded ? "✓ Added" : "+ Add"}
      </button>
    </div>
  );
};
