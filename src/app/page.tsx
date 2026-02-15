"use client";

import React, { useContext } from "react";
import Link from "next/link";
import { MovieContext } from "@/app/context/MovieContext";
import styles from "./page.module.css";

export default function HomePage() {
  const context = useContext(MovieContext);
  if (!context) throw new Error("MovieContext not found");

  const { state } = context;

  const stats = {
    total: state.items.length,
    watched: state.items.filter((i) => i.status === "watched").length,
    watchlist: state.items.filter((i) => i.status === "watchlist").length,
  };

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1>🎬 Media Tracker</h1>
        <p>Own your watch history. Local-first. No login. Full data export.</p>
      </div>

      <div className={styles.quickStats}>
        <div className={styles.stat}>
          <div className={styles.number}>{stats.total}</div>
          <div className={styles.label}>Total Items</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.number}>{stats.watched}</div>
          <div className={styles.label}>Watched</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.number}>{stats.watchlist}</div>
          <div className={styles.label}>Watchlist</div>
        </div>
      </div>

      <div className={styles.cta}>
        <Link href="/search" className={styles.button}>
          🔍 Search Movies & Series
        </Link>
        <Link href="/list" className={styles.button}>
          📋 View My List
        </Link>
      </div>

      <div className={styles.features}>
        <h2>Features</h2>
        <ul>
          <li>🔎 Search from TMDB database</li>
          <li>⭐ Rate movies and series 1-5 stars</li>
          <li>🏷️ Tag as &quot;Watched&quot; or &quot;Watchlist&quot;</li>
          <li>📊 Filter by status and type</li>
          <li>💾 All data stored locally</li>
          <li>📥 Import/Export JSON & CSV</li>
          <li>📱 Mobile-friendly design</li>
        </ul>
      </div>

      <div className={styles.privacy}>
        <h3>Privacy First</h3>
        <p>
          Your data never leaves your device. No tracking, no backend, no authentication required.
          Full control over your library with export and import capabilities.
        </p>
      </div>
    </div>
  );
}
