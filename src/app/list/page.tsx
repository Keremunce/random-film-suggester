"use client";

import React, { useContext, useState } from "react";
import { MediaCard } from "@/components/MediaCard";
import { MovieContext, MediaItem } from "@/app/context/MovieContext";
import { filterUtils, StatusFilter, TypeFilter } from "@/utils/filters";
import { SegmentedControl } from "@/components/SegmentedControl";
import styles from "./style.module.css";

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
            />
          ))}
        </div>
      )}
    </div>
  );
}
