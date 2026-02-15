"use client";

import React from "react";
import { MediaItem } from "@/app/context/MovieContext";
import { StarRating } from "@/components/StarRating";
import styles from "./style.module.css";

interface MediaCardProps {
  item: MediaItem;
  onUpdate: (item: MediaItem) => void;
  onRemove: (id: string) => void;
}

const POSTER_BASE = "https://image.tmdb.org/t/p/w154";

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  onUpdate,
  onRemove,
}) => {
  const handleStatusToggle = () => {
    const newStatus = item.status === "watched" ? "watchlist" : "watched";
    onUpdate({ ...item, status: newStatus });
  };

  const handleRatingChange = (rating: number | null) => {
    onUpdate({ ...item, rating });
  };

  const posterUrl = item.posterPath
    ? `${POSTER_BASE}${item.posterPath}`
    : "https://via.placeholder.com/154x231?text=No+Poster";

  return (
    <div className={styles.card}>
      <div className={styles.poster}>
        <img src={posterUrl} alt={item.title} loading="lazy" />
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{item.title}</h3>

        <p className={styles.meta}>
          <span className={styles.badge}>{item.type === "movie" ? "🎬" : "📺"}</span>
          <span className={styles.year}>
            {item.releaseDate ? new Date(item.releaseDate).getFullYear() : "N/A"}
          </span>
        </p>

        <div className={styles.rating}>
          <StarRating
            value={item.rating}
            onChange={handleRatingChange}
            size="sm"
          />
        </div>

        <div className={styles.actions}>
          <button
            className={`${styles.statusBtn} ${styles[item.status]}`}
            onClick={handleStatusToggle}
          >
            {item.status === "watched" ? "✓ Watched" : "📋 Watchlist"}
          </button>

          <button
            className={styles.removeBtn}
            onClick={() => onRemove(item.id)}
            title="Remove"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};
