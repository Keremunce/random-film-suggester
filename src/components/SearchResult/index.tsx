"use client";

import React from "react";
import styles from "./style.module.css";

interface SearchResultProps {
  tmdbId: number;
  title: string;
  type: "movie" | "tv";
  posterPath: string | null;
  releaseDate: string | null;
  onAdd: () => void;
  isAdded?: boolean;
}

const POSTER_BASE = "https://image.tmdb.org/t/p/w154";

export const SearchResult: React.FC<SearchResultProps> = ({
  title,
  type,
  posterPath,
  releaseDate,
  onAdd,
  isAdded = false,
}) => {
  const posterUrl = posterPath
    ? `${POSTER_BASE}${posterPath}`
    : "https://via.placeholder.com/154x231?text=No+Poster";

  const year = releaseDate ? new Date(releaseDate).getFullYear() : "N/A";

  return (
    <div className={styles.result}>
      <div className={styles.poster}>
        <img src={posterUrl} alt={title} loading="lazy" />
      </div>

      <div className={styles.info}>
        <h4 className={styles.title}>{title}</h4>
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
