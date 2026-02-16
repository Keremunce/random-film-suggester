"use client";

import React, { useState, useContext, useCallback, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SearchResult } from "@/components/SearchResult";
import { MovieContext } from "@/app/context/MovieContext";
import styles from "./style.module.css";

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

interface SearchResultData {
  tmdbId: number;
  type: "movie" | "tv";
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  overview: string | null;
  voteAverage: number | null;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const context = useContext(MovieContext);
  if (!context) throw new Error("MovieContext not found");

  const { state, dispatch } = context;
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error("Search failed");

      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      setError("Failed to search. Please try again.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);

    // Debounce search
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);
    if (q.trim()) {
      performSearch(q);
    } else {
      setResults([]);
      setError(null);
    }
  }, [searchParams, performSearch]);

  const handleAddItem = (item: SearchResultData) => {
    const newItem = {
      id: generateId(),
      ...item,
      status: "watchlist" as const,
      rating: null,
      addedAt: new Date().toISOString(),
    };

    dispatch({ type: "ADD_ITEM", payload: newItem });
  };

  const isItemAdded = (tmdbId: number) => {
    return state.items.some((item) => item.tmdbId === tmdbId);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Search Movies & Series</h1>
        <p>Find what to watch next from TMDB</p>
      </div>

      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="Search movies, series..."
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          className={styles.input}
          autoFocus
        />
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {isLoading && <div className={styles.loading}>Searching...</div>}

      {results.length === 0 && !isLoading && query && (
        <div className={styles.empty}>No results found</div>
      )}

      {results.length === 0 && !query && !isLoading && (
        <div className={styles.empty}>Start typing to search</div>
      )}

      <div className={styles.results}>
        {results.map((item) => (
          <SearchResult
            key={item.tmdbId}
            tmdbId={item.tmdbId}
            title={item.title}
            type={item.type}
            posterPath={item.posterPath}
            releaseDate={item.releaseDate}
            overview={item.overview}
            voteAverage={item.voteAverage}
            onAdd={() => handleAddItem(item)}
            isAdded={isItemAdded(item.tmdbId)}
          />
        ))}
      </div>
    </div>
  );
}
