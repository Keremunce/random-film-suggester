"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MediaItem } from "@/app/context/MovieContext";
import { StarRating } from "@/components/StarRating";
import { Eye, EyeOff, Star, Trash } from "lucide-react";
import styles from "./style.module.css";

interface MediaCardProps {
  item: MediaItem;
  onUpdate: (item: MediaItem) => void;
  onRemove: (id: string) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelectChange?: (checked: boolean) => void;
}

const POSTER_BASE = "https://image.tmdb.org/t/p/w500";

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  onUpdate,
  onRemove,
  selectable = false,
  selected = false,
  onSelectChange,
}) => {
  const [ratingOpen, setRatingOpen] = useState(false);

  const handleStatusToggle = () => {
    const newStatus = item.status === "watched" ? "watchlist" : "watched";
    onUpdate({ ...item, status: newStatus });
  };

  const handleRatingChange = (rating: number | null) => {
    onUpdate({ ...item, rating });
    setRatingOpen(false);
  };

  const posterUrl = item.posterPath
    ? `${POSTER_BASE}${item.posterPath}`
    : "https://via.placeholder.com/500x750?text=No+Poster";

  return (
    <div className={styles.card}>
      <div className={styles.poster}>
        <Link
          href={`/detail/${item.type}/${item.tmdbId}`}
          className={styles.posterLink}
          aria-label={`Open details for ${item.title}`}
        >
          <Image
            src={posterUrl}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 900px) 28vw, (max-width: 1200px) 19vw, (max-width: 1600px) 15vw, 14vw"
            className={styles.posterImage}
          />
        </Link>
        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.statusBtn} ${styles[item.status]}`}
            onClick={handleStatusToggle}
            title={item.status === "watched" ? "Mark as unwatched" : "Mark as watched"}
            aria-label={item.status === "watched" ? "Mark as unwatched" : "Mark as watched"}
          >
            {item.status === "watched" ? (
              <EyeOff aria-hidden="true" />
            ) : (
              <Eye aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            className={styles.removeBtn}
            onClick={() => onRemove(item.id)}
            title={`Remove ${item.title} from list`}
            aria-label={`Remove ${item.title} from list`}
          >
            <Trash aria-hidden="true" />
          </button>
        </div>
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
      </div>
      <div className={styles.content}>
        <Link href={`/detail/${item.type}/${item.tmdbId}`} className={styles.openButton}>
          <h3 className={styles.title} title={item.title}>
            <span className={styles.titleText}>{item.title}</span>
          </h3>
        </Link>
        <div className={styles.metaRow}>
          <p className={styles.meta}>
            <span className={styles.badge}>
              {item.type === "movie" ? "Movie" : "Series"}
            </span>
            <span className={styles.year}>
              {item.releaseDate ? new Date(item.releaseDate).getFullYear() : "N/A"}
            </span>
          </p>
          <div className={styles.rating}>
            <button
              type="button"
              className={styles.ratingTrigger}
              onClick={() => setRatingOpen((open) => !open)}
              aria-label={
                item.rating === null
                  ? `Rate ${item.title}`
                  : `Rated ${item.rating} out of 10. Change rating`
              }
              aria-haspopup="dialog"
              aria-expanded={ratingOpen}
              title={item.rating === null ? "Rate" : `Rating: ${item.rating}/10`}
            >
              <Star aria-hidden="true" />
              <span>{item.rating === null ? "Rate" : `${item.rating}/10`}</span>
            </button>
            <div
              className={`${styles.ratingPopover} ${ratingOpen ? styles.ratingPopoverOpen : ""}`}
              role="dialog"
              aria-label={`Rate ${item.title}`}
            >
              <StarRating
                value={item.rating}
                onChange={handleRatingChange}
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
