"use client";

import React from "react";
import Image from "next/image";
import { BookmarkPlus, CheckCircle } from "lucide-react";
import styles from "./style.module.css";

export type DiscoveryCardItem = {
  tmdbId: number;
  type: "movie" | "tv";
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  voteAverage: number | null;
};

interface DiscoveryCardProps {
  item: DiscoveryCardItem;
  isSaved: boolean;
  isWatched?: boolean;
  onOpen: () => void;
  onWatchlistAction: () => void;
  onMarkWatched?: () => void;
}

const POSTER_BASE = "https://image.tmdb.org/t/p/w342";

const formatYear = (date: string | null) =>
  date ? new Date(date).getFullYear() : "N/A";

export const DiscoveryCard: React.FC<DiscoveryCardProps> = ({
  item,
  isSaved,
  isWatched = false,
  onOpen,
  onWatchlistAction,
  onMarkWatched,
}) => {
  const posterUrl = item.posterPath
    ? `${POSTER_BASE}${item.posterPath}`
    : "https://via.placeholder.com/342x513?text=No+Poster";

  return (
    <article className={styles.card}>
      <div className={styles.poster}>
        <button
          type="button"
          className={styles.posterButton}
          onClick={onOpen}
          aria-label={`Open details for ${item.title}`}
        >
          <Image
            src={posterUrl}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 180px"
            className={styles.posterImage}
          />
        </button>
        <span className={styles.typeBadge}>
          {item.type === "movie" ? "Movie" : "Series"}
        </span>
        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.actionButton} ${isSaved ? styles.active : ""}`}
            onClick={onWatchlistAction}
            title={isSaved ? "Remove from watchlist" : "Add to watchlist"}
            aria-pressed={isSaved}
            aria-label={
              isSaved
                ? `Remove ${item.title} from watchlist`
                : `Add ${item.title} to watchlist`
            }
          >
            <BookmarkPlus aria-hidden="true" />
          </button>
          {onMarkWatched && (
            <button
              type="button"
              className={`${styles.actionButton} ${isWatched ? styles.active : ""}`}
              onClick={onMarkWatched}
              disabled={isWatched}
              title={isWatched ? "Already marked as watched" : "Mark as watched"}
              aria-label={`Mark ${item.title} as watched`}
            >
              <CheckCircle aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      <button
        type="button"
        className={styles.infoButton}
        onClick={onOpen}
        aria-label={`Open details for ${item.title}`}
      >
        <span className={styles.title} title={item.title}>
          <span className={styles.titleText}>{item.title}</span>
        </span>
        <span className={styles.meta}>
          <span>{formatYear(item.releaseDate)}</span>
          {item.voteAverage ? <span>• {item.voteAverage.toFixed(1)}</span> : null}
        </span>
      </button>
    </article>
  );
};
