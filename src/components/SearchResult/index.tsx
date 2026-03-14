"use client";

import React from "react";
import Image from "next/image";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { BookmarkPlus, CheckCircle } from "lucide-react";
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
  onAddWatched?: () => void;
  onOpenDetail?: () => void;
  isPressed?: boolean;
  isAdded?: boolean;
  isWatched?: boolean;
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
  onAddWatched,
  onOpenDetail,
  isPressed = false,
  isAdded = false,
  isWatched = false,
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
    <div
      className={`${styles.result} transition-transform duration-150 ${
        isPressed ? "scale-95" : ""
      }`}
    >
      <button
        type="button"
        className={styles.detailTrigger}
        onClick={onOpenDetail}
      >
        <div className={styles.poster}>
          <Image
            src={posterUrl}
            alt={title}
            width={100}
            height={150}
            className={styles.posterImage}
          />
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
      </button>

      <div className={styles.actions}>
        <Button
          unstyled
          className={`${styles.addBtn} ${isAdded ? styles.added : ""}`}
          onClick={onAdd}
          disabled={isAdded}
        >
          <BookmarkPlus className="mr-2 h-4 w-4" />
          {isAdded ? "Saved" : "Watchlist"}
        </Button>
        {onAddWatched && (
          <Button
            unstyled
            className={`${styles.watchBtn} ${isWatched ? styles.added : ""}`}
            onClick={onAddWatched}
            disabled={isWatched}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {isWatched ? "Watched" : "Watched"}
          </Button>
        )}
      </div>
    </div>
  );
};
