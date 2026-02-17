"use client";

import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { MediaCard } from "@/components/MediaCard";
import { MovieContext, MediaItem } from "@/app/context/MovieContext";
import { filterUtils, StatusFilter, TypeFilter } from "@/utils/filters";
import { SegmentedControl } from "@/components/SegmentedControl";
import styles from "./style.module.css";

const SUGGESTION_STORAGE_KEY = "myList:suggestedMovie";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const POSTER_BASE = "https://image.tmdb.org/t/p/w342";

type StoredSuggestion = {
  id: string;
  at: number;
  rerollCount?: number;
};

export default function MyListPage() {
  const context = useContext(MovieContext);
  if (!context) throw new Error("MovieContext not found");

  const { state, dispatch } = context;
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sortBy, setSortBy] = useState<
    "title-asc" | "title-desc" | "rating-desc" | "rating-asc"
  >("title-asc");
  const [suggestedItem, setSuggestedItem] = useState<MediaItem | null>(null);
  const [suggestionNote, setSuggestionNote] = useState<string | null>(null);
  const [confettiActive, setConfettiActive] = useState(false);
  const [rerollCount, setRerollCount] = useState(0);
  const [suggestedAt, setSuggestedAt] = useState<number | null>(null);
  const [diceAnimating, setDiceAnimating] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const confettiTimerRef = useRef<NodeJS.Timeout | null>(null);
  const diceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const confettiPieces = useMemo(
    () => Array.from({ length: 12 }, (_, index) => index),
    [],
  );

  const filteredItems = filterUtils.filter(state.items, statusFilter, typeFilter);
  const searchedItems = query.trim()
    ? filteredItems.filter((item) =>
        item.title.toLowerCase().includes(query.trim().toLowerCase())
      )
    : filteredItems;

  const sortedItems = [...searchedItems].sort((a, b) => {
    switch (sortBy) {
      case "title-desc":
        return b.title.localeCompare(a.title, undefined, { sensitivity: "base" });
      case "rating-desc": {
        const aRating = a.rating ?? -1;
        const bRating = b.rating ?? -1;
        return bRating - aRating;
      }
      case "rating-asc": {
        const aRating = a.rating ?? -1;
        const bRating = b.rating ?? -1;
        return aRating - bRating;
      }
      case "title-asc":
      default:
        return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
    }
  });

  const handleUpdateItem = (item: MediaItem) => {
    dispatch({ type: "UPDATE_ITEM", payload: item });
  };

  const handleRemoveItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { id } });
  };

  const selectedItems = useMemo(
    () => state.items.filter((item) => selectedIds.has(item.id)),
    [selectedIds, state.items],
  );

  const selectedCount = selectedItems.length;
  const selectedWatchlistCount = selectedItems.filter(
    (item) => item.status === "watchlist",
  ).length;
  const visibleIds = useMemo(() => sortedItems.map((item) => item.id), [sortedItems]);
  const allVisibleSelected = useMemo(
    () => visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id)),
    [selectedIds, visibleIds],
  );

  const handleSelectChange = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleSelectAllVisible = () => {
    if (allVisibleSelected) {
      clearSelection();
      return;
    }
    setSelectedIds(new Set(visibleIds));
  };

  const handleBulkStatus = (status: "watched" | "watchlist") => {
    selectedItems.forEach((item) => {
      if (item.status !== status) {
        dispatch({ type: "UPDATE_ITEM", payload: { ...item, status } });
      }
    });
    clearSelection();
  };

  const handleBulkRemoveWatchlist = () => {
    selectedItems.forEach((item) => {
      if (item.status === "watchlist") {
        dispatch({ type: "REMOVE_ITEM", payload: { id: item.id } });
      }
    });
    clearSelection();
  };

  useEffect(() => {
    return () => {
      if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current);
      if (diceTimerRef.current) clearTimeout(diceTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const raw = typeof window !== "undefined"
      ? window.localStorage.getItem(SUGGESTION_STORAGE_KEY)
      : null;
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as StoredSuggestion | null;
      if (!parsed?.id || !parsed?.at) return;
      const item = state.items.find((entry) => entry.id === parsed.id) ?? null;
      if (!item) {
        window.localStorage.removeItem(SUGGESTION_STORAGE_KEY);
        return;
      }
      setSuggestedItem(item);
      setSuggestedAt(parsed.at);
      setRerollCount(parsed.rerollCount ?? 0);
      if (Date.now() - parsed.at < ONE_DAY_MS) {
        const hoursLeft = Math.ceil((ONE_DAY_MS - (Date.now() - parsed.at)) / 3600000);
        setSuggestionNote(
          `Locked in for today. Come back in ${hoursLeft}h for a new pick.`,
        );
      }
    } catch {
      window.localStorage.removeItem(SUGGESTION_STORAGE_KEY);
    }
  }, [state.items]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const next = new Set<string>();
      state.items.forEach((item) => {
        if (prev.has(item.id)) next.add(item.id);
      });
      return next.size === prev.size ? prev : next;
    });
  }, [state.items]);

  const triggerConfetti = () => {
    if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current);
    setConfettiActive(false);
    requestAnimationFrame(() => setConfettiActive(true));
    confettiTimerRef.current = setTimeout(() => {
      setConfettiActive(false);
    }, 1800);
  };

  const triggerDice = () => {
    if (diceTimerRef.current) clearTimeout(diceTimerRef.current);
    setDiceAnimating(false);
    requestAnimationFrame(() => setDiceAnimating(true));
    diceTimerRef.current = setTimeout(() => {
      setDiceAnimating(false);
    }, 700);
  };

  const handleSuggest = () => {
    const unwatchedMovies = state.items.filter(
      (item) => item.type === "movie" && item.status !== "watched",
    );

    if (unwatchedMovies.length === 0) {
      setSuggestionNote("No unwatched movies to suggest yet.");
      setSuggestedItem(null);
      return;
    }

    const raw = typeof window !== "undefined"
      ? window.localStorage.getItem(SUGGESTION_STORAGE_KEY)
      : null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as StoredSuggestion | null;
        if (parsed?.id && parsed?.at && Date.now() - parsed.at < ONE_DAY_MS) {
          const lockedItem = state.items.find((entry) => entry.id === parsed.id);
          if (lockedItem) {
            setSuggestedItem(lockedItem);
            setSuggestedAt(parsed.at);
            setRerollCount(parsed.rerollCount ?? 0);
            setSuggestionNote("One pick per 24h. That is your movie.");
            return;
          }
        }
      } catch {
        window.localStorage.removeItem(SUGGESTION_STORAGE_KEY);
      }
    }

    const pick =
      unwatchedMovies[Math.floor(Math.random() * unwatchedMovies.length)];
    setSuggestedItem(pick);
    setSuggestedAt(Date.now());
    setRerollCount(0);
    setSuggestionNote("You said you cannot decide. Watch this one.");
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        SUGGESTION_STORAGE_KEY,
        JSON.stringify({ id: pick.id, at: Date.now(), rerollCount: 0 }),
      );
    }
    triggerConfetti();
  };

  const allowJokerReroll = useMemo(() => {
    if (!suggestedItem || suggestedAt === null) return false;
    if (Date.now() - suggestedAt >= ONE_DAY_MS) return false;
    return rerollCount < 1;
  }, [rerollCount, suggestedAt, suggestedItem]);

  const isSuggestionLocked = useMemo(() => {
    if (suggestedAt === null) return false;
    return Date.now() - suggestedAt < ONE_DAY_MS;
  }, [suggestedAt]);

  const handleJokerReroll = () => {
    if (!allowJokerReroll || !suggestedItem || suggestedAt === null) return;
    const candidates = state.items.filter(
      (item) =>
        item.type === "movie" &&
        item.status !== "watched" &&
        item.id !== suggestedItem.id,
    );

    if (candidates.length === 0) {
      setSuggestionNote("No alternative unwatched movies right now.");
      return;
    }

    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    const nextCount = rerollCount + 1;
    setSuggestedItem(pick);
    setRerollCount(nextCount);
    setSuggestionNote(
      nextCount >= 1
        ? "Reroll limit reached. This is your final pick."
        : `Reroll used (${nextCount}/1).`,
    );
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        SUGGESTION_STORAGE_KEY,
        JSON.stringify({ id: pick.id, at: suggestedAt, rerollCount: nextCount }),
      );
    }
    triggerDice();
    triggerConfetti();
  };

  const counts = {
    all: state.items.length,
    watched: state.items.filter((i) => i.status === "watched").length,
    watchlist: state.items.filter((i) => i.status === "watchlist").length,
  };

  const typeCounts = {
    all: statusFilter === "all"
      ? state.items
      : state.items.filter((i) => i.status === statusFilter),
  };

  const typeCountsByStatus = {
    movies: typeCounts.all.filter((i) => i.type === "movie").length,
    series: typeCounts.all.filter((i) => i.type === "tv").length,
    all: typeCounts.all.length,
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>My List</h1>
        <p className={styles.count}>{sortedItems.length} items</p>
      </div>

      <div className={styles.suggestBanner}>
        <button
          type="button"
          className={styles.suggestButton}
          onClick={handleSuggest}
          disabled={isSuggestionLocked}
        >
          <span className={styles.suggestText}>
            <span className={styles.suggestTitle}>Suggest Me</span>
            <span className={styles.suggestSubtitle}>
              {isSuggestionLocked
                ? "Locked for 24h. Come back later."
                : "One pick per 24h. One reroll max."}
            </span>
          </span>
          <span className={styles.suggestOrnament} aria-hidden="true">
            <svg viewBox="0 0 200 90" role="presentation">
              <defs>
                <linearGradient id="spark" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#9ad1ff" stopOpacity="0.6" />
                </linearGradient>
              </defs>
              <circle cx="38" cy="45" r="24" fill="url(#spark)" />
              <circle cx="110" cy="22" r="10" fill="url(#spark)" />
              <circle cx="150" cy="58" r="18" fill="url(#spark)" />
              <path
                d="M20 70 C60 40, 90 80, 150 30"
                stroke="url(#spark)"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </button>
        {suggestionNote && (
          <div className={styles.suggestNote} role="status">
            <span>{suggestionNote}</span>
            <button
              type="button"
              className={`${styles.diceButton} ${diceAnimating ? styles.diceAnimating : ""}`}
              onClick={() => {
                if (!allowJokerReroll) return;
                triggerDice();
                handleJokerReroll();
              }}
              aria-label="Use your one-time reroll"
              title={
                allowJokerReroll
                  ? "Use a reroll"
                  : "Reroll limit reached"
              }
              disabled={!allowJokerReroll}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" />
                <circle cx="8" cy="8" r="1.6" />
                <circle cx="12" cy="12" r="1.6" />
                <circle cx="16" cy="16" r="1.6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {suggestedItem && (
        <div className={styles.suggestedSection}>
          <div className={styles.suggestedCard}>
            <div className={styles.suggestedPoster}>
              <Image
                src={
                  suggestedItem.posterPath
                    ? `${POSTER_BASE}${suggestedItem.posterPath}`
                    : "https://via.placeholder.com/342x513?text=No+Poster"
                }
                alt={suggestedItem.title}
                fill
                sizes="(max-width: 640px) 70vw, 280px"
                className={styles.suggestedPosterImage}
              />
            </div>
            <div className={styles.suggestedContent}>
              <p className={styles.suggestedEyebrow}>Today&apos;s Pick</p>
              <h2 className={styles.suggestedTitle}>{suggestedItem.title}</h2>
              <p className={styles.suggestedMeta}>
                {suggestedItem.type === "movie" ? "Movie" : "Series"}
                <span>•</span>
                {suggestedItem.releaseDate
                  ? new Date(suggestedItem.releaseDate).getFullYear()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className={styles.searchRow}>
        <input
          type="text"
          placeholder="Search in my list..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <SegmentedControl
            ariaLabel="Filter list by status"
            value={statusFilter}
            onChange={setStatusFilter}
            className={styles.segmentedFull}
            stretch
            options={[
              { value: "all", label: `All (${counts.all})` },
              { value: "watched", label: `Watched (${counts.watched})` },
              { value: "watchlist", label: `Watchlist (${counts.watchlist})` },
            ]}
          />
        </div>

        <div className={styles.filterGroup}>
          <SegmentedControl
            ariaLabel="Filter list by type"
            value={typeFilter}
            onChange={setTypeFilter}
            className={styles.segmentedFull}
            stretch
            options={[
              { value: "all", label: `All (${typeCountsByStatus.all})` },
              { value: "movie", label: `Movies (${typeCountsByStatus.movies})` },
              { value: "tv", label: `Series (${typeCountsByStatus.series})` },
            ]}
          />
        </div>

        <div className={styles.filterGroup}>
          <SegmentedControl
            ariaLabel="Sort list"
            value={sortBy}
            onChange={setSortBy}
            className={styles.segmentedFull}
            stretch
            options={[
              { value: "title-asc", label: "A → Z" },
              { value: "title-desc", label: "Z → A" },
              { value: "rating-desc", label: "⭐ High" },
              { value: "rating-asc", label: "⭐ Low" },
            ]}
          />
        </div>
      </div>

      {sortedItems.length > 0 && (
        <div className={styles.selectRow}>
          <button
            type="button"
            className={styles.selectAllButton}
            onClick={handleSelectAllVisible}
          >
            {allVisibleSelected ? "Clear selection" : "Select all"}
          </button>
        </div>
      )}

      {selectedCount > 0 && (
        <div className={styles.bulkBar}>
          <p className={styles.bulkCount}>{selectedCount} selected</p>
          <div className={styles.bulkActions}>
            <button
              type="button"
              className={styles.bulkButton}
              onClick={() => handleBulkStatus("watched")}
            >
              Mark as Watched
            </button>
            <button
              type="button"
              className={styles.bulkButton}
              onClick={() => handleBulkStatus("watchlist")}
            >
              Mark as Unwatched
            </button>
            <button
              type="button"
              className={styles.bulkButton}
              onClick={handleBulkRemoveWatchlist}
              disabled={selectedWatchlistCount === 0}
            >
              Remove from Watchlist
            </button>
            <button
              type="button"
              className={styles.bulkButtonGhost}
              onClick={clearSelection}
            >
              Clear selection
            </button>
          </div>
        </div>
      )}

      {sortedItems.length === 0 ? (
        <div className={styles.empty}>
          <p>No items in your list</p>
          <p className={styles.hint}>Search and add movies or series to get started</p>
        </div>
      ) : (
        <div className={styles.items}>
          {sortedItems.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onUpdate={handleUpdateItem}
              onRemove={handleRemoveItem}
              selectable
              selected={selectedIds.has(item.id)}
              onSelectChange={(checked) => handleSelectChange(item.id, checked)}
            />
          ))}
        </div>
      )}

      <div
        className={`${styles.confetti} ${confettiActive ? styles.confettiActive : ""}`}
        aria-hidden="true"
      >
        <div className={styles.confettiLeft}>
          {confettiPieces.map((piece) => (
            <span
              key={`left-${piece}`}
              className={styles.confettiPiece}
              style={
                {
                  ["--i" as string]: piece,
                  ["--delay" as string]: `${piece * 0.06}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
        <div className={styles.confettiRight}>
          {confettiPieces.map((piece) => (
            <span
              key={`right-${piece}`}
              className={styles.confettiPiece}
              style={
                {
                  ["--i" as string]: piece,
                  ["--delay" as string]: `${piece * 0.06}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
