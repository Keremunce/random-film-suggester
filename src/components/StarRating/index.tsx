"use client";

import React from "react";
import styles from "./style.module.css";

interface StarRatingProps {
  value: number | null;
  onChange: (rating: number | null) => void;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  size = "md",
  interactive = true,
}) => {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const displayRating = hoverRating !== null ? hoverRating : value;

  const handleClick = (rating: number) => {
    if (!interactive) return;
    onChange(value === rating ? null : rating);
  };

  const handleKeyDown = (e: React.KeyboardEvent, rating: number) => {
    if (!interactive) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onChange(value === rating ? null : rating);
    }
  };

  return (
    <div className={`${styles.rating} ${styles[size]}`} role="group">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`${styles.star} ${
            displayRating && star <= displayRating ? styles.filled : ""
          }`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => setHoverRating(null)}
          onKeyDown={(e) => handleKeyDown(e, star)}
          disabled={!interactive}
          aria-label={`Rate ${star} stars`}
          role="radio"
          aria-checked={value === star}
        >
          ★
        </button>
      ))}
    </div>
  );
};
