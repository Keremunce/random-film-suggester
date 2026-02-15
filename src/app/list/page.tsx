"use client";

import React, { useContext, useState } from "react";
import { MediaCard } from "@/components/MediaCard";
import { MovieContext, MediaItem } from "@/app/context/MovieContext";
import { filterUtils, StatusFilter, TypeFilter } from "@/utils/filters";
import styles from "./style.module.css";

export default function MyListPage() {
  const context = useContext(MovieContext);
  if (!context) throw new Error("MovieContext not found");

  const { state, dispatch } = context;
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const filteredItems = filterUtils.filter(state.items, statusFilter, typeFilter);

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
    movies: state.items.filter((i) => i.type === "movie").length,
    series: state.items.filter((i) => i.type === "tv").length,
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>My List</h1>
        <p className={styles.count}>{filteredItems.length} items</p>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>Status</label>
          <div className={styles.buttons}>
            {(["all", "watched", "watchlist"] as const).map((status) => (
              <button
                key={status}
                className={`${styles.filterBtn} ${
                  statusFilter === status ? styles.active : ""
                }`}
                onClick={() => setStatusFilter(status)}
              >
                {status === "all"
                  ? `All (${counts.all})`
                  : status === "watched"
                    ? `✓ Watched (${counts.watched})`
                    : `📋 Watchlist (${counts.watchlist})`}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label>Type</label>
          <div className={styles.buttons}>
            {(["all", "movie", "tv"] as const).map((type) => (
              <button
                key={type}
                className={`${styles.filterBtn} ${
                  typeFilter === type ? styles.active : ""
                }`}
                onClick={() => setTypeFilter(type)}
              >
                {type === "all"
                  ? `All (${counts.all})`
                  : type === "movie"
                    ? `🎬 Movies (${counts.movies})`
                    : `📺 Series (${counts.series})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className={styles.empty}>
          <p>No items in your list</p>
          <p className={styles.hint}>Search and add movies or series to get started</p>
        </div>
      ) : (
        <div className={styles.items}>
          {filteredItems.map((item) => (
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
