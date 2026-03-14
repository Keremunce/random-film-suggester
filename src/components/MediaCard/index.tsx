"use client";

import React from "react";
import Image from "next/image";
import { MediaItem } from "@/app/context/MovieContext";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Trash } from "lucide-react";
import styles from "./style.module.css";

interface MediaCardProps {
  item: MediaItem;
  onUpdate: (item: MediaItem) => void;
  onRemove: (id: string) => void;
  onOpenDetail?: (item: MediaItem) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelectChange?: (checked: boolean) => void;
}

const POSTER_BASE = "https://image.tmdb.org/t/p/w154";

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  onUpdate,
  onRemove,
  onOpenDetail,
  selectable = false,
  selected = false,
  onSelectChange,
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
      <button
        type="button"
        className={styles.openButton}
        onClick={() => onOpenDetail?.(item)}
      >
        <div className={styles.poster}>
          {selectable && (
            <label className={styles.selectBox}>
              <input
                type="checkbox"
                className={styles.selectInput}
                checked={selected}
                onChange={(e) => onSelectChange?.(e.target.checked)}
                aria-label={`Select ${item.title}`}
              />
            </label>
          )}
          <Image
            src={posterUrl}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 200px"
            className={styles.posterImage}
          />
        </div>

        <div className={styles.content}>
          <h3 className={styles.title}>{item.title}</h3>

          <p className={styles.meta}>
            <span className={styles.badge}>
              {item.type === "movie" ? "Movie" : "Series"}
            </span>
            <span className={styles.year}>
              {item.releaseDate ? new Date(item.releaseDate).getFullYear() : "N/A"}
            </span>
          </p>

          <div className={styles.rating}>
            <StarRating value={item.rating} onChange={handleRatingChange} size="sm" />
          </div>
        </div>
      </button>

      <div className={styles.actions}>
        <button
          className={`${styles.statusBtn} ${styles[item.status]}`}
          onClick={handleStatusToggle}
        >
          {item.status === "watched" ? (
            <>
              <FiEyeOff aria-hidden="true" />
              Unwatched
            </>
          ) : (
            <>
              <FiEye aria-hidden="true" />
              Watched
            </>
          )}
        </button>

        <Button
          unstyled
          className={styles.removeBtn}
          onClick={() => onRemove(item.id)}
          title="Remove"
          aria-label="Remove from list"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
