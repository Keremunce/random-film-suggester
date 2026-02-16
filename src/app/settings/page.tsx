"use client";

import React, { useContext, useRef } from "react";
import { FiUploadCloud } from "react-icons/fi";
import { MovieContext } from "@/app/context/MovieContext";
import { exportUtils } from "@/utils/export";
import { importUtils } from "@/utils/import";
import styles from "./style.module.css";

type ExportFormat = "json" | "csv";
type ExportFilter = "all" | "movies" | "series";

export default function SettingsPage() {
  const context = useContext(MovieContext);
  if (!context) throw new Error("MovieContext not found");

  const { state, dispatch } = context;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = (format: ExportFormat, filter: ExportFilter) => {
    if (state.items.length === 0) {
      alert("No items to export");
      return;
    }

    if (format === "json") {
      exportUtils.toJSON(state.items, filter);
    } else {
      exportUtils.toCSV(state.items, filter);
    }
  };

  const handleImport = async (file: File) => {
    try {
      const imported = await importUtils.fromJSON(file);

      // Merge with existing items, avoiding duplicates by tmdbId
      const existingIds = new Set(state.items.map((item) => item.tmdbId));
      const newItems = imported.filter(
        (item) => !existingIds.has(item.tmdbId)
      );

      // Add all new items
      newItems.forEach((item) => {
        dispatch({ type: "ADD_ITEM", payload: item });
      });

      alert(`Imported ${newItems.length} new items. ${imported.length - newItems.length} duplicates skipped.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to import";
      alert(`Import error: ${msg}`);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImport(file);
    }
  };

  const itemCount = state.items.length;
  const watchedCount = state.items.filter((i) => i.status === "watched").length;
  const watchlistCount = state.items.filter((i) => i.status === "watchlist").length;
  const movieCount = state.items.filter((i) => i.type === "movie").length;
  const seriesCount = state.items.filter((i) => i.type === "tv").length;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Settings & Data</h1>
        <p>Manage your library</p>
      </div>

      {/* Stats */}
      <section className={styles.section}>
        <h2>Library Stats</h2>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.value}>{itemCount}</span>
            <span className={styles.label}>Total</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.value}>{watchedCount}</span>
            <span className={styles.label}>Watched</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.value}>{watchlistCount}</span>
            <span className={styles.label}>Watchlist</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.value}>{movieCount}</span>
            <span className={styles.label}>Movies</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.value}>{seriesCount}</span>
            <span className={styles.label}>Series</span>
          </div>
        </div>
      </section>

      {/* Export */}
      <section className={styles.section}>
        <h2>Export Data</h2>
        <p className={styles.desc}>Download your library as JSON or CSV</p>

        <div className={styles.exportGrid}>
          <div className={styles.formatBox}>
            <h3>JSON Format</h3>
            <p className={styles.note}>Full data with all fields</p>
            <div className={styles.buttons}>
              <button
                onClick={() => handleExport("json", "all")}
                className={styles.btn}
              >
                All Items
              </button>
              <button
                onClick={() => handleExport("json", "movies")}
                className={styles.btn}
              >
                Movies Only
              </button>
              <button
                onClick={() => handleExport("json", "series")}
                className={styles.btn}
              >
                Series Only
              </button>
            </div>
          </div>

          <div className={styles.formatBox}>
            <h3>CSV Format</h3>
            <p className={styles.note}>Spreadsheet friendly</p>
            <div className={styles.buttons}>
              <button
                onClick={() => handleExport("csv", "all")}
                className={styles.btn}
              >
                All Items
              </button>
              <button
                onClick={() => handleExport("csv", "movies")}
                className={styles.btn}
              >
                Movies Only
              </button>
              <button
                onClick={() => handleExport("csv", "series")}
                className={styles.btn}
              >
                Series Only
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Import */}
      <section className={styles.section}>
        <h2>Import Data</h2>
        <p className={styles.desc}>Upload a previously exported JSON file</p>

        <div className={styles.uploadBox}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className={styles.fileInput}
            id="file-input"
          />
          <label htmlFor="file-input" className={styles.uploadLabel}>
            <span className={styles.icon} aria-hidden="true">
              <FiUploadCloud />
            </span>
            <span className={styles.text}>
              Click to select JSON file or drag and drop
            </span>
          </label>
        </div>

        <p className={styles.hint}>
          Duplicates (same TMDB ID) will be skipped. Your existing items will not be removed.
        </p>
      </section>

      {/* Danger Zone */}
      <section className={`${styles.section} ${styles.danger}`}>
        <h2>Danger Zone</h2>
        <button
          onClick={() => {
            if (
              window.confirm(
                "Are you sure? This will clear all items from your library. This cannot be undone."
              )
            ) {
              dispatch({ type: "SET_ITEMS", payload: [] });
              alert("Library cleared");
            }
          }}
          className={styles.dangerBtn}
        >
          Clear All Data
        </button>
      </section>
    </div>
  );
}
