"use client";

import React, { useEffect } from "react";
import styles from "./style.module.css";

type StatusVariant = "success" | "error";

type StatusModalProps = {
  open: boolean;
  variant: StatusVariant;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  onClose: () => void;
};

export const StatusModal: React.FC<StatusModalProps> = ({
  open,
  variant,
  title,
  description,
  actionLabel,
  onAction,
  onClose,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="status-modal-title"
        className={`${styles.modal} ${styles[variant]}`}
      >
        <div className={styles.iconWrap} aria-hidden="true">
          {variant === "success" ? (
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path d="M7 12l3 3 7-7" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 8l8 8M16 8l-8 8" />
            </svg>
          )}
        </div>
        <div className={styles.content}>
          <h2 id="status-modal-title" className={styles.title}>
            {title}
          </h2>
          <p className={styles.description}>{description}</p>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.actionBtn} onClick={onAction}>
            {actionLabel}
          </button>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
